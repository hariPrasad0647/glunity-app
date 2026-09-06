import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '~/hooks/useTheme';
import { Button } from '~/components/common/Button';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '~/navigation/AuthNavigator';
import { ChevronLeft } from 'lucide-react-native';
import { useSignupMutation } from '~/queries/auth/authQueries';
import * as Linking from 'expo-linking';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export function SignupScreen({ navigation }: Props) {
  const { theme } = useTheme();
  
  const url = Linking.useURL();
  
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    referralCode: '',
  });

  useEffect(() => {
    if (url) {
      const { queryParams } = Linking.parse(url);
      if (queryParams?.ref) {
        setFormData(prev => ({ ...prev, referralCode: queryParams.ref as string }));
      }
    }
  }, [url]);
  const [error, setError] = useState('');
  
  const signupMutation = useSignupMutation();

  const handleContinue = async () => {
    // Basic client validation
    if (!formData.fullName || !formData.username || !formData.email || !formData.phone) {
      setError('Please fill in all fields.');
      return;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    
    try {
      await signupMutation.mutateAsync({ 
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        ...(formData.referralCode ? { referralCode: formData.referralCode.trim() } : {}),
      });
      navigation.navigate('OtpVerification', { email: formData.email.toLowerCase().trim(), flow: 'signup' });
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError(err.response?.data?.message || 'An account with this email or username already exists.');
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

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.title, { color: theme.textPrimary }]}>Create account</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Join the Glunity community today.
          </Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Full Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="John Doe"
                placeholderTextColor={theme.textSecondary}
                value={formData.fullName}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, fullName: text }));
                  setError('');
                }}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Username</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="johndoe"
                placeholderTextColor={theme.textSecondary}
                value={formData.username}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, username: text }));
                  setError('');
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="you@example.com"
                placeholderTextColor={theme.textSecondary}
                value={formData.email}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, email: text }));
                  setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Phone</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="+1 234 567 8900"
                placeholderTextColor={theme.textSecondary}
                value={formData.phone}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, phone: text }));
                  setError('');
                }}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Referral Code (Optional)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="Got a code?"
                placeholderTextColor={theme.textSecondary}
                value={formData.referralCode}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, referralCode: text }));
                  setError('');
                }}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>

            {error ? <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text> : null}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button 
            title="Create account" 
            onPress={handleContinue}
            loading={signupMutation.isPending}
            disabled={signupMutation.isPending}
          />
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
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
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
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
    marginTop: 4,
    marginBottom: 16,
  },
  footer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },
});
