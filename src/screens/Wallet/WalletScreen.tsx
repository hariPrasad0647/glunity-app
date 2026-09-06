import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '~/hooks/useTheme';
import { Button } from '~/components/common/Button';
import { Wallet as WalletIcon } from 'lucide-react-native';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';

export function WalletScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <WalletIcon size={80} color={theme.textSecondary} strokeWidth={1.5} style={styles.icon} />
        
        <Text style={[styles.comingIn, { color: theme.textPrimary }]}>Coming in</Text>
        <Text style={[styles.phaseText, { color: theme.primary }]}>Phase 5</Text>
        <Text style={[styles.dateText, { color: theme.textSecondary }]}>Q4 2026</Text>
      </View>

      <View style={styles.footer}>
        <Button 
          title="Import wallet" 
          variant="primary"
          style={styles.button}
        />
        <Button 
          title="Create wallet" 
          variant="outline"
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing.xxl * 2, // Shift content slightly up
  },
  icon: {
    marginBottom: spacing.lg,
  },
  comingIn: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  phaseText: {
    fontSize: 40,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  dateText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  footer: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  button: {
    width: '100%',
  },
});
