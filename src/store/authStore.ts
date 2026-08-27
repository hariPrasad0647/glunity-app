import { create } from 'zustand';
import { getSecureItem, saveSecureItem, deleteSecureItem } from '~/utils/storage';

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  isPrivate: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  isHydrating: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  login: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isHydrating: true,
  accessToken: null,
  refreshToken: null,
  user: null,

  login: async (user, accessToken, refreshToken) => {
    await saveSecureItem('accessToken', accessToken);
    await saveSecureItem('refreshToken', refreshToken);
    await saveSecureItem('user', JSON.stringify(user));
    
    set({ isAuthenticated: true, user, accessToken, refreshToken });
  },

  logout: async () => {
    await deleteSecureItem('accessToken');
    await deleteSecureItem('refreshToken');
    await deleteSecureItem('user');
    
    set({ isAuthenticated: false, user: null, accessToken: null, refreshToken: null });
  },

  hydrate: async () => {
    try {
      const token = await getSecureItem('accessToken');
      const refresh = await getSecureItem('refreshToken');
      const userData = await getSecureItem('user');

      if (token && userData) {
        set({
          isAuthenticated: true,
          accessToken: token,
          refreshToken: refresh,
          user: JSON.parse(userData),
          isHydrating: false,
        });
      } else {
        set({ isHydrating: false });
      }
    } catch (e) {
      console.error('Failed to hydrate auth store', e);
      set({ isHydrating: false });
    }
  },
}));
