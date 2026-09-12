import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/navigation/RootNavigator';
import { useTheme } from '~/hooks/useTheme';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';
import { ChevronLeft, Check, User, Heart, MessageSquare, Repeat, CornerUpLeft, Bell } from 'lucide-react-native';
import { Avatar } from '~/components/common/Avatar';
import { NotificationSkeleton } from '~/components/common/Skeletons';
import { 
  useNotificationsQuery, 
  useMarkNotificationReadMutation, 
  useMarkAllNotificationsReadMutation,
  Notification 
} from '~/queries/notification/notificationQueries';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export function NotificationsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  
  const { 
    data, 
    isLoading, 
    isError, 
    refetch, 
    isRefetching, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useNotificationsQuery();

  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleMarkAllAsRead = () => {
    markAllReadMutation.mutate();
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
    
    // Navigate based on entity type
    if (notification.type === 'FOLLOW') {
      navigation.navigate('Profile', { userId: notification.actorId });
    } else if (['LIKE', 'REPOST', 'COMMENT', 'REPLY'].includes(notification.type)) {
      // For POST/REEL entities, entityId is the postId itself
      // For REPLY/COMMENT entities, use the dedicated postId field from backend
      const postId = (notification.entityType === 'POST' || notification.entityType === 'REEL')
        ? notification.entityId
        : notification.postId;

      if (postId) {
        navigation.navigate('PostDetail', { postId });
      } else {
        console.warn('Cannot navigate: postId not found in notification payload', notification);
      }
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'FOLLOW': return <User size={16} color={theme.primary} />;
      case 'LIKE': return <Heart size={16} color={theme.danger} />;
      case 'COMMENT': return <MessageSquare size={16} color={theme.primary} />;
      case 'REPOST': return <Repeat size={16} color={theme.success} />;
      case 'REPLY': return <CornerUpLeft size={16} color={theme.primary} />;
      default: return <Bell size={16} color={theme.textSecondary} />;
    }
  };

  const notifications = data?.pages.flatMap(page => page.notifications) || [];

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem, 
        { backgroundColor: item.isRead ? theme.background : theme.surfaceSecondary }
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.avatarContainer}>
        <Avatar uri={item.actor?.profileImage} size={48} />
        <View style={[styles.iconBadge, { backgroundColor: theme.background }]}>
          {getIconForType(item.type)}
        </View>
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.message, { color: theme.textPrimary }]}>
          <Text style={{ fontWeight: 'bold' }}>{item.actor?.fullName || 'User'}</Text> {item.message.replace(item.actor?.fullName || '', '').trim()}
        </Text>
        <Text style={[styles.time, { color: theme.textSecondary }]}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      {!item.isRead && (
        <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ChevronLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Notifications</Text>
        <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.iconBtn}>
          <Check size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {isLoading && !isRefetching ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {Array.from({ length: 6 }).map((_, index) => (
            <NotificationSkeleton key={index} />
          ))}
        </ScrollView>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={{ color: theme.danger }}>Failed to load notifications</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: theme.textSecondary }}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, index) => item.id ? `${item.id}-${index}` : index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={theme.primary} />
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator style={{ margin: 16 }} color={theme.primary} />
            ) : null
          }
        />
      )}
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
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  iconBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    borderRadius: 12,
    padding: 2,
  },
  contentContainer: {
    flex: 1,
  },
  message: {
    fontSize: typography.sizes.md,
    marginBottom: 4,
  },
  time: {
    fontSize: typography.sizes.sm,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: spacing.md,
  }
});
