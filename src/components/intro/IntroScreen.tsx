import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '~/hooks/useTheme';
import { typography } from '~/theme/typography';


interface IntroScreenProps {
  onFinish: () => void;
}

const { width } = Dimensions.get('window');

export function IntroScreen({ onFinish }: IntroScreenProps) {
  // We use dark mode colors for the intro to make it feel premium, 
  // as per "Dark navy / clean background" request.
  const { theme } = useTheme();

  // Animation values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);

  useEffect(() => {
    // 1. Logo fades and scales in
    logoOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.exp) });
    logoScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.exp) });

    // 2. Glunity text fades and slides up
    textOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) })
    );
    textTranslateY.value = withDelay(
      400,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) })
    );

    // 3. Finish intro after 2 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [{ scale: logoScale.value }],
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      transform: [{ translateY: textTranslateY.value }],
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: '#0B0F19' }]}>
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <Image
          source={require('../../../assets/logo.png')}
          style={{ width: 380, height: 290 }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(59, 130, 246, 0.1)', // Subtle blue glow behind icon
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  brandName: {
    fontSize: 32, // Large typography for intro
    fontWeight: '700',
    letterSpacing: 4,
  },
});
