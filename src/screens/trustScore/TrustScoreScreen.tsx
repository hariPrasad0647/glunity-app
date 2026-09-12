import React, { useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/navigation/RootNavigator';
import { useTheme } from '~/hooks/useTheme';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';
import { ChevronLeft, CheckCircle2, XCircle, Shield } from 'lucide-react-native';
import { 
  useMyTrustScore, 
  useMyTrustScoreHistory, 
  TrustScoreHistoryItem,
  TrustScoreComponents
} from '~/queries/trustScore/trustScoreQueries';
import { getTierColor } from '~/theme/trustScoreTheme';
import { TrustScoreRing } from '~/components/trustScore/TrustScoreRing';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Button } from '~/components/common/Button';
import { Skeleton } from '~/components/common/Skeleton';

type Props = NativeStackScreenProps<RootStackParamList, 'TrustScore'>;

export function TrustScoreScreen({ navigation }: Props) {
  const { theme } = useTheme();

  const { 
    data: trustScoreData, 
    isLoading: isLoadingScore, 
    isError: isErrorScore, 
    refetch: refetchScore 
  } = useMyTrustScore();

  const { 
    data: historyData, 
    isLoading: isLoadingHistory,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch: refetchHistory
  } = useMyTrustScoreHistory();

  const handleRefresh = useCallback(() => {
    refetchScore();
    refetchHistory();
  }, [refetchScore, refetchHistory]);

  const renderComponentItem = (
    label: string, 
    score: number, 
    weight: number, 
    index: number,
    color: string
  ) => {
    return (
      <Animated.View 
        entering={FadeInDown.delay(300 + index * 100).springify()}
        style={styles.componentItem}
      >
        <View style={styles.componentHeader}>
          <Text style={[styles.componentLabel, { color: theme.textPrimary }]}>{label}</Text>
          <Text style={[styles.componentWeight, { color: theme.textSecondary }]}>{weight}%</Text>
        </View>
        <View style={styles.componentScoreRow}>
          <View style={[styles.progressBarBg, { backgroundColor: theme.surfaceSecondary }]}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${score}%`, backgroundColor: color }
              ]} 
            />
          </View>
          <Text style={[styles.componentScoreText, { color: theme.textPrimary }]}>{score}/100</Text>
        </View>
      </Animated.View>
    );
  };

  const renderHeader = () => {
    if (isLoadingScore) {
      return (
        <View style={styles.headerContainer}>
          <View style={styles.ringContainer}>
            <Skeleton width={200} height={200} circle />
          </View>
          <View style={styles.tierContainer}>
            <Skeleton width={120} height={28} borderRadius={14} />
          </View>
          <View style={styles.monetizationContainer}>
            <Skeleton width={180} height={28} borderRadius={14} />
          </View>
          <Skeleton width={160} height={16} borderRadius={8} style={{ alignSelf: 'center', marginBottom: spacing.xl }} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <Skeleton width={140} height={24} borderRadius={12} style={{ marginBottom: spacing.md }} />
          <View style={styles.componentsList}>
            {Array.from({ length: 5 }).map((_, i) => (
              <View key={i} style={styles.componentItem}>
                <View style={styles.componentHeader}>
                  <Skeleton width={140} height={16} borderRadius={8} />
                  <Skeleton width={30} height={14} borderRadius={7} />
                </View>
                <Skeleton width="100%" height={8} borderRadius={4} style={{ marginTop: 6 }} />
              </View>
            ))}
          </View>
        </View>
      );
    }

    if (isErrorScore || !trustScoreData) {
      return (
        <View style={styles.centerPadding}>
          <Text style={[styles.errorText, { color: theme.danger }]}>Unable to load Trust Score</Text>
          <Button title="Try Again" onPress={handleRefresh} style={{ marginTop: spacing.md }} />
        </View>
      );
    }

    const { score, tier, monetizationEligible, components, weights, calculatedAt } = trustScoreData;
    const tierColor = getTierColor(tier);

    // Format date nicely
    const dateObj = new Date(calculatedAt);
    const formattedDate = isNaN(dateObj.getTime()) 
      ? calculatedAt 
      : dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

    return (
      <View style={styles.headerContainer}>
        {/* Main Score Visualization */}
        <View style={styles.ringContainer}>
          <TrustScoreRing score={score} color={tierColor} size={200} strokeWidth={16} />
        </View>
        
        {/* Tier Info */}
        <Animated.View entering={FadeIn.delay(600).duration(800)} style={styles.tierContainer}>
          <Text style={[styles.tierLabel, { color: tierColor }]}>{tier.replace('_', ' ')}</Text>
        </Animated.View>

        {/* Monetization Eligibility */}
        <Animated.View entering={FadeIn.delay(700).duration(800)} style={styles.monetizationContainer}>
          {monetizationEligible ? (
            <View style={[styles.monetizationBadge, { backgroundColor: theme.success + '20' }]}>
              <CheckCircle2 size={16} color={theme.success} />
              <Text style={[styles.monetizationText, { color: theme.success }]}> Monetization Eligible</Text>
            </View>
          ) : (
            <View style={[styles.monetizationBadge, { backgroundColor: theme.textSecondary + '20' }]}>
              <XCircle size={16} color={theme.textSecondary} />
              <Text style={[styles.monetizationText, { color: theme.textSecondary }]}> Not Yet Eligible</Text>
            </View>
          )}
        </Animated.View>
        
        <Text style={[styles.lastUpdatedText, { color: theme.textSecondary }]}>
          Last updated: {formattedDate}
        </Text>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* Components Breakdown */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Score Breakdown</Text>
        
        <View style={styles.componentsList}>
          {renderComponentItem('On-Chain Activities', components.onChain, weights.onChain, 0, tierColor)}
          {renderComponentItem('Smart Followers', components.smartFollowers, weights.smartFollowers, 1, tierColor)}
          {renderComponentItem('Community Engagement', components.engagement, weights.engagement, 2, tierColor)}
          {renderComponentItem('Account Longevity', components.longevity, weights.longevity, 3, tierColor)}
          {renderComponentItem('Verified Community Reports', components.reports, weights.reports, 4, tierColor)}
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Trust Score History</Text>
      </View>
    );
  };

  const renderHistoryItem = ({ item }: { item: TrustScoreHistoryItem }) => {
    const itemColor = getTierColor(item.tier);
    const dateObj = new Date(item.calculatedAt);
    const formattedDate = isNaN(dateObj.getTime()) 
      ? item.calculatedAt 
      : dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    const formattedScore = typeof item.finalScore === 'number' ? Math.round(item.finalScore).toString() : item.finalScore;

    return (
      <View style={[styles.historyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.historyLeft}>
          <Text style={[styles.historyScore, { color: theme.textPrimary }]}>{formattedScore}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.historyTier, { color: itemColor }]}>{item.tier.replace('_', ' ')}</Text>
            <Text style={[styles.historyMeta, { color: theme.textSecondary }]} numberOfLines={2}>
              {item.calculationReason} · {formattedDate}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const historyItems = historyData?.pages.flatMap(page => page.history) || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      {/* Navigation Bar */}
      <View style={[styles.navBar, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ChevronLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: theme.textPrimary }]}>Trust Score</Text>
        <View style={styles.iconBtn} />
      </View>

      <FlatList
        data={historyItems}
        keyExtractor={(item, index) => `${item.calculatedAt}-${index}`}
        ListHeaderComponent={renderHeader}
        renderItem={renderHistoryItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingScore || isLoadingHistory}
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
        ListEmptyComponent={
          !isLoadingHistory && !isErrorScore ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No history available.</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 10,
  },
  iconBtn: { padding: 8, width: 40 },
  navTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  centerPadding: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.sm,
  },
  headerContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },
  ringContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  tierContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tierLabel: {
    fontSize: 22,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
  },
  monetizationContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  monetizationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  monetizationText: {
    fontSize: typography.sizes.sm,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  lastUpdatedText: {
    textAlign: 'center',
    fontSize: typography.sizes.sm,
    marginBottom: spacing.xl,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  componentsList: {
    marginBottom: spacing.lg,
  },
  componentItem: {
    marginBottom: spacing.md,
  },
  componentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  componentLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  componentWeight: {
    fontSize: typography.sizes.sm,
  },
  componentScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  componentScoreText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    width: 60,
    textAlign: 'right',
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyScore: {
    fontSize: 24,
    fontWeight: typography.weights.bold,
    width: 60,
    marginRight: 12,
  },
  historyTier: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: 2,
  },
  historyMeta: {
    fontSize: typography.sizes.sm,
  },
  emptyText: {
    textAlign: 'center',
    padding: spacing.xl,
  },
});
