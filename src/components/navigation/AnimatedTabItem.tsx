import React, { useEffect } from 'react';
import { View, TouchableWithoutFeedback, StyleSheet, AccessibilityRole } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming, 
  interpolateColor,
  Easing
} from 'react-native-reanimated';
import { useTheme } from '~/hooks/useTheme';
import { spacing } from '~/theme/spacing';
import { typography } from '~/theme/typography';

interface AnimatedTabItemProps {
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  label: string;
  icon: React.ReactNode;
}

export function AnimatedTabItem({ isFocused, onPress, onLongPress, label, icon }: AnimatedTabItemProps) {
  const { theme } = useTheme();
  
  const scale = useSharedValue(isFocused ? 1 : 0.9);
  const progress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0.9, { 
      damping: 15,
      stiffness: 250,
      mass: 0.8
    });
    progress.value = withTiming(isFocused ? 1 : 0, {
      duration: 250,
      easing: Easing.out(Easing.ease)
    });
  }, [isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const animatedLabelStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [{ translateY: (1 - progress.value) * 5 }],
      color: theme.primary, // The active color
    };
  });

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
    >
      <View style={styles.container}>
        <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
          {/* We assume the icon passed respects the color naturally, but since we are replacing it at a higher level, 
              we rely on the parent mapping the color. For a true reanimated color transition on the SVG itself, 
              we would need an animated SVG component. Here we focus on scale and layout transitions. */}
          {icon}
        </Animated.View>
        <Animated.Text style={[styles.label, animatedLabelStyle]}>
          {label}
        </Animated.Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    marginTop: 4,
    position: 'absolute',
    bottom: -16, // Hidden natively unless focused
  },
});
