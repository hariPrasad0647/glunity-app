import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { TokenReference } from '~/types';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';
import { radius } from '~/theme/radius';

interface TokenCardProps {
  token: TokenReference;
}

export function TokenCard({ token }: TokenCardProps) {
  const { theme } = useTheme();

  const isPositive = token.priceChange24h >= 0;
  const changeColor = isPositive ? theme.success : theme.danger;

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.header}>
        <Text style={[styles.symbol, { color: theme.textPrimary }]}>{token.symbol} Token</Text>
        <Text style={[styles.price, { color: theme.textPrimary }]}>${token.price.toFixed(4)}</Text>
      </View>
      <View style={styles.footer}>
        <Text style={[styles.symbol, { color: theme.textSecondary }]}>{token.symbol}</Text>
        <Text style={[styles.change, { color: changeColor }]}>
          {isPositive ? '+' : ''}{token.priceChange24h.toFixed(2)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symbol: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  price: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  change: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
});
