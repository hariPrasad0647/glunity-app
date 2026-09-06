import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '~/hooks/useTheme';
import { Calendar, Hourglass, FileText, ShieldCheck, Sparkles } from 'lucide-react-native';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';
import { radius } from '~/theme/radius';

export function DAOScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'active' | 'passed'>('active');

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>DAO</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Governance & Proposals</Text>
      </View>

      <View style={[styles.tabs, { borderBottomColor: theme.border }]}>
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

      <View style={styles.contentContainer}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={[styles.illustrationBase, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF' }]}>
            <FileText size={64} color={isDark ? '#60A5FA' : '#93C5FD'} strokeWidth={1.5} />
            <View style={styles.shieldContainer}>
              <ShieldCheck size={32} color={theme.primary} fill={isDark ? 'rgba(59, 130, 246, 0.3)' : '#EFF6FF'} strokeWidth={2} />
            </View>
          </View>
          <Sparkles size={16} color={isDark ? '#60A5FA' : '#93C5FD'} style={[styles.sparkle, { top: 0, right: 20 }]} />
          <Sparkles size={12} color={isDark ? '#60A5FA' : '#93C5FD'} style={[styles.sparkle, { bottom: 20, left: 10 }]} />
          <Sparkles size={14} color={isDark ? '#60A5FA' : '#93C5FD'} style={[styles.sparkle, { top: 30, left: -10 }]} />
        </View>

        {/* Title */}
        <Text style={[styles.mainTitle, { color: theme.textPrimary }]}>
          DAO Proposals{'\n'}& On-Chain Binding
        </Text>

        {/* Badge */}
        <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF' }]}>
          <Calendar size={14} color={theme.primary} />
          <Text style={[styles.badgeText, { color: theme.primary }]}>Phase 7 • Q1–Q2 2027</Text>
        </View>

        {/* Description */}
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          DAO proposals and on-chain binding{'\n'}will be live in Phase 7.
        </Text>

        {/* Separator with Hourglass */}
        <View style={styles.separatorContainer}>
          <View style={[styles.line, { backgroundColor: theme.border }]} />
          <View style={[styles.iconWrapper, { backgroundColor: theme.background }]}>
            <Hourglass size={16} color={theme.primary} />
          </View>
          <View style={[styles.line, { backgroundColor: theme.border }]} />
        </View>

        {/* Footer Text */}
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          Coming soon. Stay tuned!
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
    fontSize: typography.sizes.lg,
    marginTop: spacing.xs,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: spacing.xl,
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
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xxl,
  },
  illustrationContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    width: 120,
    height: 100,
  },
  illustrationBase: {
    width: 80,
    height: 90,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldContainer: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    backgroundColor: '#fff', // Or maybe transparent, handled by fill
    borderRadius: 16,
  },
  sparkle: {
    position: 'absolute',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: spacing.lg,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  badgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  description: {
    fontSize: typography.sizes.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    marginBottom: spacing.xl,
  },
  line: {
    flex: 1,
    height: 1,
  },
  iconWrapper: {
    paddingHorizontal: spacing.md,
  },
  footerText: {
    fontSize: typography.sizes.sm,
  },
});
