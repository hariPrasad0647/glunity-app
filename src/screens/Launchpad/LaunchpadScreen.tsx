import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '~/hooks/useTheme';
import { useLaunchpad } from '~/queries/launchpad/useLaunchpad';
import { LoadingState } from '~/components/common/LoadingState';
import { EmptyState } from '~/components/common/EmptyState';
import { ErrorState } from '~/components/common/ErrorState';
import { Rocket } from 'lucide-react-native';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';
import { radius } from '~/theme/radius';

export function LaunchpadScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'ongoing' | 'upcoming'>('ongoing');
  const { data: projects, isLoading, isError, error, refetch } = useLaunchpad();

  const filteredProjects = projects?.filter(p => p.status === activeTab) || [];

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Launchpad</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>IDO & Token Launchpad</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'ongoing' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('ongoing')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'ongoing' ? theme.primary : theme.textSecondary }]}>
            Ongoing IDOs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'upcoming' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'upcoming' ? theme.primary : theme.textSecondary }]}>
            Upcoming
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <LoadingState fullScreen />
      ) : isError ? (
        <ErrorState message={error?.message || 'Failed to load projects'} onRetry={refetch} />
      ) : (
        <FlatList
          data={filteredProjects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.projectCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.projectName, { color: theme.textPrimary }]}>{item.name}</Text>
              <Text style={[styles.projectDesc, { color: theme.textSecondary }]}>{item.description}</Text>
            </View>
          )}
          contentContainerStyle={filteredProjects.length === 0 ? styles.emptyContainer : styles.listContent}
          ListEmptyComponent={
            <EmptyState 
              title="No projects" 
              message={`There are no ${activeTab} IDOs at the moment.`}
              icon={<Rocket size={48} color={theme.textSecondary} />}
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
    borderBottomColor: '#E2E8F0', // Or use theme.border
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
  projectCard: {
    padding: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  projectName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  projectDesc: {
    fontSize: typography.sizes.md,
    lineHeight: 20,
  },
});
