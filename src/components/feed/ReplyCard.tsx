import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Heart, MessageCircle, Trash2, MoreHorizontal } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { Reply } from '~/types';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';
import { useLikeReplyMutation, useDeleteReplyMutation, useNestedRepliesQuery } from '~/queries/post/postQueries';
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { useAuthStore } from '~/store/authStore';

interface ReplyCardProps {
  postId: string;
  reply: Reply;
  onReplyPress: (replyId: string, authorName: string) => void;
  isNested?: boolean;
}

export function ReplyCard({ postId, reply, onReplyPress, isNested = false }: ReplyCardProps) {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  
  const [showNested, setShowNested] = useState(false);
  
  const likeMutation = useLikeReplyMutation(postId);
  const deleteMutation = useDeleteReplyMutation(postId);
  
  // Only query nested replies if this is a top-level reply and the user requested to see them
  const { data: nestedData, isLoading: isLoadingNested } = useNestedRepliesQuery(
    postId, 
    reply.id, 
  );

  const handleLike = () => {
    likeMutation.mutate(reply.id);
  };

  const handleDelete = () => {
    deleteMutation.mutate(reply.id);
  };

  const formatTime = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'now';
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const nestedReplies = nestedData?.pages.flatMap(p => p.data.replies) || [];
  const isAuthor = user?.id === reply.author.id;

  return (
    <Animated.View 
      entering={FadeInDown} 
      exiting={FadeOutUp} 
      layout={LinearTransition.springify().damping(15)}
      style={[
        styles.container, 
        { borderBottomColor: isNested ? 'transparent' : theme.border },
        isNested && styles.nestedContainer
      ]}
    >
      <View style={styles.avatarContainer}>
        {reply.author.profileImage ? (
          <Image source={{ uri: reply.author.profileImage }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: theme.surfaceSecondary }]} />
        )}
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.authorInfo}>
            <Text style={[styles.displayName, { color: theme.textPrimary }]}>{reply.author.fullName}</Text>
            <Text style={[styles.username, { color: theme.textSecondary }]}>@{reply.author.username}</Text>
            <Text style={[styles.dot, { color: theme.textSecondary }]}>·</Text>
            <Text style={[styles.timestamp, { color: theme.textSecondary }]}>{formatTime(reply.createdAt)}</Text>
          </View>
          {isAuthor ? (
            <TouchableOpacity hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }} onPress={handleDelete}>
              <Trash2 size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          ) : (
            <MoreHorizontal size={16} color={theme.textSecondary} />
          )}
        </View>

        <Text style={[styles.text, { color: theme.textPrimary }]}>{reply.text}</Text>

        <View style={styles.actions}>
          {!isNested && (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => onReplyPress(reply.id, reply.author.username)}
            >
              <MessageCircle size={16} color={theme.textSecondary} />
              <Text style={[styles.actionText, { color: theme.textSecondary }]}>
                {reply.replyCount > 0 ? reply.replyCount : 'Reply'}
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Heart size={16} color={reply.hasLiked ? theme.danger : theme.textSecondary} />
            <Text style={[styles.actionText, { color: reply.hasLiked ? theme.danger : theme.textSecondary }]}>
              {reply.likeCount > 0 ? reply.likeCount : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Nested Replies Rendering */}
        {!isNested && reply.replyCount > 0 && !showNested && (
          <TouchableOpacity style={styles.viewRepliesBtn} onPress={() => setShowNested(true)}>
            <View style={[styles.replyLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.viewRepliesText, { color: theme.primary }]}>
              View {reply.replyCount} replies
            </Text>
          </TouchableOpacity>
        )}

        {showNested && (
          <View style={styles.nestedList}>
            {isLoadingNested ? (
              <ActivityIndicator size="small" color={theme.primary} style={{ marginTop: 8 }} />
            ) : (
              nestedReplies.map((nestedReply) => (
                <ReplyCard 
                  key={nestedReply.id} 
                  postId={postId} 
                  reply={nestedReply} 
                  onReplyPress={onReplyPress} // Nested replies can't be replied to directly (backend limitation: 1 level)
                  isNested={true} 
                />
              ))
            )}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingLeft: spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  nestedContainer: {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  displayName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  username: {
    fontSize: typography.sizes.xs,
    marginLeft: 4,
  },
  dot: {
    marginHorizontal: 4,
  },
  timestamp: {
    fontSize: typography.sizes.xs,
  },
  text: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.xl,
  },
  actionText: {
    marginLeft: 6,
    fontSize: typography.sizes.xs,
  },
  viewRepliesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  replyLine: {
    width: 24,
    height: 1,
    marginRight: 8,
  },
  viewRepliesText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  nestedList: {
    marginTop: spacing.sm,
  },
});
