import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/navigation/RootNavigator';
import { useTheme } from '~/hooks/useTheme';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';
import { ChevronLeft, Send, Image as ImageIcon, X, Reply, Trash2, CornerUpLeft } from 'lucide-react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { OptionsModal } from '~/components/common/OptionsModal';
import {
  useChatMessagesQuery,
  ChatMessage,
  useDeleteMessageMutation,
  useConversationsQuery,
  appendMessageToCache,
  removeTempMessageFromCache,
} from '~/queries/chat/chatQueries';
import { useAuthStore } from '~/store/authStore';
import { useChatStore } from '~/store/chatStore';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import Reanimated, { FadeInDown, Layout } from 'react-native-reanimated';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatRoom'>;

const MessageItem = memo(({ item, isOwn, theme, onAction, onReply, onScrollToMessage, isHighlighted, currentUserId }: any) => {
  const swipeableRef = useRef<Swipeable>(null);

  const renderLeftActions = (progress: any, dragX: any) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [-20, 0, 0, 1],
    });
    return (
      <View style={styles.replyActionContainer}>
        <Animated.View style={[styles.replyActionIcon, { transform: [{ translateX: trans }] }]}>
          <Reply size={24} color={theme.textPrimary} />
        </Animated.View>
      </View>
    );
  };

  if (item.isDeleted) {
    return (
      <View style={[styles.messageBubble, isOwn ? styles.ownBubble : styles.otherBubble, { backgroundColor: theme.surfaceSecondary }]}>
        <Text style={[styles.messageText, { color: theme.textSecondary, fontStyle: 'italic' }]}>Message deleted</Text>
      </View>
    );
  }

  return (
    <Reanimated.View entering={FadeInDown.springify().mass(0.5).damping(12)} layout={Layout.springify().damping(12)}>
      <Swipeable
        ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      onSwipeableWillOpen={(direction) => {
        if (direction === 'left') {
          swipeableRef.current?.close();
          onReply(item);
        }
      }}
      overshootLeft={false}
      leftThreshold={50}
    >
      <TouchableOpacity 
        onLongPress={() => onAction(item)}
        activeOpacity={0.7}
        style={[
          styles.messageBubble, 
          isOwn ? [styles.ownBubble, { backgroundColor: theme.primary }] : [styles.otherBubble, { backgroundColor: theme.surfaceSecondary }],
          isHighlighted && { backgroundColor: theme.primary + '80' },
          // Slight opacity for optimistic messages to give visual feedback
          item._isOptimistic && { opacity: 0.7 },
        ]}
      >
        {item.replyTo && (
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => onScrollToMessage(item.replyTo.id)}
            style={[styles.replyQuote, { borderLeftColor: isOwn ? 'rgba(255,255,255,0.5)' : theme.primary, backgroundColor: isOwn ? 'rgba(255,255,255,0.1)' : theme.background }]}
          >
            <Text style={[styles.replyQuoteUser, { color: isOwn ? 'rgba(255,255,255,0.9)' : theme.textPrimary }]}>
              {item.replyTo.sender?.username || 'User'}
            </Text>
            {item.replyTo.content ? (
              <Text numberOfLines={1} style={[styles.replyQuoteText, { color: isOwn ? 'rgba(255,255,255,0.7)' : theme.textSecondary }]}>
                {item.replyTo.content}
              </Text>
            ) : item.replyTo.media && item.replyTo.media.length > 0 ? (
              <Text style={[styles.replyQuoteText, { color: isOwn ? 'rgba(255,255,255,0.7)' : theme.textSecondary }]}>[Media]</Text>
            ) : null}
          </TouchableOpacity>
        )}
        {item.media && item.media.length > 0 && (
          <View style={styles.mediaContainer}>
            {item.media.map((m: any) => (
              <Image key={m.id} source={{ uri: m.mediaUrl }} style={styles.messageImage} />
            ))}
          </View>
        )}
        {item.content ? (
          <Text style={[styles.messageText, { color: isOwn ? '#fff' : theme.textPrimary }]}>
            {item.content}
          </Text>
        ) : null}
        <Text style={[styles.timestamp, { color: isOwn ? 'rgba(255,255,255,0.7)' : theme.textSecondary }]}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </TouchableOpacity>
    </Swipeable>
    </Reanimated.View>
  );
});

