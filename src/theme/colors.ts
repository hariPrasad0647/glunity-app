export const colors = {
  light: {
    background: '#FFFFFF',
    surface: '#F8FAFC',
    surfaceSecondary: '#F1F5F9',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    primary: '#2563EB',
    primaryPressed: '#1D4ED8',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
  dark: {
    background: '#0B0F19',
    surface: '#111827',
    surfaceSecondary: '#1F2937',
    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    primary: '#3B82F6',
    primaryPressed: '#60A5FA',
    success: '#10B981',
    warning: '#FBBF24',
    danger: '#F87171',
  },
};

export type ColorTheme = typeof colors.light;
