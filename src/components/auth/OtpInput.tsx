import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { Text } from 'react-native'; // Use standard Text, styled

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function OtpInput({ length = 6, value, onChange, disabled = false }: OtpInputProps) {
  const { theme } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const handlePress = () => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.boxesContainer} onPress={handlePress}>
        {Array.from({ length }).map((_, index) => {
          const digit = value[index] || '';
          const isCurrentBox = value.length === index;
          const isActive = isCurrentBox && focused;
          
          return (
            <View
              key={index}
              style={[
                styles.box,
                {
                  backgroundColor: theme.surfaceSecondary,
                  borderColor: isActive ? theme.primary : theme.border,
                  borderWidth: isActive ? 2 : 1,
                }
              ]}
            >
              <Text style={[styles.digit, { color: theme.textPrimary }]}>
                {digit}
              </Text>
            </View>
          );
        })}
      </Pressable>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => {
          if (text.length <= length && /^[0-9]*$/.test(text)) {
            onChange(text);
          }
        }}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoFocus
        maxLength={length}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={styles.hiddenInput}
        editable={!disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 24,
  },
  boxesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  digit: {
    fontSize: 24,
    fontWeight: '600',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: '100%',
  },
});
