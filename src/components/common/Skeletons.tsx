import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Skeleton } from './Skeleton';
import { useTheme } from '~/hooks/useTheme';
import { spacing } from '~/theme/spacing';

const { width } = Dimensions.get('window');

export const PostSkeleton = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.postContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.avatarContainer}>
        <Skeleton width={48} height={48} circle />
      </View>
      <View style={styles.postContentContainer}>
        <View style={styles.header}>
          <Skeleton width={120} height={16} borderRadius={8} />
          <Skeleton width={80} height={14} borderRadius={7} style={{ marginTop: 6 }} />
        </View>
        <Skeleton width="100%" height={16} borderRadius={8} style={{ marginTop: 12 }} />
        <Skeleton width="80%" height={16} borderRadius={8} style={{ marginTop: 8 }} />
        <Skeleton width="100%" height={200} borderRadius={12} style={{ marginTop: 16 }} />
        <View style={styles.actions}>
          <Skeleton width={32} height={18} borderRadius={9} />
          <Skeleton width={32} height={18} borderRadius={9} />
          <Skeleton width={32} height={18} borderRadius={9} />
          <Skeleton width={32} height={18} borderRadius={9} />
        </View>
      </View>
    </View>
  );
};

export const ProfileHeaderSkeleton = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.profileHeaderContainer, { borderBottomColor: theme.border }]}>
      <View style={styles.coverPhotoSkeleton}>
        <Skeleton width="100%" height={150} borderRadius={0} />
      </View>
      <View style={styles.profileInfoContainer}>
        <View style={styles.profileTopRow}>
          <View style={styles.profileAvatarWrapper}>
            <Skeleton width={80} height={80} circle />
          </View>
          <Skeleton width={100} height={36} borderRadius={18} />
        </View>
        <Skeleton width={150} height={24} borderRadius={12} style={{ marginTop: 8 }} />
        <Skeleton width={100} height={16} borderRadius={8} style={{ marginTop: 4 }} />
        <Skeleton width="90%" height={16} borderRadius={8} style={{ marginTop: 16 }} />
        <Skeleton width="60%" height={16} borderRadius={8} style={{ marginTop: 4 }} />
        <View style={styles.statsRow}>
          <Skeleton width={60} height={20} borderRadius={10} />
          <Skeleton width={60} height={20} borderRadius={10} />
          <Skeleton width={60} height={20} borderRadius={10} />
        </View>
      </View>
    </View>
  );
};

export const UserListItemSkeleton = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.userListItemContainer, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <Skeleton width={50} height={50} circle />
      <View style={styles.userInfo}>
        <Skeleton width={120} height={16} borderRadius={8} />
        <Skeleton width={80} height={14} borderRadius={7} style={{ marginTop: 4 }} />
      </View>
      <Skeleton width={80} height={32} borderRadius={16} />
    </View>
  );
};

export const ChatListItemSkeleton = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.chatListItemContainer, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <Skeleton width={56} height={56} circle />
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Skeleton width={140} height={16} borderRadius={8} />
          <Skeleton width={40} height={14} borderRadius={7} />
        </View>
        <Skeleton width="80%" height={14} borderRadius={7} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
};

export const CommentSkeleton = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.commentContainer, { borderBottomColor: theme.border }]}>
      <Skeleton width={40} height={40} circle />
      <View style={styles.commentContent}>
        <Skeleton width={100} height={14} borderRadius={7} />
        <Skeleton width="100%" height={14} borderRadius={7} style={{ marginTop: 6 }} />
        <Skeleton width="60%" height={14} borderRadius={7} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
};

export const NotificationSkeleton = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.notificationContainer, { borderBottomColor: theme.border }]}>
      <Skeleton width={48} height={48} circle />
      <View style={styles.notificationContent}>
        <Skeleton width="90%" height={16} borderRadius={8} />
        <Skeleton width="50%" height={14} borderRadius={7} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Post Skeleton
  postContainer: {
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
  postContentContainer: {
    flex: 1,
  },
  header: {
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingRight: spacing.lg,
  },
  
  // Profile Header Skeleton
  profileHeaderContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: spacing.lg,
  },
  coverPhotoSkeleton: {
    width: '100%',
    height: 150,
  },
  profileInfoContainer: {
    paddingHorizontal: spacing.md,
  },
  profileTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: -40,
  },
  profileAvatarWrapper: {
    padding: 4,
    borderRadius: 44,
    backgroundColor: 'transparent',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },

  // User List Item Skeleton
  userListItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  // Chat List Item Skeleton
  chatListItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chatInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Comment Skeleton
  commentContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  commentContent: {
    flex: 1,
    marginLeft: spacing.md,
  },

  // Notification Skeleton
  notificationContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  notificationContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
});
