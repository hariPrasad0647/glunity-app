import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/navigation/RootNavigator';
import { useTheme } from '~/hooks/useTheme';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';
import { Search, ChevronLeft } from 'lucide-react-native';
import { useUserSearchQuery, BasicUser } from '~/queries/profile/profileQueries';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export function SearchScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Simple debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useUserSearchQuery(debouncedQuery);

  const users = data?.pages.flatMap(page => page.items) || [];

  const renderUser = ({ item }: { item: BasicUser }) => (
    <TouchableOpacity 
      style={[styles.userRow, { borderBottomColor: theme.border }]}
      onPress={() => navigation.push('Profile', { userId: item.id })}
    >
      <View style={styles.avatarContainer}>
        {item.profileImage ? (
          <Image source={{ uri: item.profileImage }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: theme.surfaceSecondary }]} />
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={[styles.fullName, { color: theme.textPrimary }]}>{item.fullName}</Text>
        <Text style={[styles.username, { color: theme.textSecondary }]}>@{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={[styles.searchBar, { backgroundColor: theme.surfaceSecondary }]}>
          <Search size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search users..."
            placeholderTextColor={theme.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>
      </View>

      {isLoading && debouncedQuery.length > 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={{ color: theme.danger }}>Error searching users.</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator style={{ margin: 16 }} color={theme.primary} /> : null
          }
          ListEmptyComponent={
            debouncedQuery.length > 0 ? (
              <View style={styles.center}>
                <Text style={{ color: theme.textSecondary }}>No users found.</Text>
              </View>
            ) : (
              <View style={styles.center}>
                <Search size={48} color={theme.textSecondary} style={{ marginBottom: 16 }} />
                <Text style={{ color: theme.textSecondary }}>Search for people</Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 8 },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
    marginLeft: 8,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: typography.sizes.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  userInfo: {
    flex: 1,
  },
  fullName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  username: {
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
});
