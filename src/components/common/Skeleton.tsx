import React, { useEffect } from 'react';
import { ViewStyle, StyleProp, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '~/hooks/useTheme';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius = 4,
  style,
  circle = false,
}) => {
  const { theme, isDark } = useTheme();
  
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // infinite
      true // reverse
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Match the app's skeleton background colors based on the theme
  const defaultColor = isDark ? theme.surfaceSecondary : '#E1E9EE';

  return (
    <Animated.View
      style={[
        {
          width: width,
          height: height,
          borderRadius: circle ? (typeof width === 'number' ? width / 2 : 50) : borderRadius,
          backgroundColor: defaultColor,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};
