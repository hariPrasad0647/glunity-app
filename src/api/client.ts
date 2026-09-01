import axios from 'axios';
import { useAuthStore } from '~/store/authStore';

// The production backend as defined in the contract
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://glunity.onrender.com';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Contract: If a 401 is received, clear local storage and redirect to the Auth Stack.
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
