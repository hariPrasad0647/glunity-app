import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Text, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PostCard } from '~/components/feed/PostCard';
import { Avatar } from '~/components/common/Avatar';
import { useTheme } from '~/hooks/useTheme';
import { Plus, Search, MessageCircle, Bell } from 'lucide-react-native';
import { useFeedQuery } from '~/queries/post/postQueries';
import { useMyProfileQuery } from '~/queries/profile/profileQueries';
import { useConversationsQuery } from '../../queries/chat/chatQueries';
import { useAuthStore } from '../../store/authStore';
import { useUnreadNotificationCountQuery } from '~/queries/notification/notificationQueries';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';

type Props = any;

export function HomeScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const currentUserId = useAuthStore(state => state.user?.id);
  const [activeTab, setActiveTab] = React.useState('Feed');

  const { data: profile } = useMyProfileQuery();
  const { data: conversations } = useConversationsQuery();

  const chatUnreadCount = useMemo(() => {
    if (!conversations || !currentUserId) return 0;
    return conversations.filter(c => {
      if (!c.lastMessage) return false;
      if (c.lastMessage.senderId === currentUserId) return false;
      if (!c.lastReadAt) return true;
      return new Date(c.lastMessage.createdAt) > new Date(c.lastReadAt);
    }).length;
  }, [conversations, currentUserId]);

  const { data: notificationsUnreadCount = 0 } = useUnreadNotificationCountQuery();

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useFeedQuery();

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const rawPosts = data?.pages.flatMap(page => page.data.feed || []) || [];
  const posts = useMemo(() => {
    let filtered = [...rawPosts];
    if (activeTab === 'Following') {
      // In a real app, this might be a backend query or filter by follow status. 
      // For now, we'll just show the feed or keep it simple.
      // filtered = filtered.filter(p => isFollowing(p.author.id));
    }
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [rawPosts, activeTab]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>

      {/* Custom Header */}
      <View style={[styles.header, { height: 60, paddingVertical: 0, marginTop: 12 }]}>
        <View style={{ flex: 1, height: '100%', position: 'relative' }}>
          <Image
            source={require('../../../assets/logo.png')}
            style={{ width: 270, height: 148, position: 'absolute', marginTop: 20, top: -80, left: -86, zIndex: -1 }}
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('Search')} style={styles.iconBtn}>
            <Search size={24} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ChatList')} style={styles.iconBtn}>
            <MessageCircle size={24} color={theme.primary} />
            {chatUnreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.danger }]}>
                <Text style={styles.badgeText}>{chatUnreadCount > 99 ? '99+' : chatUnreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.iconBtn}>
            <Bell size={24} color={theme.primary} />
            {notificationsUnreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.danger }]}>
                <Text style={styles.badgeText}>{notificationsUnreadCount > 99 ? '99+' : notificationsUnreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: currentUserId })} style={styles.iconBtn}>
            {profile?.profileImage ? (
              <Image source={{ uri: profile.profileImage }} style={{ width: 28, height: 28, borderRadius: 14 }} />
            ) : (
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: theme.surfaceSecondary, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: theme.textSecondary, fontWeight: 'bold', fontSize: 12 }}>
                  {profile?.fullName?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Tabs */}
      <View style={[styles.tabsContainer, { borderBottomColor: theme.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          <TouchableOpacity
            style={[styles.tab, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }, activeTab === 'Feed' && { backgroundColor: theme.primary, borderColor: theme.primary }]}
            onPress={() => setActiveTab('Feed')}
          >
            <Text style={[styles.tabText, { color: theme.textSecondary }, activeTab === 'Feed' && { color: '#FFFFFF', fontWeight: 'bold' }]}>Feed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }, activeTab === 'Following' && { backgroundColor: theme.primary, borderColor: theme.primary }]}
            onPress={() => setActiveTab('Following')}
          >
            <Text style={[styles.tabText, { color: theme.textSecondary }, activeTab === 'Following' && { color: '#FFFFFF', fontWeight: 'bold' }]}>Following</Text>
            {activeTab !== 'Following' && <View style={[styles.blueDot, { backgroundColor: theme.primary }]} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }, activeTab === 'Trending' && { backgroundColor: theme.primary, borderColor: theme.primary }]}
            onPress={() => setActiveTab('Trending')}
          >
            <Text style={[styles.tabText, { color: theme.textSecondary }, activeTab === 'Trending' && { color: '#FFFFFF', fontWeight: 'bold' }]}>Trending</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>

      {isLoading && !isRefetching ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={{ color: theme.danger }}>Error loading feed. Pull to refresh.</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item, index) => item.id ? `${item.id}-${index}` : index.toString()}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={true}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
              onReply={() => navigation.navigate('PostDetail', { postId: item.id })}
              onProfilePress={() => navigation.navigate('Profile', { userId: item.author.id })}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
            />
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

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary, shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 }]}
        onPress={() => navigation.navigate('ComposePost')}
        activeOpacity={0.9}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
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
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTextContainer: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: typography.weights.bold,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  tabsContainer: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabsScroll: {
    paddingHorizontal: spacing.md,
    gap: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  activeTab: {
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  blueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    padding: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
