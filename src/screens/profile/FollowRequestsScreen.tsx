import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/navigation/RootNavigator';
import { useTheme } from '~/hooks/useTheme';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';
import { ChevronLeft } from 'lucide-react-native';
import { 
  useFollowRequestsQuery, 
  useAcceptRequestMutation, 
  useRejectRequestMutation,
  BasicUser 
} from '~/queries/profile/profileQueries';
import { Button } from '~/components/common/Button';
import { Avatar } from '~/components/common/Avatar';

type Props = NativeStackScreenProps<RootStackParamList, 'FollowRequests'>;

export function FollowRequestsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  
  const { data: requests, isLoading } = useFollowRequestsQuery();
  const acceptMutation = useAcceptRequestMutation();
  const rejectMutation = useRejectRequestMutation();

  const renderRequest = ({ item }: { item: BasicUser }) => (
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
        </View>
      </TouchableOpacity>

      <View style={styles.actionsContainer}>
        <Button 
          title="Accept" 
          onPress={() => acceptMutation.mutate(item.id)}
          disabled={acceptMutation.isPending || rejectMutation.isPending}
          style={styles.actionBtn}
        />
        <Button 
          title="Reject" 
          variant="outline"
          onPress={() => rejectMutation.mutate(item.id)}
          disabled={acceptMutation.isPending || rejectMutation.isPending}
          style={[styles.actionBtn, styles.rejectBtn]}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Follow Requests</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : requests?.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No pending requests</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderRequest}
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: typography.sizes.lg,
  },
  textContainer: {
    flex: 1,
  },
  fullName: {
    fontSize: typography.sizes.md,
    marginBottom: 2,
  },
  username: {
    fontSize: typography.sizes.sm,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginLeft: 8,
  },
  rejectBtn: {
    minWidth: 70,
  }
});
