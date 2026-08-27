import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '~/hooks/useTheme';
import { useFeed } from '~/queries/feed/useFeed';
import { PostCard } from '~/components/feed/PostCard';
import { LoadingState } from '~/components/common/LoadingState';
import { EmptyState } from '~/components/common/EmptyState';
import { ErrorState } from '~/components/common/ErrorState';
import { MessageSquare } from 'lucide-react-native';

export function HomeScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { data: posts, isLoading, isError, error, refetch, isRefetching } = useFeed();

  if (isLoading && !isRefetching) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
        <LoadingState fullScreen />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
        <ErrorState 
          message={error?.message || 'Unable to load your feed'} 
          onRetry={refetch} 
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={posts?.length === 0 ? styles.emptyContainer : null}
        ListEmptyComponent={
          <EmptyState 
            title="No posts yet" 
            message="Your feed is empty. Follow people and communities to see posts here." 
            icon={<MessageSquare size={48} color={theme.textSecondary} />}
          />
        }
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching} 
            onRefresh={refetch} 
            tintColor={theme.primary} 
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
  },
});
