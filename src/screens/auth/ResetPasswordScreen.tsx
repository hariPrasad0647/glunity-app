import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '~/hooks/useTheme';
import { Button } from '~/components/common/Button';
import { PasswordInput } from '~/components/common/PasswordInput';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '~/navigation/AuthNavigator';
import { ChevronLeft } from 'lucide-react-native';
import { useResetPasswordMutation } from '~/queries/auth/authQueries';
import { useAuthStore } from '~/store/authStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const { email } = route.params;
  
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  
  const resetPasswordMutation = useResetPasswordMutation();
  const login = useAuthStore(state => state.login);

  const handleContinue = async () => {
    if (!code || code.length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setError('');
    
    try {
      const data = await resetPasswordMutation.mutateAsync({ 
        email, 
        code, 
        newPassword 
      });
      await login(data.user, data.accessToken, data.refreshToken);
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError('Invalid or expired verification code.');
      } else if (err.response?.status === 429) {
        setError('Please wait and try again later.');
      } else {
        setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      }
    }
  };

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
            <Text style={[styles.title, { color: theme.textPrimary }]}>Create New Password</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Enter the 6-digit code sent to {email} and your new password.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Verification Code</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: theme.surfaceSecondary,
                    color: theme.textPrimary,
                    borderColor: error && !code ? theme.danger : theme.border
                  }
                ]}
                placeholder="000000"
                placeholderTextColor={theme.textSecondary}
                value={code}
                onChangeText={(text) => {
                  setCode(text.replace(/[^0-9]/g, '').slice(0, 6));
                  setError('');
                }}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>New Password</Text>
              <PasswordInput
                placeholder="Enter new password"
                placeholderTextColor={theme.textSecondary}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  setError('');
                }}
                error={!!(error && code.length === 6)}
              />
            </View>

            {error ? <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text> : null}
          </View>

          <View style={styles.footer}>
            <Button 
              title="Reset Password" 
              onPress={handleContinue}
              loading={resetPasswordMutation.isPending}
              disabled={resetPasswordMutation.isPending || !code || !newPassword}
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
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    letterSpacing: 4,
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
  },
  footer: {
    width: '100%',
  },
});