export function ChatRoomScreen({ route, navigation }: Props) {
  const { conversationId: routeConversationId, recipientId, recipientUsername } = route.params;
  const { theme } = useTheme();
  const currentUserId = useAuthStore(state => state.user?.id);
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList>(null);

  const handleReply = useCallback((msg: ChatMessage) => {
    setReplyingTo(msg);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, []);
  
  const { socket, connect, isConnected } = useChatStore();

  // Track pending optimistic message IDs so we can reconcile when the server
  // echoes back the real message via socket.
  const pendingTempIdsRef = useRef<Set<string>>(new Set());

  // --- Resolve conversationId ---
  // The route may or may not supply one (e.g. when starting a new chat from
  // friend search). Fall back to the conversations cache.
  const { data: conversations } = useConversationsQuery();
  const existingConv = conversations?.find(c => c.otherUser?.id === recipientId);

  // BUG FIX: was using `existingConv?.id` — the field is `conversationId`
  const conversationId = routeConversationId || existingConv?.conversationId;

  // Track the latest resolved conversationId in a ref so we can use it inside
  // socket callbacks without stale closures.
  const conversationIdRef = useRef(conversationId);
  conversationIdRef.current = conversationId;

  const deleteMutation = useDeleteMessageMutation(conversationId || 'temp');

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Initialize Socket ---
  useEffect(() => {
    if (!socket) connect();
  }, [socket, connect]);

  // --- Fetch message history ---
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useChatMessagesQuery(conversationId || '');

  const messages = useMemo(() => {
    if (!data) return [];
    // The backend returns oldest -> newest within a batch.
    // For an inverted FlatList, we need newest at index 0.
    const allMessages = data.pages.flatMap(page => page);
    
    const populated = allMessages.map(msg => {
      if (msg.replyToId && !msg.replyTo) {
        const quotedMsg = allMessages.find(m => m.id === msg.replyToId);
        if (quotedMsg) {
          return {
            ...msg,
            replyTo: {
              id: quotedMsg.id,
              content: quotedMsg.content,
              isDeleted: quotedMsg.isDeleted,
              sender: quotedMsg.sender || { id: quotedMsg.senderId, username: 'User', profileImage: null, fullName: '' },
              media: quotedMsg.media,
            }
          };
        }
      }
      return msg;
    });

    return [...populated].reverse();
  }, [data]);

  // --- Socket event listeners ---
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (payload: { conversationId: string; message: ChatMessage }) => {
      const activeConvId = conversationIdRef.current;

      if (
        payload.conversationId === activeConvId ||
        (!activeConvId && (payload.message.senderId === recipientId || payload.message.senderId === currentUserId))
      ) {
        // If we have a pending optimistic message from the same sender,
        // remove the temp message and append the real one.
        const tempIds = pendingTempIdsRef.current;
        if (payload.message.senderId === currentUserId && tempIds.size > 0) {
          // Remove the oldest pending temp message (FIFO order)
          const firstTempId = tempIds.values().next().value;
          if (firstTempId) {
            tempIds.delete(firstTempId);
            removeTempMessageFromCache(queryClient, payload.conversationId, firstTempId);
          }
        }

        // Salvage replyTo metadata from the optimistic temp message if the backend drops it
        let finalMessage = { ...payload.message };
        const allMessages = data?.pages.flatMap((p: ChatMessage[]) => p) || [];
        
        if (finalMessage.replyToId && !finalMessage.replyTo) {
          const quotedMsg = allMessages.find((m: ChatMessage) => m.id === finalMessage.replyToId);
          if (quotedMsg) {
            finalMessage.replyTo = {
              id: quotedMsg.id,
              content: quotedMsg.content,
              isDeleted: quotedMsg.isDeleted,
              sender: quotedMsg.sender || { id: quotedMsg.senderId, username: 'User', profileImage: null, fullName: '' },
              media: quotedMsg.media,
            };
          }
        }

        // Append the real server message (the helper deduplicates by id)
        appendMessageToCache(queryClient, payload.conversationId, finalMessage);

        // If we just discovered the conversationId for a new chat, update the
        // ref so subsequent messages use it.
        if (!activeConvId) {
          conversationIdRef.current = payload.conversationId;
        }

        // Mark as read if the message is from the other user
        if (payload.message.senderId !== currentUserId) {
          socket.emit('chat:read', {
            conversationId: payload.conversationId,
            senderId: payload.message.senderId,
          });
        }
      }

      // Always refresh the conversations list so last message / unread dots update
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    const handleTyping = (payload: { senderId: string }) => {
      if (payload.senderId === recipientId) setOtherUserTyping(true);
    };

    const handleStopTyping = (payload: { senderId: string }) => {
      if (payload.senderId === recipientId) setOtherUserTyping(false);
    };

    socket.on('chat:message', handleNewMessage);
    socket.on('chat:typing', handleTyping);
    socket.on('chat:stop_typing', handleStopTyping);

    // If we just opened the room and have a conversationId, emit read
    if (conversationId) {
      socket.emit('chat:read', { conversationId, senderId: recipientId });
    }

    return () => {
      socket.off('chat:message', handleNewMessage);
      socket.off('chat:typing', handleTyping);
      socket.off('chat:stop_typing', handleStopTyping);
    };
  }, [socket, isConnected, conversationId, recipientId, queryClient, currentUserId, data]);

  // --- Invalidate conversations list when leaving the chat room ---
  // This ensures the chat list shows updated read status and last message.
  useEffect(() => {
    return () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };
  }, [queryClient]);

  // --- Image picker ---
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 4,
      quality: 0.7,
    });
    if (!result.canceled && result.assets) {
      setImages(result.assets.map(a => a.uri));
    }
  };

  // --- Upload media ---
  const uploadMedia = async (): Promise<any[]> => {
    if (images.length === 0) return [];

    const token = useAuthStore.getState().accessToken;
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://glunity.onrender.com';

    // The backend uses chatUpload.single('file'), so we must upload them one by one
    const uploadPromises = images.map(async (uri, index) => {
      const formData = new FormData();
      const filename = uri.split('/').pop() || `image_${index}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('file', {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        name: filename,
        type,
      } as any);

      const response = await fetch(`${API_BASE_URL}/api/chat/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      const json = await response.json();
      return json.data; // This is a single media object: { mediaUrl, mediaType }
    });

    // Wait for all uploads to complete
    const uploadedMediaObjects = await Promise.all(uploadPromises);
    return uploadedMediaObjects;
  };

  // --- Send message ---
  const handleSend = async () => {
    if (!content.trim() && images.length === 0) return;
    if (!socket || !isConnected) return;

    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const messageContent = content.trim();

    // Optimistic UI
    const tempMessage: ChatMessage = {
      id: tempId,
      conversationId: conversationId || '',
      senderId: currentUserId!,
      content: messageContent,
      messageType: 'text',
      storyId: null,
      reactionEmoji: null,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      media: images.map(uri => ({ id: uri, mediaUrl: uri, mediaType: 'image' as const, thumbnailUrl: null })),
      replyToId: replyingTo?.id || null,
      replyTo: replyingTo ? {
        id: replyingTo.id,
        content: replyingTo.content,
        isDeleted: replyingTo.isDeleted,
        sender: replyingTo.sender || { id: replyingTo.senderId, username: replyingTo.senderId === currentUserId ? 'You' : recipientUsername, profileImage: null, fullName: '' },
        media: replyingTo.media,
      } : undefined,
      _isOptimistic: true,
    };

    setContent('');
    setImages([]);
    const currentReplyToId = replyingTo?.id || null;
    setReplyingTo(null);
    socket.emit('chat:stop_typing', { recipientId });

    // Track the temp ID so we can reconcile when the server response arrives
    pendingTempIdsRef.current.add(tempId);

    if (conversationId) {
      appendMessageToCache(queryClient, conversationId, tempMessage);
    }

    setTimeout(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 100);

    try {
      let uploadedMedia: any[] = [];
      if (tempMessage.media.length > 0) {
        uploadedMedia = await uploadMedia();
      }

      socket.emit('chat:send', {
        recipientId,
        content: messageContent,
        media: uploadedMedia,
        replyToId: currentReplyToId,
      });

      // The server will respond with 'chat:message' via socket.
      // handleNewMessage will remove the temp message and insert the real one.

    } catch (err) {
      Alert.alert('Error', 'Failed to send message');
      // Revert optimistic update
      pendingTempIdsRef.current.delete(tempId);
      if (conversationId) {
        removeTempMessageFromCache(queryClient, conversationId, tempId);
      }
    }
  };

  // --- Typing indicator ---
  const handleTextChange = (text: string) => {
    setContent(text);
    if (!socket || !isConnected) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('chat:typing', { recipientId });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('chat:stop_typing', { recipientId });
    }, 2000);
  };

  const handleMessageAction = useCallback((msg: ChatMessage) => {
    if (msg.isDeleted) return;
    setSelectedMessage(msg);
    setOptionsModalVisible(true);
  }, []);

  const handleScrollToMessage = useCallback((messageId: string) => {
    const index = messages.findIndex(m => m.id === messageId);
    if (index !== -1) {
      // Scroll to the message (viewPosition 0.5 centers it on screen)
      flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      setHighlightedMessageId(messageId);
      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 2000);
    }
  }, [messages]);

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
    const isOwn = item.senderId === currentUserId;
    const isHighlighted = item.id === highlightedMessageId;
    return (
      <MessageItem 
        item={item} 
        isOwn={isOwn} 
        theme={theme} 
        onAction={handleMessageAction} 
        onReply={handleReply} 
        onScrollToMessage={handleScrollToMessage}
        isHighlighted={isHighlighted}
        currentUserId={currentUserId}
      />
    );
  }, [currentUserId, theme, handleMessageAction, handleReply, handleScrollToMessage, highlightedMessageId]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={styles.container}
      >
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <ChevronLeft size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: recipientId })}>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>@{recipientUsername}</Text>
          </TouchableOpacity>
          <View style={{ width: 40 }} />
        </View>

        {isLoading ? (
          <ActivityIndicator style={{ flex: 1 }} color={theme.primary} />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            inverted
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            contentContainerStyle={styles.listContent}
          />
        )}

        {otherUserTyping && (
          <Text style={[styles.typingText, { color: theme.textSecondary }]}>{recipientUsername} is typing...</Text>
        )}

        {images.length > 0 && (
          <View style={styles.imagePreviewContainer}>
            {images.map((uri, idx) => (
              <View key={idx} style={styles.imagePreviewWrapper}>
                <Image source={{ uri }} style={styles.previewImg} />
                <TouchableOpacity style={styles.removeImgBtn} onPress={() => setImages(prev => prev.filter((_, i) => i !== idx))}>
                  <X size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {replyingTo && (
          <View style={[styles.replyPreviewContainer, { borderTopColor: theme.border, backgroundColor: theme.surfaceSecondary }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.replyPreviewTitle, { color: theme.primary }]}>
                Replying to {replyingTo.sender?.username || (replyingTo.senderId === currentUserId ? 'You' : recipientUsername)}
              </Text>
              <Text numberOfLines={1} style={[styles.replyPreviewText, { color: theme.textSecondary }]}>
                {replyingTo.content || '[Media]'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyingTo(null)} style={styles.replyPreviewClose}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
        <View style={[styles.inputRow, { borderTopColor: theme.border }]}>
          <TouchableOpacity onPress={handlePickImage} style={styles.attachBtn}>
            <ImageIcon size={24} color={theme.primary} />
          </TouchableOpacity>
          <TextInput
            ref={inputRef}
            style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.textPrimary }]}
            placeholder="Message..."
            placeholderTextColor={theme.textSecondary}
            value={content}
            onChangeText={handleTextChange}
            multiline
          />
          <TouchableOpacity onPress={handleSend} disabled={!content.trim() && images.length === 0} style={styles.sendBtn}>
            <Send size={24} color={(content.trim() || images.length > 0) ? theme.primary : theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <OptionsModal
          visible={optionsModalVisible}
          onClose={() => setOptionsModalVisible(false)}
          options={
            selectedMessage
              ? [
                  { label: 'Reply', icon: <CornerUpLeft size={20} color={theme.textPrimary} />, onPress: () => handleReply(selectedMessage) },
                  ...(selectedMessage.senderId === currentUserId
                    ? [{ label: 'Delete Message', icon: <Trash2 size={20} color={theme.danger} />, onPress: () => deleteMutation.mutate(selectedMessage.id), isDestructive: true }]
                    : []),
                ]
              : []
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
  },
  listContent: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 22,
    marginBottom: 8,
  },
  ownBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 6,
  },
  otherBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: typography.sizes.md,
    lineHeight: 20,
  },
  mediaContainer: {
    marginBottom: 8,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  typingText: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontStyle: 'italic',
    fontSize: typography.sizes.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  attachBtn: {
    padding: 8,
    marginBottom: 4,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    marginHorizontal: 8,
  },
  sendBtn: {
    padding: 8,
    marginBottom: 4,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  imagePreviewWrapper: {
    marginRight: 8,
    position: 'relative',
  },
  previewImg: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  removeImgBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 4,
  },
  replyPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  replyPreviewTitle: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    marginBottom: 2,
  },
  replyPreviewText: {
    fontSize: 14,
  },
  replyActionContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 16,
    width: 60,
  },
  replyActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyPreviewClose: {
    padding: 8,
  },
  replyQuote: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    paddingVertical: 4,
    marginBottom: 6,
    borderRadius: 4,
  },
  replyQuoteUser: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    marginBottom: 2,
  },
  replyQuoteText: {
    fontSize: 14,
  }
});
