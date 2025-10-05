import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '@/lib/api/auth';

export type User = {
  id: string;
  email: string;
  name: string;
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  setUser: (user) => set({ user }),

  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

  setLoading: (loading) => set({ loading }),

  signOut: async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        await authApi.signOut(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');

      if (!accessToken || !refreshToken) {
        set({ isAuthenticated: false, loading: false });
        return;
      }

      // Validate the access token with the backend
      try {
        const response = await authApi.validate();
        set({
          user: response.user,
          isAuthenticated: true,
          loading: false,
        });
      } catch (error) {
        // Token validation failed, try to refresh
        try {
          await authApi.refreshToken(refreshToken);
          // Retry validation
          const response = await authApi.validate();
          set({
            user: response.user,
            isAuthenticated: true,
            loading: false,
          });
        } catch (refreshError) {
          // Refresh failed, clear everything
          await AsyncStorage.removeItem('accessToken');
          await AsyncStorage.removeItem('refreshToken');
          set({ user: null, isAuthenticated: false, loading: false });
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      set({ isAuthenticated: false, loading: false });
    }
  },
}));
