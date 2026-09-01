import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Animated, Platform } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';
import { radius } from '~/theme/radius';

export interface Option {
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
  isDestructive?: boolean;
}

interface OptionsModalProps {
  visible: boolean;
  options: Option[];
  onClose: () => void;
}

export function OptionsModal({ visible, options, onClose }: OptionsModalProps) {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 0,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <Animated.View
              style={[
                styles.sheet,
                {
                  backgroundColor: theme.surface,
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [300, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.handleContainer}>
                <View style={[styles.handle, { backgroundColor: theme.border }]} />
              </View>
              
              <View style={styles.optionsContainer}>
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionRow,
                      index < options.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
                    ]}
                    onPress={() => {
                      onClose();
                      // Slight delay to allow modal to close before triggering action
                      setTimeout(option.onPress, 100);
                    }}
                    activeOpacity={0.7}
                  >
                    {option.icon && <View style={styles.iconContainer}>{option.icon}</View>}
                    <Text
                      style={[
                        styles.optionLabel,
                        { color: option.isDestructive ? theme.danger : theme.textPrimary },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.surfaceSecondary }]}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={[styles.cancelLabel, { color: theme.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  optionsContainer: {
    marginBottom: spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  optionLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  cancelButton: {
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});
