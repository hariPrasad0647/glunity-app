import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '~/hooks/useTheme';
import { useWallet } from '~/queries/wallet/useWallet';
import { LoadingState } from '~/components/common/LoadingState';
import { EmptyState } from '~/components/common/EmptyState';
import { ErrorState } from '~/components/common/ErrorState';
import { Button } from '~/components/common/Button';
import { Wallet as WalletIcon, Plus } from 'lucide-react-native';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';
import { radius } from '~/theme/radius';

export function WalletScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { data: balances, isLoading, isError, error, refetch } = useWallet();
  const [address, setAddress] = useState('');

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Wallet</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Your Assets</Text>
          <View style={[styles.infoBanner, { backgroundColor: theme.surfaceSecondary }]}>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              Glunity never holds your keys or your funds. This view is read-only.
            </Text>
          </View>
        </View>

        <View style={styles.assetsSection}>
          {isLoading ? (
            <LoadingState />
          ) : isError ? (
            <ErrorState message={error?.message || 'Unable to load wallet'} onRetry={refetch} />
          ) : balances?.length === 0 ? (
            <EmptyState 
              title="No assets found" 
              message="Watch any wallet to see its balances here."
              icon={<WalletIcon size={48} color={theme.textSecondary} />}
            />
          ) : (
            balances?.map((balance, index) => (
              <View key={index} style={[styles.balanceCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.symbol, { color: theme.textPrimary }]}>{balance.symbol}</Text>
                <Text style={[styles.amount, { color: theme.textPrimary }]}>{balance.amount}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.watchSection}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Watch any wallet</Text>
          <Text style={[styles.sectionDesc, { color: theme.textSecondary }]}>
            Paste a public address to see its real balances and recent transfers across chains.
            Read-only — nothing is signed and no keys are involved.
          </Text>
          
          <TextInput
            style={[
              styles.input, 
              { 
                backgroundColor: theme.surface, 
                borderColor: theme.border, 
                color: theme.textPrimary 
              }
            ]}
            placeholder="Wallet address"
            placeholderTextColor={theme.textSecondary}
            value={address}
            onChangeText={setAddress}
            autoCapitalize="none"
          />
          
          <Button 
            title="Add address" 
            onPress={() => {}} 
            variant="primary"
            style={styles.addButton}
          />

          <Button 
            title="Connect wallet" 
            onPress={() => {}} 
            variant="outline"
            style={styles.connectButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    marginBottom: spacing.md,
  },
  infoBanner: {
    padding: spacing.md,
    borderRadius: radius.md,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
  assetsSection: {
    minHeight: 200,
    marginBottom: spacing.xl,
  },
  balanceCard: {
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  symbol: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  amount: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  watchSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  sectionDesc: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    marginBottom: spacing.md,
  },
  addButton: {
    marginBottom: spacing.md,
  },
  connectButton: {
    
  },
});
