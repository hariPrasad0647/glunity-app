import React, { useEffect, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { useTheme } from '~/hooks/useTheme';
import { AnimatedTabItem } from './AnimatedTabItem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeIcon, WalletIcon, ResearchIcon, LaunchpadIcon, DaoIcon } from './TabIcons';

const { width } = Dimensions.get('window');

// Map route names to icons
const getIconForRoute = (routeName: string, color: string, size: number) => {
  switch (routeName) {
    case 'Home': return <HomeIcon color={color} size={size} />;
    case 'Wallet': return <WalletIcon color={color} size={size} />;
    case 'Research': return <ResearchIcon color={color} size={size} />;
    case 'Launchpad': return <LaunchpadIcon color={color} size={size} />;
    case 'DAO': return <DaoIcon color={color} size={size} />;
    default: return <HomeIcon color={color} size={size} />;
  }
};

export function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  // To move the indicator, we need to know the width of a single tab
  const tabWidth = width / state.routes.length;
  const indicatorPosition = useSharedValue(0);

  useEffect(() => {
    // Smoothly spring the indicator to the new index
    indicatorPosition.value = withSpring(state.index * tabWidth, {
      damping: 20,
      stiffness: 250,
      mass: 0.8
    });
  }, [state.index, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorPosition.value }],
      width: tabWidth,
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingBottom: Math.max(insets.bottom, 16) + 12, borderTopColor: theme.border }]}>
      {/* The sliding active indicator (a subtle highlight behind the active icon) */}
      <Animated.View style={[styles.indicatorWrapper, indicatorStyle]}>
        <View style={[styles.indicator, { backgroundColor: theme.primary + '15' }]} />
      </Animated.View>

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            // Use subtle screen transition logic by letting React Navigation handle it natively
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const color = isFocused ? theme.primary : theme.textSecondary;
        const icon = getIconForRoute(route.name, color, 32);

        return (
          <AnimatedTabItem
            key={route.key}
            isFocused={isFocused}
            onPress={onPress}
            onLongPress={onLongPress}
            label={label as string}
            icon={icon}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 0, // Remove shadow on Android
    paddingTop: 8,
  },
  indicatorWrapper: {
    position: 'absolute',
    top: 8,
    height: 40, // Height of the icon area
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  indicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
});
