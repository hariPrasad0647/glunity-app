import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '~/screens/Home/HomeScreen';
import { WalletScreen } from '~/screens/Wallet/WalletScreen';
import { ResearchScreen } from '~/screens/Research/ResearchScreen';
import { LaunchpadScreen } from '~/screens/Launchpad/LaunchpadScreen';
import { DAOScreen } from '~/screens/DAO/DAOScreen';
import { AnimatedTabBar } from '~/components/navigation/AnimatedTabBar';

export type MainTabParamList = {
  Home: undefined;
  Wallet: undefined;
  Research: undefined;
  Launchpad: undefined;
  DAO: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Research" component={ResearchScreen} />
      <Tab.Screen name="Launchpad" component={LaunchpadScreen} />
      <Tab.Screen name="DAO" component={DAOScreen} />
    </Tab.Navigator>
  );
}
