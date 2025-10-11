import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/authTypes';
import { authApi } from '@/api/auth';

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
  setToken: (token: string | null) => void;
  setRefreshToken: (refresh_token: string | null) => void;
  loadUserFromStorage: () => Promise<void>;

  // API Actions
  signInWithPhone: (
    phoneNumber: string
  ) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (
    otp: string,
    phoneNumber: string
  ) => Promise<{ success: boolean; message?: string }>;
  // signInWithEmail: (
  //   email: string,
  //   password: string
  // ) => Promise<{ success: boolean; error?: string }>;
  // signUp: (
  //   userData: SignUpData
  // ) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (
    userData: Partial<User>
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
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
      setToken: (token) => set({ token }),
      setRefreshToken: (refresh_token) => set({ refresh_token }),

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
            const user = response.data.user;

            await AsyncStorage.setItem('user', JSON.stringify(user));
            await AsyncStorage.setItem('token', response.data.token);
            await AsyncStorage.setItem(
              'refresh_token',
              response.data.refresh_token
            );

            set({
              user,
              isAuthenticated: true,
              token: response.data.token,
              refresh_token: response.data.refresh_token,
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

      // signInWithEmail: async (email: string, password: string) => {
      //   set({ isLoading: true, error: null });
      //   try {
      //     const response = await authApi.signInWithEmail(email, password);
      //     set({ isLoading: false });

      //     if (response.success && response.data) {
      //       await AsyncStorage.setItem(
      //         'user',
      //         JSON.stringify(response.data.user)
      //       );
      //       await AsyncStorage.setItem(
      //         'token',
      //         response.data.token.access_token
      //       );
      //       await AsyncStorage.setItem(
      //         'refresh_token',
      //         response.data.token.refresh_token
      //       );

      //       set({
      //         user: response.data.user,
      //         isAuthenticated: true,
      //         token: response.data.token.access_token,
      //         refresh_token: response.data.token.refresh_token,
      //         error: null,
      //       });
      //       return { success: true };
      //     } else {
      //       set({ error: response.error });
      //       return { success: false, error: response.error };
      //     }
      //   } catch {
      //     set({ isLoading: false, error: 'Network error occurred' });
      //     return { success: false, error: 'Network error occurred' };
      //   }
      // },

      // signUp: async (userData: SignUpData) => {
      //   set({ isLoading: true, error: null });
      //   try {
      //     const response = await authApi.signUp(userData);
      //     set({ isLoading: false });

      //     if (response.success && response.data) {
      //       await AsyncStorage.setItem(
      //         'user',
      //         JSON.stringify(response.data.user)
      //       );
      //       await AsyncStorage.setItem(
      //         'token',
      //         response.data.token.access_token
      //       );
      //       await AsyncStorage.setItem(
      //         'refresh_token',
      //         response.data.token.refresh_token
      //       );

      //       set({
      //         user: response.data.user,
      //         isAuthenticated: true,
      //         token: response.data.token.access_token,
      //         refresh_token: response.data.token.refresh_token,
      //         error: null,
      //       });
      //       return { success: true };
      //     } else {
      //       set({ error: response.error });
      //       return { success: false, error: response.error };
      //     }
      //   } catch {
      //     set({ isLoading: false, error: 'Network error occurred' });
      //     return { success: false, error: 'Network error occurred' };
      //   }
      // },

      updateProfile: async (userData: Partial<User>) => {
        const { user, setError } = get();
        if (!user) return { success: false, error: 'No user logged in' };

        set({ isLoading: true, error: null });
        try {
          let response = await authApi.updateProfile(user.id!, userData);

          set({ isLoading: false });
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
