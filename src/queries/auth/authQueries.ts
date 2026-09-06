import { useMutation } from '@tanstack/react-query';
import { apiClient } from '~/api/client';
import { User } from '~/store/authStore';

export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: any;
}

export interface AuthData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface EmailData {
  email: string;
}

// 1. Signup Request (POST /api/auth/signup)
export const useSignupMutation = () => {
  return useMutation({
    mutationFn: async (data: { fullName: string; username: string; email: string; phone: string; referralCode?: string }) => {
      const response = await apiClient.post<BaseResponse<EmailData>>('/api/auth/signup', data);
      return response.data.data; // Return the nested data
    },
  });
};

// 2. Signup Resend OTP (POST /api/auth/resend-otp)
export const useResendSignupOTPMutation = () => {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await apiClient.post<BaseResponse<EmailData>>('/api/auth/resend-otp', data);
      return response.data.data;
    },
  });
};

// 3. Signup Verify OTP (POST /api/auth/verify-otp)
export const useVerifySignupOTPMutation = () => {
  return useMutation({
    mutationFn: async (data: { email: string; code: string }) => {
      const response = await apiClient.post<BaseResponse<AuthData>>('/api/auth/verify-otp', data);
      return response.data.data;
    },
  });
};

// 4. Login Request (POST /api/auth/login)
export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await apiClient.post<BaseResponse<EmailData>>('/api/auth/login', data);
      return response.data.data;
    },
  });
};

// 5. Login Verify OTP (POST /api/auth/login/verify)
export const useVerifyLoginOTPMutation = () => {
  return useMutation({
    mutationFn: async (data: { email: string; code: string }) => {
      const response = await apiClient.post<BaseResponse<AuthData>>('/api/auth/login/verify', data);
      return response.data.data;
    },
  });
};

// 6. Google Auth (POST /api/auth/google)
export const useGoogleAuthMutation = () => {
  return useMutation({
    mutationFn: async (data: { idToken: string; referralCode?: string }) => {
      const response = await apiClient.post<BaseResponse<AuthData>>('/api/auth/google', data);
      return response.data.data;
    },
  });
};
