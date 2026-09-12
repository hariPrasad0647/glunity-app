import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/navigation/RootNavigator';
import { useTheme } from '~/hooks/useTheme';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';
import { 
  useLikedPostsQuery, 
  useUserCommentsQuery, 
  useSavedPostsQuery 
} from '~/queries/activity/activityQueries';
import { PostCard } from '~/components/feed/PostCard';
import { ReplyCard } from '~/components/feed/ReplyCard';
import { Avatar } from '~/components/common/Avatar';
import { PostSkeleton, CommentSkeleton } from '~/components/common/Skeletons';

type Props = NativeStackScreenProps<RootStackParamList, 'UserActivity'>;
type TabType = 'Likes' | 'Comments' | 'Saved';
const TABS: TabType[] = ['Likes', 'Comments', 'Saved'];

export function UserActivityScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('Likes');

  // Queries
  const likedPostsQuery = useLikedPostsQuery();
  const commentsQuery = useUserCommentsQuery();
  const savedPostsQuery = useSavedPostsQuery();

  const renderTabs = () => (
    <View style={[styles.tabsContainer, { borderBottomColor: theme.border }]}>
      {TABS.map(tab => {
        const isActive = activeTab === tab;
        return (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, isActive && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, { color: isActive ? theme.primary : theme.textSecondary }]}>
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderLikedPosts = () => {
    const posts = likedPostsQuery.data?.pages.flatMap(page => page.data.posts || []) || [];
    return (
      <FlatList
        key="Likes"
        data={posts}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <PostCard 
            post={item} 
            onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
            onReply={() => navigation.navigate('PostDetail', { postId: item.id })}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={likedPostsQuery.isRefetching}
            onRefresh={() => likedPostsQuery.refetch()}
            tintColor={theme.primary}
          />
        }
        onEndReached={() => {
          if (likedPostsQuery.hasNextPage && !likedPostsQuery.isFetchingNextPage) {
            likedPostsQuery.fetchNextPage();
          }
        }}
        ListEmptyComponent={!likedPostsQuery.isLoading ? <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No liked posts found.</Text> : null}
        ListFooterComponent={likedPostsQuery.isFetchingNextPage ? <ActivityIndicator style={styles.loader} color={theme.primary} /> : null}
      />
    );
  };

  const renderSavedPosts = () => {
    const posts = savedPostsQuery.data?.pages.flatMap(page => page.data.posts || []) || [];
    return (
      <FlatList
        key="Saved"
        data={posts}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <PostCard 
            post={item} 
            onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
            onReply={() => navigation.navigate('PostDetail', { postId: item.id })}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={savedPostsQuery.isRefetching}
            onRefresh={() => savedPostsQuery.refetch()}
            tintColor={theme.primary}
          />
        }
        onEndReached={() => {
          if (savedPostsQuery.hasNextPage && !savedPostsQuery.isFetchingNextPage) {
            savedPostsQuery.fetchNextPage();
          }
        }}
        ListEmptyComponent={!savedPostsQuery.isLoading ? <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No saved posts found.</Text> : null}
        ListFooterComponent={savedPostsQuery.isFetchingNextPage ? <ActivityIndicator style={styles.loader} color={theme.primary} /> : null}
      />
    );
  };

  const renderComments = () => {
    const comments = commentsQuery.data?.pages.flatMap(page => page.data.replies || []) || [];
    return (
      <FlatList
        key="Comments"
        data={comments}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 16 }}>
            {item.postId && (
              <TouchableOpacity 
                style={styles.viewPostHeader}
                onPress={() => navigation.navigate('PostDetail', { postId: item.postId! })}
              >
                <Text style={[styles.viewPostText, { color: theme.primary }]}>View Post →</Text>
              </TouchableOpacity>
            )}
            <ReplyCard 
              postId={item.postId || ''}
              reply={item}
              onReplyPress={() => {
                if (item.postId) navigation.navigate('PostDetail', { postId: item.postId });
              }}
            />
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={commentsQuery.isRefetching}
            onRefresh={() => commentsQuery.refetch()}
            tintColor={theme.primary}
          />
        }
        onEndReached={() => {
          if (commentsQuery.hasNextPage && !commentsQuery.isFetchingNextPage) {
            commentsQuery.fetchNextPage();
          }
        }}
        ListEmptyComponent={!commentsQuery.isLoading ? <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No comments found.</Text> : null}
        ListFooterComponent={commentsQuery.isFetchingNextPage ? <ActivityIndicator style={styles.loader} color={theme.primary} /> : null}
      />
    );
  };



  const renderContent = () => {
    const isLoading = 
      (activeTab === 'Likes' && likedPostsQuery.isLoading) ||
      (activeTab === 'Comments' && commentsQuery.isLoading) ||
      (activeTab === 'Saved' && savedPostsQuery.isLoading);

    if (isLoading) {
      return (
        <ScrollView showsVerticalScrollIndicator={false}>
          {Array.from({ length: 3 }).map((_, index) => (
            activeTab === 'Comments' ? <CommentSkeleton key={index} /> : <PostSkeleton key={index} />
          ))}
        </ScrollView>
      );
    }

    switch (activeTab) {
      case 'Likes': return renderLikedPosts();
      case 'Comments': return renderComments();
      case 'Saved': return renderSavedPosts();
      default: return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ChevronLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Activity</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {renderTabs()}
      
      <View style={styles.content}>
        {renderContent()}
      </View>
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
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  content: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    margin: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: typography.sizes.md,
  },
  viewPostHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  viewPostText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  }
});
