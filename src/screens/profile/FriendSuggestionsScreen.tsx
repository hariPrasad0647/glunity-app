import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/navigation/RootNavigator';
import { useTheme } from '~/hooks/useTheme';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';
import { ChevronLeft, Users } from 'lucide-react-native';
import { 
  useFriendSuggestionsQuery, 
  useFollowMutation,
  SuggestionUser 
} from '~/queries/profile/profileQueries';
import { Button } from '~/components/common/Button';
import { Avatar } from '~/components/common/Avatar';

type Props = NativeStackScreenProps<RootStackParamList, 'FriendSuggestions'>;

export function FriendSuggestionsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  
  const { data: suggestions, isLoading } = useFriendSuggestionsQuery();

  const renderSuggestion = ({ item }: { item: SuggestionUser }) => {
    // Assuming we don't know if they are private from SuggestionUser, default to false.
    // If they are private, the backend will handle making it a pending request anyway if coded that way, 
    // or we might need the proper flag.
    const followMutation = useFollowMutation(item.id, false);
    
    return (
      <View style={[styles.userRow, { borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => navigation.push('Profile', { userId: item.id })}
        >
          <View style={styles.avatarContainer}>
            <Avatar uri={item.profileImage} size={48} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.fullName, { color: theme.textPrimary }]} numberOfLines={1}>
              {item.fullName}
            </Text>
            <Text style={[styles.username, { color: theme.textSecondary }]} numberOfLines={1}>
              @{item.username}
            </Text>
            {item.mutualFriendsCount !== undefined && item.mutualFriendsCount > 0 && (
              <View style={styles.mutualContainer}>
                <Users size={12} color={theme.textSecondary} style={{ marginRight: 4 }} />
                <Text style={[styles.mutualText, { color: theme.textSecondary }]}>
                  {item.mutualFriendsCount} mutual connection{item.mutualFriendsCount !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.actionsContainer}>
          <Button 
            title={item.followStatus === 'following' ? 'Following' : item.followStatus === 'pending' ? 'Requested' : 'Follow'} 
            variant={item.followStatus === 'none' || !item.followStatus ? 'primary' : 'outline'}
            onPress={() => {
              if (item.followStatus === 'none' || !item.followStatus) {
                followMutation.mutate();
              }
            }}
            disabled={followMutation.isPending || (item.followStatus === 'following' || item.followStatus === 'pending')}
            style={styles.actionBtn}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Friend Suggestions</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : suggestions?.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No suggestions right now</Text>
        </View>
      ) : (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.id}
          renderItem={renderSuggestion}
          contentContainerStyle={styles.listContent}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.md,
  },
  listContent: {
    paddingVertical: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  fullName: {
    fontSize: typography.sizes.md,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  username: {
    fontSize: typography.sizes.sm,
    marginBottom: 2,
  },
  mutualContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mutualText: {
    fontSize: typography.sizes.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    height: 32,
    paddingVertical: 0,
    paddingHorizontal: 16,
    borderRadius: 16,
  }
});
