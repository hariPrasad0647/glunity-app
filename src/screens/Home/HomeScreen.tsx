import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PostCard } from '~/components/feed/PostCard';
import { useTheme } from '~/hooks/useTheme';
import { Plus } from 'lucide-react-native';
import { useFeedQuery } from '~/queries/post/postQueries';

type Props = any; 

export function HomeScreen({ navigation }: Props) {
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
  } = useFeedQuery();

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const posts = data?.pages.flatMap(page => page.data.items) || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
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
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard 
              post={item} 
              onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
              onReply={() => navigation.navigate('PostDetail', { postId: item.id })}
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
        style={[styles.fab, { backgroundColor: theme.primary }]}
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
