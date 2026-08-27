import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MessageCircle, Repeat2, Heart, Bookmark, MoreHorizontal, BadgeCheck } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { Post } from '~/types';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';
import { TokenCard } from './TokenCard';

interface PostCardProps {
  post: Post;
  onPress?: () => void;
  onLike?: () => void;
  onRepost?: () => void;
  onReply?: () => void;
}

export function PostCard({ post, onPress, onLike, onRepost, onReply }: PostCardProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity 
      style={[styles.container, { borderBottomColor: theme.border }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.avatarContainer}>
        {post.author.avatarUrl ? (
          <Image source={{ uri: post.author.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: theme.surfaceSecondary }]} />
        )}
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.authorInfo}>
            <Text style={[styles.displayName, { color: theme.textPrimary }]}>{post.author.displayName}</Text>
            {post.author.isVerified && <BadgeCheck size={16} color={theme.primary} style={styles.verified} />}
            <Text style={[styles.username, { color: theme.textSecondary }]}>@{post.author.username}</Text>
            <Text style={[styles.dot, { color: theme.textSecondary }]}>·</Text>
            <Text style={[styles.timestamp, { color: theme.textSecondary }]}>2h</Text>
          </View>
          <TouchableOpacity hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <MoreHorizontal size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.text, { color: theme.textPrimary }]}>{post.text}</Text>

        {post.tokenReferences?.map((token, index) => (
          <TokenCard key={index} token={token} />
        ))}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={onReply}>
            <MessageCircle size={18} color={theme.textSecondary} />
            <Text style={[styles.actionText, { color: theme.textSecondary }]}>{post.replyCount || ''}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onRepost}>
            <Repeat2 size={18} color={post.repostedByMe ? theme.success : theme.textSecondary} />
            <Text style={[styles.actionText, { color: post.repostedByMe ? theme.success : theme.textSecondary }]}>{post.repostCount || ''}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onLike}>
            <Heart size={18} color={post.likedByMe ? theme.danger : theme.textSecondary} />
            <Text style={[styles.actionText, { color: post.likedByMe ? theme.danger : theme.textSecondary }]}>{post.likeCount || ''}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Bookmark size={18} color={post.bookmarkedByMe ? theme.primary : theme.textSecondary} />
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
    borderBottomWidth: StyleSheet.hairlineWidth,
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
    alignItems: 'center',
    marginBottom: 4,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  displayName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  verified: {
    marginLeft: 4,
  },
  username: {
    fontSize: typography.sizes.sm,
    marginLeft: 4,
  },
  dot: {
    marginHorizontal: 4,
  },
  timestamp: {
    fontSize: typography.sizes.sm,
  },
  text: {
    fontSize: typography.sizes.md,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingRight: spacing.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 6,
    fontSize: typography.sizes.sm,
  },
});
