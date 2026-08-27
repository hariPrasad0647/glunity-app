import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabNavigator } from './MainTabNavigator';
import { AuthNavigator } from './AuthNavigator';
import { IntroScreen } from '~/components/intro/IntroScreen';
import { ComposePostScreen } from '~/screens/feed/ComposePostScreen';
import { PostDetailScreen } from '~/screens/feed/PostDetailScreen';
import { ProfileScreen } from '~/screens/profile/ProfileScreen';
import { EditProfileScreen } from '~/screens/profile/EditProfileScreen';
import { FollowListScreen } from '~/screens/profile/FollowListScreen';
import { SearchScreen } from '~/screens/profile/SearchScreen';
import { useAppStore } from '~/store/appStore';
import { useAuthStore } from '~/store/authStore';
import { useTheme } from '~/hooks/useTheme';
import { UserProfile } from '~/queries/profile/profileQueries';

export type RootStackParamList = {
  Intro: undefined;
  AuthStack: undefined;
  MainTabs: undefined;
  ComposePost: undefined;
  PostDetail: { postId: string };
  Profile: { userId?: string };
  EditProfile: { profile: UserProfile };
  FollowList: { userId: string; initialTab?: 'Followers' | 'Following' };
  Search: undefined;
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
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          
          <Stack.Group screenOptions={{ presentation: 'modal', animation: 'slide_from_bottom' }}>
            <Stack.Screen name="ComposePost" component={ComposePostScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          </Stack.Group>
          
          <Stack.Group screenOptions={{ animation: 'slide_from_right' }}>
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="FollowList" component={FollowListScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
          </Stack.Group>
        </>
      )}
    </Stack.Navigator>
  );
}
