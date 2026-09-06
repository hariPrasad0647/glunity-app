import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { useMyReferral, useReferralHistory } from '~/queries/referrals/referralQueries';
import * as Clipboard from 'expo-clipboard';

export function ReferralScreen() {
  const { theme } = useTheme();
  const { data: stats, isLoading: statsLoading } = useMyReferral();
  const { data: history, isLoading: historyLoading } = useReferralHistory();

  const handleCopyCode = async () => {
    if (stats?.referral_code) {
      await Clipboard.setStringAsync(stats.referral_code);
      alert('Referral code copied to clipboard!');
    }
  };

  const handleCopyLink = async () => {
    if (stats?.referral_link) {
      await Clipboard.setStringAsync(stats.referral_link);
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
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.header, { color: theme.colors.text }]}>REFER & EARN</Text>
        
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Your Referral Code:</Text>
        <View style={styles.row}>
          <Text style={[styles.code, { color: theme.colors.primary }]}>{stats?.referral_code}</Text>
          <TouchableOpacity onPress={handleCopyCode} style={[styles.button, { backgroundColor: theme.colors.card }]}>
            <Text style={{ color: theme.colors.primary }}>Copy</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: 16 }]}>Your Referral Link:</Text>
        <View style={styles.row}>
          <Text style={[styles.link, { color: theme.colors.primary }]} numberOfLines={1}>
            {stats?.referral_link}
          </Text>
        </View>
        <View style={styles.row}>
          <TouchableOpacity onPress={handleCopyLink} style={[styles.button, { backgroundColor: theme.colors.card, flex: 1, marginRight: 8 }]}>
            <Text style={{ color: theme.colors.primary, textAlign: 'center' }}>Copy Link</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={[styles.button, { backgroundColor: theme.colors.primary, flex: 1, marginLeft: 8 }]}>
            <Text style={{ color: '#fff', textAlign: 'center' }}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.header, { color: theme.colors.text }]}>Referral Statistics</Text>
        <View style={[styles.statsGrid, { backgroundColor: theme.colors.card }]}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats?.total_referrals || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats?.successful_referrals || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Successful</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats?.pending_referrals || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Pending</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats?.points_earned || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Points</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.header, { color: theme.colors.text }]}>Referral History</Text>
        {historyLoading ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          history?.referrals.map((ref) => (
            <View key={ref.id} style={[styles.historyItem, { borderBottomColor: theme.colors.border }]}>
              <View>
                <Text style={[styles.historyTitle, { color: theme.colors.text }]}>
                  {ref.status === 'COMPLETED' ? 'Successful Referral' : 'Pending Referral'}
                </Text>
                <Text style={[styles.historyDate, { color: theme.colors.textSecondary }]}>
                  {new Date(ref.created_at).toLocaleDateString()}
                </Text>
              </View>
              <Text style={[styles.historyPoints, { color: ref.points_awarded > 0 ? theme.colors.success : theme.colors.textSecondary }]}>
                +{ref.points_awarded} pts
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
