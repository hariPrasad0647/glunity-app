import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { MessageCircle, Repeat2, Heart, Bookmark, MoreHorizontal, BadgeCheck } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { Post } from '~/types';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';
import { useLikeMutation, useBookmarkMutation, useRepostMutation } from '~/queries/post/postQueries';

const { width } = Dimensions.get('window');

interface PostCardProps {
  post: Post;
  onPress?: () => void;
  onReply?: () => void;
  onProfilePress?: () => void;
}

export function PostCard({ post, onPress, onReply, onProfilePress }: PostCardProps) {
  const { theme } = useTheme();
  
  const likeMutation = useLikeMutation(post.id);
  const bookmarkMutation = useBookmarkMutation(post.id);
  const repostMutation = useRepostMutation(post.id);

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleBookmark = () => {
    bookmarkMutation.mutate();
  };

  const handleRepost = () => {
    repostMutation.mutate();
  };

  // Basic time formatting (e.g., "2h", "1d")
  const formatTime = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'now';
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <TouchableOpacity style={styles.avatarContainer} onPress={onProfilePress}>
        {post.author.profileImage ? (
          <Image source={{ uri: post.author.profileImage }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: theme.surfaceSecondary }]} />
        )}
      </TouchableOpacity>
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.authorInfo} onPress={onProfilePress}>
            <View style={styles.nameRow}>
              <Text style={[styles.displayName, { color: theme.textPrimary }]}>{post.author.fullName}</Text>
              {post.author.isVerified && <BadgeCheck size={16} color={theme.primary} style={styles.verified} />}
            </View>
            <View style={styles.handleRow}>
              <Text style={[styles.username, { color: theme.textSecondary }]}>@{post.author.username}</Text>
              <Text style={[styles.dot, { color: theme.textSecondary }]}> · </Text>
              <Text style={[styles.timestamp, { color: theme.textSecondary }]}>{formatTime(post.createdAt)}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <MoreHorizontal size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.text, { color: theme.textPrimary }]}>{post.content}</Text>

        {post.media && post.media.length > 0 && (
          <View style={styles.mediaContainer}>
            <Image 
              source={{ uri: post.media[0] }} 
              style={[styles.mediaImage, { borderColor: theme.border }]} 
              resizeMode="cover" 
            />
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Heart size={18} color={post.hasLiked ? theme.danger : theme.textSecondary} />
            <Text style={[styles.actionText, { color: post.hasLiked ? theme.danger : theme.textSecondary }]}>
              {post.likeCount > 0 ? post.likeCount : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onReply}>
            <MessageCircle size={18} color={theme.textSecondary} />
            <Text style={[styles.actionText, { color: theme.textSecondary }]}>
              {post.commentCount > 0 ? post.commentCount : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleRepost}>
            <Repeat2 size={18} color={theme.textSecondary} />
            <Text style={[styles.actionText, { color: theme.textSecondary }]}>
              {post.repostCount > 0 ? post.repostCount : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleBookmark}>
            <Bookmark size={18} color={post.hasBookmarked ? theme.primary : theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.md,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  authorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  handleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  displayName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  username: {
    fontSize: typography.sizes.sm,
  },
  dot: {
    fontSize: typography.sizes.sm,
  },
  timestamp: {
    fontSize: typography.sizes.sm,
  },
  verified: {
    marginLeft: 2,
  },
  text: {
    fontSize: typography.sizes.md,
    lineHeight: 22,
  },
  mediaContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  mediaImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingRight: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: typography.sizes.sm,
  },
});

// force reload
