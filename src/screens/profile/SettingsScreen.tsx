import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/navigation/RootNavigator';
import { useTheme } from '~/hooks/useTheme';
import { useThemeStore } from '~/store/themeStore';
import { typography } from '~/theme/typography';
import { useAuthStore } from '~/store/authStore';
import { spacing } from '~/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { logout } = useAuthStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ChevronLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
          <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.surfaceSecondary, true: theme.primary }}
            thumbColor={'#fff'}
          />
        </View>

        <TouchableOpacity 
          style={[styles.settingRow, { borderBottomColor: theme.border }]}
          onPress={() => navigation.navigate('UserActivity')}
        >
          <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>User Activity</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingRow, { borderBottomColor: theme.border }]}
          onPress={() => navigation.navigate('AirdropPoints')}
        >
          <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Airdrop Points</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingRow, { borderBottomColor: theme.border }]}
          onPress={() => navigation.navigate('Referrals')}
        >
          <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Refer & Earn</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingRow, { borderBottomColor: theme.border }]}
          onPress={() => {
            logout();
          }}
        >
          <Text style={[styles.settingLabel, { color: theme.error }]}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
  },
  content: {
    padding: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
  }
});
