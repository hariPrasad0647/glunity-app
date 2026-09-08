import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '~/hooks/useTheme';
import { Button } from '~/components/common/Button';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '~/navigation/AuthNavigator';
import { ChevronLeft } from 'lucide-react-native';
import { useForgotPasswordMutation } from '~/queries/auth/authQueries';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  
  const forgotPasswordMutation = useForgotPasswordMutation();

  const handleContinue = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    
    try {
      await forgotPasswordMutation.mutateAsync({ email: email.toLowerCase().trim() });
      navigation.navigate('ResetPassword', { email: email.toLowerCase().trim() });
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('No account found with this email.');
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
            <Text style={[styles.title, { color: theme.textPrimary }]}>Reset Password</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Enter your email and we'll send you a verification code to reset your password.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: theme.surfaceSecondary,
                    color: theme.textPrimary,
                    borderColor: error ? theme.danger : theme.border
                  }
                ]}
                placeholder="you@example.com"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
              {error ? <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text> : null}
            </View>
          </View>

          <View style={styles.footer}>
            <Button 
              title="Send Code" 
              onPress={handleContinue}
              loading={forgotPasswordMutation.isPending}
              disabled={forgotPasswordMutation.isPending || !email}
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
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
  },
  footer: {
    width: '100%',
  },
});
