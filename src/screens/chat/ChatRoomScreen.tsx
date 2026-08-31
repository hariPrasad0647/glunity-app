import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/navigation/RootNavigator';
import { useTheme } from '~/hooks/useTheme';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';
import { ChevronLeft, Send, Image as ImageIcon, X } from 'lucide-react-native';
import { useChatMessagesQuery, ChatMessage, useDeleteMessageMutation, useConversationsQuery } from '~/queries/chat/chatQueries';
import { useAuthStore } from '~/store/authStore';
import { useChatStore } from '~/store/chatStore';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatRoom'>;

export function ChatRoomScreen({ route, navigation }: Props) {
  const { conversationId: routeConversationId, recipientId, recipientUsername } = route.params;
  const { theme } = useTheme();
  const currentUserId = useAuthStore(state => state.user?.id);
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  
  const { socket, connect, isConnected } = useChatStore();
  
  // Find conversationId if not provided in route params
  const { data: conversations } = useConversationsQuery();
  const existingConv = conversations?.find(c => c.otherUser?.id === recipientId);
  const conversationId = routeConversationId || existingConv?.id;

  const deleteMutation = useDeleteMessageMutation(conversationId || 'temp');
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Socket
  useEffect(() => {
    if (!socket) connect();
  }, [socket, connect]);

  // Fetch message history
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
    return [...allMessages].reverse();
  }, [data]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (payload: { conversationId: string, message: ChatMessage }) => {
      if (payload.conversationId === conversationId || (!conversationId && payload.message.senderId === recipientId)) {
        // Append message to the cache
        queryClient.setQueryData(['chatMessages', payload.conversationId], (oldData: any) => {
          if (!oldData) return oldData;
          
          // Prevent duplicates
          const exists = oldData.pages.some((page: ChatMessage[]) => page.some(m => m.id === payload.message.id));
          if (exists) return oldData;

          const newPages = [...oldData.pages];
          // Backend sends oldest->newest, so newest goes at the end of the first page (or technically we can just append to page 0)
          newPages[0] = [...newPages[0], payload.message];
          return { ...oldData, pages: newPages };
        });

        // Mark as read
        if (payload.message.senderId !== currentUserId) {
          socket.emit('chat:read', { conversationId: payload.conversationId, senderId: payload.message.senderId });
        }
      }
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
  }, [socket, isConnected, conversationId, recipientId, queryClient, currentUserId]);

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

  const handleSend = async () => {
    if (!content.trim() && images.length === 0) return;
    if (!socket || !isConnected) return;

    const tempId = `temp_${Date.now()}`;
    const messageContent = content.trim();
    
    // Optimsitic UI
    const tempMessage: ChatMessage = {
      id: tempId,
      conversationId: conversationId || 'temp',
      senderId: currentUserId!,
      content: messageContent,
      messageType: 'text',
      storyId: null,
      reactionEmoji: null,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      media: images.map(uri => ({ id: uri, mediaUrl: uri, mediaType: 'image', thumbnailUrl: null })),
    };

    setContent('');
    setImages([]);
    socket.emit('chat:stop_typing', { recipientId });

    if (conversationId) {
      queryClient.setQueryData(['chatMessages', conversationId], (oldData: any) => {
        if (!oldData) return { pages: [[tempMessage]], pageParams: [undefined] };
        const newPages = [...oldData.pages];
        newPages[0] = [...newPages[0], tempMessage];
        return { ...oldData, pages: newPages };
      });
    }

    try {
      let uploadedMedia: any[] = [];
      if (tempMessage.media.length > 0) {
        uploadedMedia = await uploadMedia();
      }

      socket.emit('chat:send', {
        recipientId,
        content: messageContent,
        media: uploadedMedia,
      });

      // The server will respond with 'chat:message' which we use to reconcile in handleNewMessage
      // Note: A robust system removes the tempMessage here when the real one arrives.
      // For simplicity, handleNewMessage will just append the real one, which might cause a duplicate momentarily 
      // if not explicitly filtered. To filter, we'd need the tempId, but the server doesn't echo it.
      // Realistically we should filter out the temp message when the real one arrives.
      
      // Let's remove the temp message after 2 seconds assuming the real one arrived
      setTimeout(() => {
        if (conversationId) {
          queryClient.setQueryData(['chatMessages', conversationId], (oldData: any) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page: ChatMessage[]) => page.filter(m => m.id !== tempId))
            };
          });
        }
      }, 1000);

    } catch (err) {
      Alert.alert('Error', 'Failed to send message');
      // Revert optimistic update
      if (conversationId) {
        queryClient.setQueryData(['chatMessages', conversationId], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: ChatMessage[]) => page.filter(m => m.id !== tempId))
          };
        });
      }
    }
  };

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

  const confirmDelete = (msg: ChatMessage) => {
    if (msg.senderId !== currentUserId || msg.isDeleted) return;
    Alert.alert('Delete Message', 'Are you sure you want to delete this message?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(msg.id) }
    ]);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwn = item.senderId === currentUserId;
    if (item.isDeleted) {
      return (
        <View style={[styles.messageBubble, isOwn ? styles.ownBubble : styles.otherBubble, { backgroundColor: theme.surfaceSecondary }]}>
          <Text style={[styles.messageText, { color: theme.textSecondary, fontStyle: 'italic' }]}>Message deleted</Text>
        </View>
      );
    }
    return (
      <TouchableOpacity 
        onLongPress={() => confirmDelete(item)}
        activeOpacity={isOwn ? 0.7 : 1}
        style={[
          styles.messageBubble, 
          isOwn ? [styles.ownBubble, { backgroundColor: theme.primary }] : [styles.otherBubble, { backgroundColor: theme.surfaceSecondary }]
        ]}
      >
        {item.media && item.media.length > 0 && (
          <View style={styles.mediaContainer}>
            {item.media.map(m => (
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
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <ChevronLeft size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>@{recipientUsername}</Text>
          <View style={{ width: 40 }} />
        </View>

        {isLoading ? (
          <ActivityIndicator style={{ flex: 1 }} color={theme.primary} />
        ) : (
          <FlatList
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

        <View style={[styles.inputRow, { borderTopColor: theme.border }]}>
          <TouchableOpacity onPress={handlePickImage} style={styles.attachBtn}>
            <ImageIcon size={24} color={theme.primary} />
          </TouchableOpacity>
          <TextInput
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
    borderRadius: 16,
    marginBottom: 8,
  },
  ownBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
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
  }
});
