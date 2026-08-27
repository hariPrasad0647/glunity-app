import { useMutation } from '@tanstack/react-query';
import { apiClient } from '~/api/client';
import { User } from '~/store/authStore';

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface EmailResponse {
  email: string;
}

// 1. Signup Request (POST /api/auth/signup)
export const useSignupMutation = () => {
  return useMutation({
    mutationFn: async (data: { fullName: string; username: string; email: string; phone: string }) => {
      const response = await apiClient.post<EmailResponse>('/api/auth/signup', data);
      return response.data;
    },
  });
};

// 2. Signup Resend OTP (POST /api/auth/resend-otp)
export const useResendSignupOTPMutation = () => {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await apiClient.post<EmailResponse>('/api/auth/resend-otp', data);
      return response.data;
    },
  });
};

// 3. Signup Verify OTP (POST /api/auth/verify-otp)
export const useVerifySignupOTPMutation = () => {
  return useMutation({
    mutationFn: async (data: { email: string; code: string }) => {
      const response = await apiClient.post<AuthResponse>('/api/auth/verify-otp', data);
      return response.data;
    },
  });
};

// 4. Login Request (POST /api/auth/login)
export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await apiClient.post<EmailResponse>('/api/auth/login', data);
      return response.data;
    },
  });
};

// 5. Login Verify OTP (POST /api/auth/login/verify)
export const useVerifyLoginOTPMutation = () => {
  return useMutation({
    mutationFn: async (data: { email: string; code: string }) => {
      const response = await apiClient.post<AuthResponse>('/api/auth/login/verify', data);
      return response.data;
    },
  });
};

// 6. Google Auth (POST /api/auth/google)
export const useGoogleAuthMutation = () => {
  return useMutation({
    mutationFn: async (data: { idToken: string }) => {
      const response = await apiClient.post<AuthResponse>('/api/auth/google', data);
      return response.data;
    },
  });
};
