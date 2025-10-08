import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/authTypes';
import { authApi, SignUpData } from '@/api/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  hasCompletedOnboarding: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
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
  signOut: () => void;
  updateProfile: (
    userData: Partial<User>
  ) => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      isLoading: false,
      token: null,
      error: null,
      loadUserFromStorage: async () => {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          set({ user: JSON.parse(storedUser), isAuthenticated: true });
        }
      },

      setUser: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setOnboardingComplete: (complete) =>
        set({ hasCompletedOnboarding: complete }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

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
        } catch (error) {
          set({ isLoading: false, error: 'Network error occurred' });
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
            set({
              user: { ...response.data.user, phone_number: phoneNumber },
              isAuthenticated: true,
              token: response.data.token,
              error: null,
            });
            return { success: true };
          } else {
            set({ error: response.error });
            return { success: false, error: response.error };
          }
        } catch (error) {
          set({ isLoading: false, error: 'Network error occurred' });
          return { success: false, error: 'Network error occurred' };
        }
      },

      signInWithEmail: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.signInWithEmail(email, password);
          set({ isLoading: false });

          if (response.success && response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              error: null,
            });
            return { success: true };
          } else {
            set({ error: response.error });
            return { success: false, error: response.error };
          }
        } catch (error) {
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
            set({
              user: response.data.user,
              isAuthenticated: true,
              error: null,
            });
            return { success: true };
          } else {
            set({ error: response.error });
            return { success: false, error: response.error };
          }
        } catch (error) {
          set({ isLoading: false, error: 'Network error occurred' });
          return { success: false, error: 'Network error occurred' };
        }
      },

      updateProfile: async (userData: Partial<User>) => {
        const { user } = get();
        if (!user) return { success: false, error: 'No user logged in' };

        set({ isLoading: true, error: null });
        try {
          const updatedUser = { ...user, ...userData };
          const response = await authApi.updateProfile(user.id, updatedUser);
          set({ isLoading: false });

          if (response.success && response.data) {
            set({ user: response.data, error: null });
            AsyncStorage.setItem('user', JSON.stringify(response.data));
            return { success: true };
          } else {
            set({ error: response.error });
            return { success: false, error: response.error };
          }
        } catch (error) {
          set({ isLoading: false, error: 'Network error occurred' });
          return { success: false, error: 'Network error occurred' };
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        try {
          await authApi.signOut();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          await AsyncStorage.removeItem('user');
        } catch (error) {
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
