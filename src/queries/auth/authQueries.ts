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
    mutationFn: async (data: { fullName: string; username: string; email: string; phone: string; password?: string; referralCode?: string }) => {
      const response = await apiClient.post<BaseResponse<AuthData>>('/api/auth/signup', data);
      return response.data.data;
    },
  });
};

// 2. Login Request (POST /api/auth/login)
export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (data: { email: string; password?: string }) => {
      const response = await apiClient.post<BaseResponse<AuthData>>('/api/auth/login', data);
      return response.data.data;
    },
  });
};

// 3. Forgot Password Request (POST /api/auth/forgot-password)
export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await apiClient.post<BaseResponse<EmailData>>('/api/auth/forgot-password', data);
      return response.data.data;
    },
  });
};

// 4. Reset Password Request (POST /api/auth/reset-password)
export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: async (data: { email: string; code: string; newPassword?: string }) => {
      const response = await apiClient.post<BaseResponse<AuthData>>('/api/auth/reset-password', data);
      return response.data.data;
    },
  });
};

// 5. Google Auth (POST /api/auth/google)
export const useGoogleAuthMutation = () => {
  return useMutation({
    mutationFn: async (data: { idToken: string; referralCode?: string }) => {
      const response = await apiClient.post<BaseResponse<AuthData>>('/api/auth/google', data);
      return response.data.data;
    },
  });
};
