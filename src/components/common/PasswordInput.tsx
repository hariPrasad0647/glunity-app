import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';

interface PasswordInputProps extends TextInputProps {
  error?: boolean;
}

export function PasswordInput({ error, style, ...props }: PasswordInputProps) {
  const { theme } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.surfaceSecondary,
            color: theme.textPrimary,
            borderColor: error ? theme.danger : theme.border,
          },
          style,
        ]}
        secureTextEntry={!isPasswordVisible}
        autoCapitalize="none"
        autoCorrect={false}
        {...props}
      />
      <Pressable
        style={styles.iconContainer}
        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
      >
        {isPasswordVisible ? (
          <EyeOff size={20} color={theme.textSecondary} />
        ) : (
          <Eye size={20} color={theme.textSecondary} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 50, // Space for the icon
    fontSize: 16,
    borderWidth: 1,
  },
  iconContainer: {
    position: 'absolute',
    right: 16,
    height: '100%',
    justifyContent: 'center',
  },
});
