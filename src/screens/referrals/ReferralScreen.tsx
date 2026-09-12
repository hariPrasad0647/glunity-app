import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Share, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { useMyReferral, useReferralHistory } from '~/queries/referrals/referralQueries';
import { Skeleton } from '~/components/common/Skeleton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Referrals'>;

export function ReferralScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { data: stats, isLoading: statsLoading } = useMyReferral();
  const { data: history, isLoading: historyLoading } = useReferralHistory();

  const handleCopyCode = () => {
    if (stats?.referral_code) {
      Clipboard.setString(stats.referral_code);
      alert('Referral code copied to clipboard!');
    }
  };

  const handleCopyLink = () => {
    if (stats?.referral_link) {
      Clipboard.setString(stats.referral_link);
      alert('Referral link copied to clipboard!');
    }
  };

  const handleShare = async () => {
    if (stats?.referral_link) {
      try {
        await Share.share({
          message: `Join me on Glunity: ${stats.referral_link}`,
        });
      } catch (error) {
        console.error('Error sharing', error);
      }
    }
  };

  if (statsLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
        <View style={[styles.navBar, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <ChevronLeft size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.navTitle, { color: theme.textPrimary }]}>Refer & Earn</Text>
          <View style={styles.iconBtn} />
        </View>
        <ScrollView style={styles.container}>
          <View style={styles.section}>
            <Skeleton width={140} height={24} borderRadius={8} style={{ marginBottom: 12 }} />
            <Skeleton width={120} height={16} borderRadius={8} style={{ marginBottom: 8 }} />
            <View style={styles.row}>
              <Skeleton width={160} height={32} borderRadius={8} />
              <Skeleton width={80} height={40} borderRadius={8} />
            </View>
            <Skeleton width={120} height={16} borderRadius={8} style={{ marginTop: 16, marginBottom: 8 }} />
            <Skeleton width="100%" height={24} borderRadius={8} style={{ marginBottom: 12 }} />
            <View style={styles.row}>
              <Skeleton width="48%" height={48} borderRadius={8} />
              <Skeleton width="48%" height={48} borderRadius={8} />
            </View>
          </View>
          <View style={styles.section}>
            <Skeleton width={160} height={24} borderRadius={8} style={{ marginBottom: 12 }} />
            <View style={[styles.statsGrid, { backgroundColor: theme.surface }]}>
               <Skeleton width="45%" height={60} borderRadius={8} style={{ margin: '2.5%' }} />
               <Skeleton width="45%" height={60} borderRadius={8} style={{ margin: '2.5%' }} />
               <Skeleton width="45%" height={60} borderRadius={8} style={{ margin: '2.5%' }} />
               <Skeleton width="45%" height={60} borderRadius={8} style={{ margin: '2.5%' }} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <View style={[styles.navBar, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ChevronLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: theme.textPrimary }]}>Refer & Earn</Text>
        <View style={styles.iconBtn} />
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.section}>
        <Text style={[styles.header, { color: theme.textPrimary }]}>REFER & EARN</Text>
        
        <Text style={[styles.label, { color: theme.textSecondary }]}>Your Referral Code:</Text>
        <View style={styles.row}>
          <Text style={[styles.code, { color: theme.primary }]}>{stats?.referral_code}</Text>
          <TouchableOpacity onPress={handleCopyCode} style={[styles.button, { backgroundColor: theme.surface }]}>
            <Text style={{ color: theme.primary }}>Copy</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: theme.textSecondary, marginTop: 16 }]}>Your Referral Link:</Text>
        <View style={styles.row}>
          <Text style={[styles.link, { color: theme.primary }]} numberOfLines={1}>
            {stats?.referral_link}
          </Text>
        </View>
        <View style={styles.row}>
          <TouchableOpacity onPress={handleCopyLink} style={[styles.button, { backgroundColor: theme.surface, flex: 1, marginRight: 8 }]}>
            <Text style={{ color: theme.primary, textAlign: 'center' }}>Copy Link</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={[styles.button, { backgroundColor: theme.primary, flex: 1, marginLeft: 8 }]}>
            <Text style={{ color: '#fff', textAlign: 'center' }}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.header, { color: theme.textPrimary }]}>Referral Statistics</Text>
        <View style={[styles.statsGrid, { backgroundColor: theme.surface }]}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stats?.total_referrals || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stats?.successful_referrals || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Successful</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stats?.pending_referrals || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pending</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stats?.points_earned || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Points</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.header, { color: theme.textPrimary }]}>Referral History</Text>
        {historyLoading ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : (
          history?.referrals.map((ref) => (
            <View key={ref.id} style={[styles.historyItem, { borderBottomColor: theme.border }]}>
              <View>
                <Text style={[styles.historyTitle, { color: theme.textPrimary }]}>
                  {ref.status === 'COMPLETED' ? 'Successful Referral' : 'Pending Referral'}
                </Text>
                <Text style={[styles.historyDate, { color: theme.textSecondary }]}>
                  {new Date(ref.created_at).toLocaleDateString()}
                </Text>
              </View>
              <Text style={[styles.historyPoints, { color: ref.points_awarded > 0 ? theme.success : theme.textSecondary }]}>
                +{ref.points_awarded} pts
              </Text>
            </View>
          ))
        )}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: { padding: 8, width: 40 },
  navTitle: { fontSize: 18, fontWeight: 'bold' },
  section: { padding: 16 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  label: { fontSize: 14, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  code: { fontSize: 24, fontWeight: 'bold', letterSpacing: 2 },
  link: { fontSize: 16, flex: 1 },
  button: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', borderRadius: 12, padding: 16 },
  statBox: { width: '50%', padding: 8, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 12, marginTop: 4 },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  historyTitle: { fontSize: 16, fontWeight: '500' },
  historyDate: { fontSize: 12, marginTop: 4 },
  historyPoints: { fontSize: 16, fontWeight: 'bold' },
});
