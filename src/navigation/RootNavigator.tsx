import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabNavigator } from './MainTabNavigator';
import { AuthNavigator } from './AuthNavigator';
import { IntroScreen } from '~/components/intro/IntroScreen';
import { useAppStore } from '~/store/appStore';
import { useAuthStore } from '~/store/authStore';
import { useTheme } from '~/hooks/useTheme';

export type RootStackParamList = {
  Intro: undefined;
  AuthStack: undefined;
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { theme } = useTheme();
  const { hasSeenIntro, setHasSeenIntro } = useAppStore();
  const { isAuthenticated, isHydrating, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, []);

  if (isHydrating) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {!hasSeenIntro ? (
        <Stack.Screen name="Intro">
          {() => <IntroScreen onFinish={() => setHasSeenIntro(true)} />}
        </Stack.Screen>
      ) : !isAuthenticated ? (
        <Stack.Screen name="AuthStack" component={AuthNavigator} />
      ) : (
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      )}
    </Stack.Navigator>
  );
}
