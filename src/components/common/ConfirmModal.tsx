import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Animated } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';
import { radius } from '~/theme/radius';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { theme } = useTheme();

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={[styles.dialog, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
              <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { backgroundColor: theme.surfaceSecondary }]}
                  onPress={onCancel}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.buttonText, { color: theme.textPrimary }]}>{cancelText}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.confirmButton,
                    { backgroundColor: isDestructive ? theme.danger : theme.primary },
                  ]}
                  onPress={onConfirm}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>{confirmText}</Text>
                </TouchableOpacity>
              </View>
            </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.sizes.md,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {},
  confirmButton: {},
  buttonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});
