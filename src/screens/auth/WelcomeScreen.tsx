import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '~/hooks/useTheme';
import { Button } from '~/components/common/Button';
import { GoogleAuthButton } from '~/components/auth/GoogleAuthButton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '~/navigation/AuthNavigator';
import { Globe2 } from 'lucide-react-native';
import { useGoogleAuthMutation } from '~/queries/auth/authQueries';
import { useAuthStore } from '~/store/authStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const googleAuth = useGoogleAuthMutation();
  const login = useAuthStore(state => state.login);

  const handleGoogleSuccess = async (idToken: string) => {
    try {
      const response = await googleAuth.mutateAsync({ idToken });
      await login(response.user, response.accessToken, response.refreshToken);
    } catch (error: any) {
      // Could show a toast here. Error is caught and usually logged.
      console.log('Google Auth API failed:', error.response?.data?.message || error.message);
    }
  };

  const handleGoogleError = (error: string) => {
    console.log('Google UI Error:', error);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Globe2 size={64} color={theme.primary} />
          <Text style={[styles.title, { color: theme.textPrimary }]}>Glunity</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Feed, Community & Chat
          </Text>
        </View>

        <View style={styles.actionContainer}>
          <GoogleAuthButton 
            onSuccess={handleGoogleSuccess} 
            onError={handleGoogleError} 
            isLoading={googleAuth.isPending}
          />
          
          <Button 
            title="Continue with Email" 
            onPress={() => navigation.navigate('Login')}
            style={styles.emailButton}
          />
          
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <Text 
              style={[styles.link, { color: theme.primary }]}
              onPress={() => navigation.navigate('Signup')}
            >
              Sign up
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    marginTop: 16,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 8,
  },
  actionContainer: {
    width: '100%',
    paddingBottom: 32,
  },
  emailButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
  },
});
