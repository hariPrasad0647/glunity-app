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

import { InterestsScreen } from '~/screens/profile/InterestsScreen';
import { FollowRequestsScreen } from '~/screens/profile/FollowRequestsScreen';
import { ChatListScreen } from '~/screens/chat/ChatListScreen';
import { ChatRoomScreen } from '~/screens/chat/ChatRoomScreen';
import { SettingsScreen } from '~/screens/profile/SettingsScreen';
import { UserActivityScreen } from '~/screens/profile/UserActivityScreen';
import { AirdropPointsScreen } from '~/screens/points/AirdropPointsScreen';
import { ReferralScreen } from '~/screens/referrals/ReferralScreen';
import { TrustScoreScreen } from '~/screens/trustScore/TrustScoreScreen';

export type RootStackParamList = {
  Intro: undefined;
  AuthStack: undefined;
  MainTabs: undefined;
  ComposePost: undefined;
  PostDetail: { postId: string };
  Profile: { userId?: string };
  EditProfile: { profile: UserProfile };
  Interests: undefined;
  FollowList: { userId: string; initialTab?: 'Followers' | 'Following' };
  FollowRequests: undefined;
  Search: undefined;
  ChatList: undefined;
  ChatRoom: { conversationId?: string; recipientId?: string; recipientUsername?: string };
  Settings: undefined;
  UserActivity: undefined;
  AirdropPoints: undefined;
  Referrals: undefined;
  TrustScore: undefined;
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
            <Stack.Screen name="Interests" component={InterestsScreen} />
          </Stack.Group>
          
          <Stack.Group screenOptions={{ animation: 'slide_from_right' }}>
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="FollowList" component={FollowListScreen} />
            <Stack.Screen name="FollowRequests" component={FollowRequestsScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="ChatList" component={ChatListScreen} />
            <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="UserActivity" component={UserActivityScreen} />
            <Stack.Screen name="AirdropPoints" component={AirdropPointsScreen} />
            <Stack.Screen name="Referrals" component={ReferralScreen} />
            <Stack.Screen name="TrustScore" component={TrustScoreScreen} />
          </Stack.Group>
        </>
      )}
    </Stack.Navigator>
  );
}
