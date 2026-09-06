import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '~/hooks/useTheme';
import { Rocket, Calendar } from 'lucide-react-native';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';
import { radius } from '~/theme/radius';

export function LaunchpadScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'ongoing' | 'past' | 'upcoming'>('ongoing');

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
          style={[styles.tab, activeTab === 'past' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'past' ? theme.primary : theme.textSecondary }]}>
            Past IDOs
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

      <View style={styles.comingSoonContainer}>
        <View style={styles.iconContainer}>
          <Rocket size={48} color="#475569" strokeWidth={1.5} style={{ zIndex: 1 }} />
          <View style={[styles.iconShadow, { backgroundColor: theme.primary + '15' }]} />
        </View>

        <Text style={[styles.comingSoonTitle, { color: theme.textPrimary }]}>
          Launchpad functionalities{'\n'}will be live in
        </Text>

        <View style={[styles.badge, { backgroundColor: theme.primary + '10' }]}>
          <Calendar size={16} color={theme.primary} />
          <Text style={[styles.badgeText, { color: theme.primary }]}>Phase 7 • Q1-Q2 2027</Text>
        </View>

        <Text style={[styles.stayTuned, { color: theme.textSecondary }]}>
          Stay tuned for updates!
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
    padding: spacing.md,
    marginTop: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9', // light gray
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
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  comingSoonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl * 2, // move it up slightly
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    position: 'relative',
  },
  iconShadow: {
    width: 64,
    height: 16,
    borderRadius: 8,
    position: 'absolute',
    bottom: -6,
  },
  comingSoonTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: spacing.lg,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  badgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  stayTuned: {
    fontSize: typography.sizes.sm,
  },
});
