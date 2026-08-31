import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/navigation/RootNavigator';
import { useTheme } from '~/hooks/useTheme';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';
import { ChevronLeft } from 'lucide-react-native';
import { useFollowersQuery, useFollowingQuery, BasicUser } from '~/queries/profile/profileQueries';
import { Avatar } from '~/components/common/Avatar';

type Props = NativeStackScreenProps<RootStackParamList, 'FollowList'>;

export function FollowListScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const { userId, initialTab = 'Followers' } = route.params;
  
  const [activeTab, setActiveTab] = useState<'Followers' | 'Following'>(initialTab);

  const followersQuery = useFollowersQuery(userId);
  const followingQuery = useFollowingQuery(userId);

  const activeQuery = activeTab === 'Followers' ? followersQuery : followingQuery;

  const renderUser = ({ item }: { item: BasicUser }) => (
    <TouchableOpacity 
      style={[styles.userRow, { borderBottomColor: theme.border }]}
      onPress={() => navigation.push('Profile', { userId: item.id })}
    >
      <View style={styles.avatarContainer}>
        <Avatar uri={item.profileImage} size={48} />
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ChevronLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{activeTab}</Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Followers' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('Followers')}
        >
          <Text style={[
            styles.tabText, 
            { color: activeTab === 'Followers' ? theme.primary : theme.textSecondary }
          ]}>
            Followers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Following' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('Following')}
        >
          <Text style={[
            styles.tabText, 
            { color: activeTab === 'Following' ? theme.primary : theme.textSecondary }
          ]}>
            Following
          </Text>
        </TouchableOpacity>
      </View>

      {activeQuery.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : activeQuery.isError ? (
        <View style={styles.center}>
          <Text style={{ color: theme.danger }}>Could not load users.</Text>
        </View>
      ) : (
        <FlatList
          data={activeQuery.data}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: theme.textSecondary }}>No {activeTab.toLowerCase()} yet.</Text>
            </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    height: 56,
  },
  iconBtn: { padding: 8, width: 40 },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
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
