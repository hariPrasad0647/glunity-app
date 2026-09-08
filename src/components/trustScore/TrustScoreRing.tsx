import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  withTiming, 
  useAnimatedProps,
  Easing,
  runOnJS,
  useAnimatedStyle
} from 'react-native-reanimated';
import { useTheme } from '~/hooks/useTheme';
import { typography } from '~/theme/typography';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface TrustScoreRingProps {
  score: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  animateDuration?: number;
}

export function TrustScoreRing({ 
  score, 
  color,
  size = 180, 
  strokeWidth = 14,
  animateDuration = 1200 
}: TrustScoreRingProps) {
  const { theme } = useTheme();
  
  // Display score state for the counter
  const [displayScore, setDisplayScore] = useState(0);
  
  const progress = useSharedValue(0);
  const scoreValue = useSharedValue(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    // Only animate if the score is greater than 0, otherwise it stays at 0
    if (score > 0) {
      // Progress animation (0 to percentage)
      const targetProgress = score / 100;
      progress.value = withTiming(targetProgress, {
        duration: animateDuration,
        easing: Easing.out(Easing.cubic),
      });

      // Number counter animation
      let startTime: number | null = null;
      let animationFrameId: number;

      const animateNumber = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        
        // Use a cubic ease-out for the number as well
        const t = Math.min(elapsed / animateDuration, 1);
        const easeOut = 1 - Math.pow(1 - t, 3);
        
        const currentScore = Math.round(easeOut * score);
        setDisplayScore(currentScore);

        if (t < 1) {
          animationFrameId = requestAnimationFrame(animateNumber);
        } else {
          setDisplayScore(score); // ensure final exact value
        }
      };

      animationFrameId = requestAnimationFrame(animateNumber);

      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    } else {
       setDisplayScore(0);
       progress.value = 0;
    }
  }, [score, animateDuration]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - progress.value * circumference;
    return {
      strokeDashoffset,
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          stroke={theme.surfaceSecondary}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <AnimatedCircle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          // Rotate -90 degrees so progress starts from top
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={[styles.scoreText, { color: theme.textPrimary }]}>
          {displayScore}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 48,
    fontWeight: typography.weights.bold,
  },
});
