import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '~/hooks/useTheme';
import { Button } from '~/components/common/Button';
import { OtpInput } from '~/components/auth/OtpInput';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '~/navigation/AuthNavigator';
import { ChevronLeft } from 'lucide-react-native';
import { 
  useVerifyLoginOTPMutation, 
  useVerifySignupOTPMutation, 
  useLoginMutation, 
  useResendSignupOTPMutation 
} from '~/queries/auth/authQueries';
import { useAuthStore } from '~/store/authStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerification'>;

export function OtpVerificationScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const { email, flow } = route.params;
  
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  
  const verifyLoginOTP = useVerifyLoginOTPMutation();
  const verifySignupOTP = useVerifySignupOTPMutation();
  const resendLoginOTP = useLoginMutation();
  const resendSignupOTP = useResendSignupOTPMutation();
  
  const login = useAuthStore(state => state.login);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter a 6-digit code.');
      return;
    }
    setError('');
    
    try {
      let response;
      if (flow === 'login') {
        response = await verifyLoginOTP.mutateAsync({ email, code: otp });
      } else {
        response = await verifySignupOTP.mutateAsync({ email, code: otp });
      }
      
      // Store session and update global state
      await login(response.user, response.accessToken, response.refreshToken);
      // Navigation to MainTabs is handled automatically by RootNavigator 
      // reacting to isAuthenticated state change.
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError('Invalid verification code.');
      } else if (err.response?.status === 404) {
        setError('No account found with this email.');
      } else {
        setError(err.response?.data?.message || 'Verification failed. Please try again.');
      }
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setError('');
    setOtp('');
    
    try {
      if (flow === 'login') {
        await resendLoginOTP.mutateAsync({ email });
      } else {
        await resendSignupOTP.mutateAsync({ email });
      }
      setCountdown(60); // Reset timer
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('Please wait before requesting a new code.');
      } else {
        setError('Failed to resend code. Please try again.');
      }
    }
  };

  const isLoading = verifyLoginOTP.isPending || verifySignupOTP.isPending;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={theme.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Verify your email</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              We sent a 6-digit code to <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>{email}</Text>
            </Text>

            <OtpInput 
              length={6} 
              value={otp} 
              onChange={(val) => {
                setOtp(val);
                setError('');
                if (val.length === 6) {
                  // Optionally trigger auto-submit here
                }
              }} 
              disabled={isLoading}
            />

            {error ? <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text> : null}

            <View style={styles.resendContainer}>
              {countdown > 0 ? (
                <Text style={[styles.resendText, { color: theme.textSecondary }]}>
                  Resend code in 00:{countdown.toString().padStart(2, '0')}
                </Text>
              ) : (
                <Pressable onPress={handleResend} style={styles.resendButton}>
                  <Text style={[styles.resendLink, { color: theme.primary }]}>Resend Code</Text>
                </Pressable>
              )}
            </View>
          </View>

          <View style={styles.footer}>
            <Button 
              title="Verify" 
              onPress={handleVerify}
              loading={isLoading}
              disabled={isLoading || otp.length !== 6}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    lineHeight: 24,
  },
  errorText: {
    fontSize: 14,
    marginTop: -8,
    marginBottom: 16,
    textAlign: 'center',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resendButton: {
    padding: 8,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    width: '100%',
  },
});
