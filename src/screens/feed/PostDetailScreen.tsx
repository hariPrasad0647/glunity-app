import React, { useState, useRef } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Text, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '~/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/navigation/RootNavigator';
import { ChevronLeft, Send, X } from 'lucide-react-native';
import { usePostDetailQuery, usePostRepliesQuery, useReplyMutation, useNestedReplyMutation } from '~/queries/post/postQueries';
import { PostCard } from '~/components/feed/PostCard';
import { ReplyCard } from '~/components/feed/ReplyCard';
import { typography } from '~/theme/typography';
import { Reply } from '~/types';
import { spacing } from '~/theme/spacing';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

type Props = NativeStackScreenProps<RootStackParamList, 'PostDetail'>;

export function PostDetailScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const { postId } = route.params;
  
  const [replyText, setReplyText] = useState('');
  const [activeReplyTarget, setActiveReplyTarget] = useState<{ id: string, username: string } | null>(null);
  const inputRef = useRef<TextInput>(null);

  const { data: post, isLoading: isLoadingPost, isError: isPostError } = usePostDetailQuery(postId);
  
  const { 
    data: repliesData, 
    isLoading: isLoadingReplies, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = usePostRepliesQuery(postId);
  
  const replyMutation = useReplyMutation(postId);
  const nestedReplyMutation = useNestedReplyMutation(postId, activeReplyTarget?.id || '');

  const handleReplyPress = (replyId: string, username: string) => {
    setActiveReplyTarget({ id: replyId, username });
    inputRef.current?.focus();
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    try {
      if (activeReplyTarget) {
        await nestedReplyMutation.mutateAsync(replyText);
        setActiveReplyTarget(null);
      } else {
        await replyMutation.mutateAsync(replyText);
      }
      setReplyText('');
    } catch (e) {
      console.error(e);
    }
  };

  const renderReply = ({ item }: { item: Reply }) => (
    <ReplyCard 
      postId={postId} 
      reply={item} 
      onReplyPress={handleReplyPress}
    />
  );

  if (isLoadingPost) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (isPostError || !post) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary }}>Post not found.</Text>
      </View>
    );
  }

  // Flatten infinite query pages
  const replies = repliesData?.pages.flatMap(page => page.data.replies) || [];
  const isPending = replyMutation.isPending || nestedReplyMutation.isPending;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Post</Text>
          <View style={styles.placeholder} />
        </View>

        <FlatList
          data={replies}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => <PostCard post={post} />}
          renderItem={renderReply}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator style={styles.footerLoader} color={theme.primary} /> : null
          }
          ListEmptyComponent={
            !isLoadingReplies ? (
              <View style={styles.emptyContainer}>
                <Text style={{ color: theme.textSecondary }}>No replies yet. Be the first!</Text>
              </View>
            ) : <ActivityIndicator style={styles.footerLoader} color={theme.primary} />
          }
        />

        <View style={[styles.bottomArea, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
          {activeReplyTarget && (
            <Animated.View entering={FadeInDown} exiting={FadeOutDown} style={styles.replyingToBanner}>
              <Text style={[styles.replyingToText, { color: theme.textSecondary }]}>
                Replying to <Text style={{ color: theme.primary, fontWeight: '600' }}>@{activeReplyTarget.username}</Text>
              </Text>
              <TouchableOpacity onPress={() => setActiveReplyTarget(null)} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <X size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            </Animated.View>
          )}
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.textPrimary }]}
              placeholder={activeReplyTarget ? `Reply to @${activeReplyTarget.username}` : "Post your reply"}
              placeholderTextColor={theme.textSecondary}
              value={replyText}
              onChangeText={setReplyText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[styles.sendButton, { backgroundColor: replyText.trim() ? theme.primary : theme.surfaceSecondary }]}
              onPress={handleSendReply}
              disabled={!replyText.trim() || isPending}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Send size={18} color={replyText.trim() ? '#fff' : theme.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  placeholder: {
    width: 40,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  footerLoader: {
    padding: spacing.md,
  },
  bottomArea: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  replyingToBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  replyingToText: {
    fontSize: typography.sizes.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    marginRight: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
});
