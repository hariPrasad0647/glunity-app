import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';
import { radius } from '~/theme/radius';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

export function Button({ title, variant = 'primary', isLoading, style, disabled, ...props }: ButtonProps) {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return theme.surfaceSecondary;
    switch (variant) {
      case 'primary': return theme.primary;
      case 'secondary': return theme.surfaceSecondary;
      case 'outline': return 'transparent';
      default: return theme.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.textSecondary;
    switch (variant) {
      case 'primary': return '#FFFFFF';
      case 'secondary': return theme.textPrimary;
      case 'outline': return theme.primary;
      default: return '#FFFFFF';
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') return theme.border;
    return 'transparent';
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor(), borderColor: getBorderColor(), borderWidth: variant === 'outline' ? 1 : 0 },
        style
      ]}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
});
