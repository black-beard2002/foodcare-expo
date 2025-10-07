import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/authTypes';
import { authApi, SignUpData } from '@/api/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
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
  ) => Promise<{ success: boolean; verificationId?: string; error?: string }>;
  verifyOtp: (
    verificationId: string,
    otp: string
  ) => Promise<{ success: boolean; error?: string }>;
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
          set({ isLoading: false });

          if (response.success && response.data) {
            return {
              success: true,
              verificationId: response.data.verificationId,
            };
          } else {
            set({ error: response.error });
            return { success: false, error: response.error };
          }
        } catch (error) {
          set({ isLoading: false, error: 'Network error occurred' });
          return { success: false, error: 'Network error occurred' };
        }
      },

      verifyOtp: async (verificationId: string, otp: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.verifyOtp(verificationId, otp);
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
          const response = await authApi.updateProfile(user.id, userData);
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
