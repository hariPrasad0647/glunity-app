import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '~/hooks/useTheme';
import { useMarketData } from '~/queries/research/useMarketData';
import { LoadingState } from '~/components/common/LoadingState';
import { EmptyState } from '~/components/common/EmptyState';
import { ErrorState } from '~/components/common/ErrorState';
import { LineChart, Search } from 'lucide-react-native';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';
import { radius } from '~/theme/radius';

export function ResearchScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [symbol, setSymbol] = useState('GLUN/USDT');
  const { data: marketData, isLoading, isError, error, refetch } = useMarketData(symbol);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Research</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Price Analysis</Text>
        </View>
        <Search size={24} color={theme.textPrimary} />
      </View>

      <View style={styles.selectorContainer}>
        <Text style={[styles.selectorText, { color: theme.primary }]}>{symbol} ▼</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>Price Analysis</Text>

        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState message={error?.message || 'Error loading market data'} onRetry={refetch} />
        ) : !marketData ? (
          <EmptyState 
            title="No market data available" 
            message="We couldn't fetch the latest price data."
            icon={<LineChart size={48} color={theme.textSecondary} />}
          />
        ) : (
          <View>
            <Text style={[styles.price, { color: theme.textPrimary }]}>${marketData.price.toFixed(6)}</Text>
            <Text style={[styles.change, { color: marketData.priceChange24h >= 0 ? theme.success : theme.danger }]}>
              {marketData.priceChange24h >= 0 ? '+' : ''}{marketData.priceChange24h.toFixed(2)}%
            </Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>24H High</Text>
                <Text style={[styles.statValue, { color: theme.textPrimary }]}>${marketData.high24h.toFixed(6)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>24H Low</Text>
                <Text style={[styles.statValue, { color: theme.textPrimary }]}>${marketData.low24h.toFixed(6)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Volume (24h)</Text>
                <Text style={[styles.statValue, { color: theme.textPrimary }]}>${marketData.volume24h.toLocaleString()}</Text>
              </View>
            </View>

            <View style={[styles.chartPlaceholder, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
              <Text style={{ color: theme.textSecondary }}>Chart Placeholder</Text>
            </View>

            <View style={styles.timeframes}>
              {['1H', '24H', '7D', '30D'].map((tf) => (
                <View key={tf} style={[styles.timeframeButton, tf === '24H' && { backgroundColor: theme.primary }]}>
                  <Text style={[styles.timeframeText, { color: tf === '24H' ? '#fff' : theme.textSecondary }]}>{tf}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
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
    padding: spacing.md,
    marginTop: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    fontSize: typography.sizes.lg,
  },
  selectorContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  selectorText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  card: {
    margin: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.sm,
  },
  price: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
  },
  change: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  chartPlaceholder: {
    height: 200,
    borderWidth: 1,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  timeframes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeframeButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.xl,
  },
  timeframeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
});
