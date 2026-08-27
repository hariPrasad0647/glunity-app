import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useTheme } from '~/hooks/useTheme';
import { Button } from '~/components/common/Button';

interface GoogleAuthButtonProps {
  onSuccess: (idToken: string) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
}

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

export function GoogleAuthButton({ onSuccess, onError, isLoading }: GoogleAuthButtonProps) {
  const { theme } = useTheme();

  useEffect(() => {
    if (WEB_CLIENT_ID) {
      GoogleSignin.configure({
        webClientId: WEB_CLIENT_ID,
        offlineAccess: false,
      });
    }
  }, []);

  const handlePress = async () => {
    if (!WEB_CLIENT_ID) {
      onError('Google Sign-In is not configured yet. (Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID)');
      return;
    }

    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      if (userInfo.idToken) {
        onSuccess(userInfo.idToken);
      } else {
        onError('No ID token returned from Google.');
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled, ignore silently
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Sign in in progress
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        onError('Google Play Services not available or outdated.');
      } else {
        onError(error.message || 'Something went wrong with Google Sign-In.');
      }
    }
  };

  return (
    <Button
      title="Continue with Google"
      onPress={handlePress}
      variant="outline"
      loading={isLoading}
      disabled={isLoading || !WEB_CLIENT_ID}
      style={styles.button}
      // You could add a Google SVG icon here via a prop to Button if supported
    />
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    marginVertical: 8,
  },
});
