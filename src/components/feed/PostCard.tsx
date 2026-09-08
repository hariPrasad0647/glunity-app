import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { MessageCircle, Repeat2, Heart, Bookmark, MoreHorizontal, BadgeCheck, Trash2 } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming
} from 'react-native-reanimated';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useTheme } from '~/hooks/useTheme';
import { Post } from '~/types';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';
import { useLikeMutation, useBookmarkMutation, useRepostMutation, useDeletePostMutation } from '~/queries/post/postQueries';
import { useAuthStore } from '~/store/authStore';
import { ConfirmModal } from '~/components/common/ConfirmModal';
import { OptionsModal, Option } from '~/components/common/OptionsModal';

const { width } = Dimensions.get('window');

// Create Animated version of Heart icon
const AnimatedHeart = Animated.createAnimatedComponent(Heart);

const VideoRenderer = ({ mediaUrl, theme, onPress, bigHeartAnimatedStyle }: any) => {
  const player = useVideoPlayer(mediaUrl, player => {
    player.loop = true;
  });

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.mediaContainer}>
        <VideoView
          style={[styles.mediaImage, { borderColor: theme.border }]}
          player={player}
          nativeControls
          contentFit="cover"
        />
        <Animated.View style={[styles.bigHeartContainer, bigHeartAnimatedStyle]} pointerEvents="none">
          <Heart size={80} color="white" fill="white" />
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const PostMediaRenderer = ({ mediaUrl, theme, onPress, bigHeartAnimatedStyle }: any) => {
  const isVideo = mediaUrl.toLowerCase().match(/\.(mp4|mov|mkv|webm)$/);

  if (isVideo) {
    return <VideoRenderer mediaUrl={mediaUrl} theme={theme} onPress={onPress} bigHeartAnimatedStyle={bigHeartAnimatedStyle} />;
  }

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.mediaContainer}>
        <Image
          source={{ uri: mediaUrl }}
          style={[styles.mediaImage, { borderColor: theme.border }]}
          resizeMode="cover"
        />
        <Animated.View style={[styles.bigHeartContainer, bigHeartAnimatedStyle]} pointerEvents="none">
          <Heart size={80} color="white" fill="white" />
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

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
  const deletePostMutation = useDeletePostMutation();
  const currentUser = useAuthStore((state) => state.user);

  const [optionsVisible, setOptionsVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  // Animations
  const bigHeartScale = useSharedValue(0);
  const bigHeartOpacity = useSharedValue(0);
  const likeButtonScale = useSharedValue(1);
  const lastTap = useRef(0);

  const postOptions: Option[] = [
    {
      label: 'Delete Post',
      icon: <Trash2 size={20} color={theme.danger} />,
      isDestructive: true,
      onPress: () => setDeleteConfirmVisible(true),
    }
  ];

  const handleMoreOptions = () => {
    if (currentUser?.id === post.author.id) {
      setOptionsVisible(true);
    }
  };

  const handleDeleteConfirm = () => {
    setDeleteConfirmVisible(false);
    deletePostMutation.mutate(post.id);
  };

  const triggerLikeAnimation = useCallback(() => {
    likeButtonScale.value = withSequence(
      withTiming(1.3, { duration: 250 }),
      withTiming(1, { duration: 250 })
    );
  }, [likeButtonScale]);

  const handleLike = () => {
    triggerLikeAnimation();
    likeMutation.mutate();
  };

  const handleImageDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
      // Double tap detected
      bigHeartScale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: 250 }),
        withDelay(250, withTiming(0, { duration: 250 }))
      );
      bigHeartOpacity.value = withSequence(
        withTiming(1, { duration: 0 }),
        withDelay(250, withTiming(0, { duration: 250 }))
      );

      if (!post.hasLiked) {
        handleLike();
      }
    } else {
      // Single tap fallback just registers the time
      lastTap.current = now;
      if (onPress) {
        // We use a small timeout to allow a second tap to cancel the single tap action if needed,
        // but for simplicity, we can just trigger it immediately or ignore it and rely on the card press.
        // It's better to NOT trigger onPress here, let the TouchableOpacity handle it, 
        // but wait, TouchableWithoutFeedback intercepts the press.
      }
    }
  };

  const handleImagePress = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
      // Double tap
      bigHeartScale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: 250 }),
        withDelay(250, withTiming(0, { duration: 250 }))
      );
      bigHeartOpacity.value = withSequence(
        withTiming(1, { duration: 0 }),
        withDelay(250, withTiming(0, { duration: 250 }))
      );

      if (!post.hasLiked) {
        handleLike();
      }
    } else {
      lastTap.current = now;
      // We trigger the parent onPress if they don't double tap.
      // But we need to wait to see if it's a double tap.
      setTimeout(() => {
        if (Date.now() - lastTap.current >= DOUBLE_PRESS_DELAY && onPress) {
          onPress();
        }
      }, DOUBLE_PRESS_DELAY);
    }
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

  const bigHeartAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: bigHeartScale.value }],
      opacity: bigHeartOpacity.value,
    };
  });

  const likeButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: likeButtonScale.value }],
    };
  });

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
          <TouchableOpacity hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }} onPress={handleMoreOptions}>
            <MoreHorizontal size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.text, { color: theme.textPrimary }]}>{post.content}</Text>

        {post.media && post.media.length > 0 && (
          <PostMediaRenderer
            mediaUrl={post.media[0]}
            theme={theme}
            onPress={handleImagePress}
            bigHeartAnimatedStyle={bigHeartAnimatedStyle}
          />
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike} activeOpacity={0.7}>
            <Animated.View style={likeButtonAnimatedStyle}>
              <Heart size={18} color={post.hasLiked ? theme.danger : theme.textSecondary} fill={post.hasLiked ? theme.danger : 'transparent'} />
            </Animated.View>
            <Text style={[styles.actionText, { color: post.hasLiked ? theme.danger : theme.textSecondary }]}>
              {post.likeCount > 0 ? post.likeCount : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onReply}>
            <MessageCircle size={18} color={theme.textSecondary} />
            <Text style={[styles.actionText, { color: theme.textSecondary }]}>
              {(post.commentCount || (post as any).replyCount) > 0 ? (post.commentCount || (post as any).replyCount) : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleRepost}>
            <Repeat2 size={18} color={theme.textSecondary} />
            <Text style={[styles.actionText, { color: theme.textSecondary }]}>
              {post.repostCount > 0 ? post.repostCount : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleBookmark}>
            <Bookmark size={18} color={post.hasBookmarked ? theme.primary : theme.textSecondary} fill={post.hasBookmarked ? theme.primary : 'transparent'} />
          </TouchableOpacity>
        </View>
      </View>

      <OptionsModal
        visible={optionsVisible}
        options={postOptions}
        onClose={() => setOptionsVisible(false)}
      />

      <ConfirmModal
        visible={deleteConfirmVisible}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmVisible(false)}
      />
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
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bigHeartContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
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
