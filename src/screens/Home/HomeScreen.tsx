import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PostCard } from '~/components/feed/PostCard';
import { useTheme } from '~/hooks/useTheme';
import { Plus, Search } from 'lucide-react-native';
import { useFeedQuery } from '~/queries/post/postQueries';
import { useMyProfileQuery } from '~/queries/profile/profileQueries';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';

type Props = any; 

export function HomeScreen({ navigation }: Props) {
  const { theme } = useTheme();
  
  const { data: profile } = useMyProfileQuery();

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
      
      {/* Custom Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          {profile?.profileImage ? (
            <Image source={{ uri: profile.profileImage }} style={styles.headerAvatar} />
          ) : (
            <View style={[styles.headerAvatarPlaceholder, { backgroundColor: theme.surfaceSecondary }]} />
          )}
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Glunity</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Search size={24} color={theme.textPrimary} />
        </TouchableOpacity>
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
          keyExtractor={(item) => item.id}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headerAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: typography.weights.bold,
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
