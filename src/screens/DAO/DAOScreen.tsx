import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '~/hooks/useTheme';
import { useProposals } from '~/queries/dao/useDAO';
import { LoadingState } from '~/components/common/LoadingState';
import { EmptyState } from '~/components/common/EmptyState';
import { ErrorState } from '~/components/common/ErrorState';
import { Building2 } from 'lucide-react-native';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';
import { radius } from '~/theme/radius';

export function DAOScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'active' | 'passed'>('active');
  const { data: proposals, isLoading, isError, error, refetch } = useProposals();

  const filteredProposals = proposals?.filter(p => 
    activeTab === 'active' ? p.status === 'active' : p.status !== 'active'
  ) || [];

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>DAO</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Governance & Proposals</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'active' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'active' ? theme.primary : theme.textSecondary }]}>
            Active Proposals
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'passed' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('passed')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'passed' ? theme.primary : theme.textSecondary }]}>
            Past Proposals
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <LoadingState fullScreen />
      ) : isError ? (
        <ErrorState message={error?.message || 'Failed to load proposals'} onRetry={refetch} />
      ) : (
        <FlatList
          data={filteredProposals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.proposalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.proposalTitle, { color: theme.textPrimary }]}>{item.title}</Text>
              <Text style={[styles.proposalDesc, { color: theme.textSecondary }]}>{item.description}</Text>
            </View>
          )}
          contentContainerStyle={filteredProposals.length === 0 ? styles.emptyContainer : styles.listContent}
          ListEmptyComponent={
            <EmptyState 
              title="No proposals" 
              message={`There are no ${activeTab} proposals right now.`}
              icon={<Building2 size={48} color={theme.textSecondary} />}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
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
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  listContent: {
    padding: spacing.md,
  },
  emptyContainer: {
    flex: 1,
  },
  proposalCard: {
    padding: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  proposalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  proposalDesc: {
    fontSize: typography.sizes.md,
    lineHeight: 20,
  },
});
