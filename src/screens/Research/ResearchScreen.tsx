import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '~/hooks/useTheme';
import { Search } from 'lucide-react-native';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';

export function ResearchScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [symbol] = useState('GLUN/USDT');

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Research</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Token Analysis</Text>
        </View>
        <Search size={24} color={theme.textPrimary} />
      </View>

      <View style={styles.selectorContainer}>
        <Text style={[styles.selectorText, { color: theme.primary }]}>{symbol} ▼</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.mainText, { color: theme.textPrimary }]}>
          research on-chain data,{'\n'}
          community sentiment and{'\n'}
          whale alerts all in one place.
        </Text>
        
        <View style={[styles.separator, { backgroundColor: theme.primary }]} />
        
        <Text style={[styles.phaseText, { color: theme.textSecondary }]}>
          Coming in phase 6, Q1 2027
        </Text>
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          Under research
        </Text>
      </View>
    </View>
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
    marginTop: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    marginTop: spacing.xs,
  },
  selectorContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  selectorText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  mainText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: spacing.xl,
  },
  separator: {
    width: 40,
    height: 2,
    marginBottom: spacing.xl,
  },
  phaseText: {
    fontSize: typography.sizes.md,
    textAlign: 'center',
  },
  footer: {
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.sizes.md,
  },
});
