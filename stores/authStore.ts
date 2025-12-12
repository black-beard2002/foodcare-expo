import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/authTypes';
import { authApi } from '@/api/auth';
import { subscribeToAuthEvents, AUTH_EVENTS } from '@/utils/authEvents';
import { ApiResponse } from '@/types/apiTypes';

interface AuthState {
  user: Partial<User> | null;
  isAuthenticated: boolean;
  access_token: string | null;
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
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (refresh_token: string | null) => void;
  loadUserFromStorage: () => Promise<void>;
  sendWelcomeEmail:(
    email: string,
    first_name: string,
    last_name: string,
    project_name: string,
    project_link: string)=>Promise<void>;

  // Event listener setup
  setupEventListeners: () => () => void;

  // API Actions
  signInWithPhone: (
    phoneNumber: string
  ) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (
    otp: string,
    phoneNumber: string
  ) => Promise<{ success: boolean; message?: string; attempts?: number }>;
  updateProfile: (
    userData: Partial<User>
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  getUser: () => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      isLoading: false,
      access_token: null,
      refresh_token: null,
      error: null,
      setAccessToken: (token) => set({ access_token: token }),
      setRefreshToken: (refresh_token) => set({ refresh_token }),

      // === Event Listeners Setup ===
      setupEventListeners: () => {
        const handleTokenRefresh = (data: { token: string }) => {
          const newToken = data?.token;
          if (newToken) {
            console.log('Token refreshed, updating auth store');
            set({ access_token: newToken });
          }
        };

        const handleAuthLogout = (data?: { reason?: string }) => {
          console.log('Auth logout triggered:', data);

          // Clear state
          set({
            user: null,
            access_token: null,
            refresh_token: null,
            isAuthenticated: false,
            error: null,
          });

          // Clear AsyncStorage (already done by interceptor, but be safe)
          AsyncStorage.multiRemove([
            'user',
            'access_token',
            'refresh_token',
          ]).catch((error) =>
            console.error('Error clearing AsyncStorage:', error)
          );
        };

        // Subscribe to auth events
        const unsubscribeTokenRefresh = subscribeToAuthEvents(
          AUTH_EVENTS.TOKEN_REFRESHED,
          handleTokenRefresh
        );

        const unsubscribeLogout = subscribeToAuthEvents(
          AUTH_EVENTS.LOGOUT,
          handleAuthLogout
        );

        // Return cleanup function that unsubscribes from both events
        return () => {
          unsubscribeTokenRefresh();
          unsubscribeLogout();
        };
      },

      sendWelcomeEmail: async(    email: string,
        first_name: string,
        last_name: string,
        project_name: string,
        project_link: string)=>{

      await authApi.SendWelcomeEmail(email,first_name,last_name,project_name,project_link);
      },

      // === Base Actions ===
      loadUserFromStorage: async () => {
        const storedUser = await AsyncStorage.getItem('user');
        const storedToken = await AsyncStorage.getItem('access_token');
        const storedRefresh = await AsyncStorage.getItem('refresh_token');

        if (storedUser && storedToken) {
          set({
            user: JSON.parse(storedUser),
            access_token: storedToken,
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
              message: response.data.message ?? 'Sign in successful',
            };
          } else {
            set({ error: response.data.error ?? 'Sign in failed' });
            return {
              success: false,
              message: response.data.error ?? 'Sign in failed',
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
            const user = response.data.user;

            await AsyncStorage.setItem('user', JSON.stringify(user));
            await AsyncStorage.setItem(
              'access_token',
              response.data.access_token
            );
            await AsyncStorage.setItem(
              'refresh_token',
              response.data.refresh_token
            );

            set({
              user,
              isAuthenticated: true,
              access_token: response.data.access_token,
              refresh_token: response.data.refresh_token,
              error: null,
            });

            return {
              success: true,
              message: response.message,
              attempts: response.data.attempts,
            };
          } else {
            set({ error: response.error });
            return { success: false, message: response.error };
          }
        } catch {
          set({ isLoading: false, error: 'Network error occurred' });
          return { success: false, message: 'Network error occurred' };
        }
      },

      getUser: async () => {
        const { access_token, setError, user } = get();
        if (!access_token) {
          setError('No access token available');
          return { success: false, error: 'No access token available' };
        }
        set({ isLoading: true, error: null });
        try {
          let response = await authApi.getUser(user?.id!);

          set({ isLoading: false });
          if (response.success && response.data) {
            set({ user: response.data, error: null });
            await AsyncStorage.setItem('user', JSON.stringify(response.data));
            return { success: true };
          } else {
            setError(response.error ?? response.message ?? 'Fetch failed');
            return { success: false, error: response.error };
          }
        } catch {
          set({ isLoading: false, error: 'Network error occurred' });
          return { success: false, error: 'Network error occurred' };
        }
      },

      updateProfile: async (userData: Partial<User>) => {
        const { user, setError } = get();
        if (!user) return { success: false, error: 'No user logged in' };
        set({ isLoading: true, error: null });
        try {
          let response = await authApi.updateProfile(user.id!, userData);

          set({ isLoading: false });
          console.log('user response', response);
          if (response.success && response.data) {
            set({ user: response.data, error: null });
            await AsyncStorage.setItem('user', JSON.stringify(response.data));
            return { success: true };
          } else {
            setError(response.error ?? response.message ?? 'Update failed');
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
          await AsyncStorage.multiRemove([
            'user',
            'access_token',
            'refresh_token',
          ]);
          set({
            user: null,
            isAuthenticated: false,
            access_token: null,
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
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
        }
      },
    }
  )
);
