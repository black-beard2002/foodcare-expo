import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/authTypes';
import { authApi, SignUpData } from '@/api/auth';

interface AuthState {
  user: Partial<User> | null;
  isAuthenticated: boolean;
  token: string | null;
  refresh_token: string | null;
  hasCompletedOnboarding: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: Partial<User> | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadUserFromStorage: () => Promise<void>;

  // API Actions
  signInWithPhone: (
    phoneNumber: string
  ) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (
    otp: string,
    phoneNumber: string
  ) => Promise<{ success: boolean; message?: string }>;
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    userData: SignUpData
  ) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (
    userData: Partial<User>
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;

  // Token refresh
  refreshAccessToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      isLoading: false,
      token: null,
      refresh_token: null,
      error: null,

      // === Base Actions ===
      loadUserFromStorage: async () => {
        const storedUser = await AsyncStorage.getItem('user');
        const storedToken = await AsyncStorage.getItem('token');
        const storedRefresh = await AsyncStorage.getItem('refresh_token');

        if (storedUser && storedToken) {
          set({
            user: JSON.parse(storedUser),
            token: storedToken,
            refresh_token: storedRefresh,
            isAuthenticated: true,
          });
        }
      },

      setUser: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setOnboardingComplete: (complete) =>
        set({ hasCompletedOnboarding: complete }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // === Auth Flows ===
      signInWithPhone: async (phoneNumber: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.signInWithPhone(phoneNumber);
          if (response.success) {
            return {
              success: true,
              message: response.message || 'Sign in successful',
            };
          } else {
            set({ error: response.error });
            return {
              success: false,
              message: response.error || 'Sign in failed',
            };
          }
        } catch {
          set({ error: 'Network error occurred' });
          return { success: false, message: 'Network error occurred' };
        } finally {
          set({ isLoading: false });
        }
      },

      verifyOtp: async (otp: string, phoneNumber: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.verifyOtp(phoneNumber, otp);
          set({ isLoading: false });

          if (response.success && response.data) {
            const user = {
              ...response.data.user,
              email_address: response.data.user.email,
              id: response.data.user.user_id,
            };

            await AsyncStorage.setItem('user', JSON.stringify(user));
            await AsyncStorage.setItem(
              'token',
              response.data.token.access_token
            );
            await AsyncStorage.setItem(
              'refresh_token',
              response.data.token.refresh_token
            );

            set({
              user,
              isAuthenticated: true,
              token: response.data.token.access_token,
              refresh_token: response.data.token.refresh_token,
              error: null,
            });

            return { success: true };
          } else {
            set({ error: response.error });
            return { success: false, message: response.error };
          }
        } catch {
          set({ isLoading: false, error: 'Network error occurred' });
          return { success: false, message: 'Network error occurred' };
        }
      },

      signInWithEmail: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.signInWithEmail(email, password);
          set({ isLoading: false });

          if (response.success && response.data) {
            await AsyncStorage.setItem(
              'user',
              JSON.stringify(response.data.user)
            );
            await AsyncStorage.setItem(
              'token',
              response.data.token.access_token
            );
            await AsyncStorage.setItem(
              'refresh_token',
              response.data.token.refresh_token
            );

            set({
              user: response.data.user,
              isAuthenticated: true,
              token: response.data.token.access_token,
              refresh_token: response.data.token.refresh_token,
              error: null,
            });
            return { success: true };
          } else {
            set({ error: response.error });
            return { success: false, error: response.error };
          }
        } catch {
          set({ isLoading: false, error: 'Network error occurred' });
          return { success: false, error: 'Network error occurred' };
        }
      },

      signUp: async (userData: SignUpData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.signUp(userData);
          set({ isLoading: false });

          if (response.success && response.data) {
            await AsyncStorage.setItem(
              'user',
              JSON.stringify(response.data.user)
            );
            await AsyncStorage.setItem(
              'token',
              response.data.token.access_token
            );
            await AsyncStorage.setItem(
              'refresh_token',
              response.data.token.refresh_token
            );

            set({
              user: response.data.user,
              isAuthenticated: true,
              token: response.data.token.access_token,
              refresh_token: response.data.token.refresh_token,
              error: null,
            });
            return { success: true };
          } else {
            set({ error: response.error });
            return { success: false, error: response.error };
          }
        } catch {
          set({ isLoading: false, error: 'Network error occurred' });
          return { success: false, error: 'Network error occurred' };
        }
      },

      refreshAccessToken: async () => {
        const { refresh_token, setError } = get();
        if (!refresh_token) {
          console.warn('No refresh token available');
          return null;
        }

        try {
          const response = await authApi.refreshToken(refresh_token);
          if (response.success && response.data) {
            const newAccess = response.data.access_token;
            const newRefresh = response.data.refresh_token || refresh_token;

            await AsyncStorage.setItem('token', newAccess);
            await AsyncStorage.setItem('refresh_token', newRefresh);

            set({
              token: newAccess,
              refresh_token: newRefresh,
              error: null,
            });

            console.log('✅ Token refreshed successfully');
            return newAccess;
          } else {
            setError(response.error || 'Failed to refresh token');
            console.error('❌ Failed to refresh token:', response.error);
            return null;
          }
        } catch (error) {
          console.error('Network error during token refresh:', error);
          setError('Network error during token refresh');
          return null;
        }
      },

      updateProfile: async (userData: Partial<User>) => {
        const { user, token, refreshAccessToken, setError } = get();
        if (!user) return { success: false, error: 'No user logged in' };

        set({ isLoading: true, error: null });
        try {
          let activeToken = token;
          let response = await authApi.updateProfile(
            user.id!,
            userData,
            activeToken!
          );

          if (response.status === 401) {
            const newToken = await refreshAccessToken();
            if (newToken) {
              response = await authApi.updateProfile(
                user.id!,
                userData,
                newToken
              );
            } else {
              return {
                success: false,
                error: 'Session expired, please sign in again',
              };
            }
          }

          set({ isLoading: false });
          if (response.success && response.data) {
            set({ user: response.data, error: null });
            await AsyncStorage.setItem('user', JSON.stringify(response.data));
            return { success: true };
          } else {
            setError(response.error);
            return { success: false, error: response.error };
          }
        } catch {
          set({ isLoading: false, error: 'Network error occurred' });
          return { success: false, error: 'Network error occurred' };
        }
      },

      // === Sign Out ===
      signOut: async () => {
        set({ isLoading: true });
        try {
          await authApi.signOut();
          await AsyncStorage.multiRemove(['user', 'token', 'refresh_token']);
          set({
            user: null,
            isAuthenticated: false,
            token: null,
            refresh_token: null,
            isLoading: false,
            error: null,
          });
        } catch {
          set({ isLoading: false, error: 'Failed to sign out' });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
