import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email?: string;
  phone_number?: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setOnboardingComplete: (complete: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      setUser: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setOnboardingComplete: (complete) => set({ hasCompletedOnboarding: complete }),
      signOut: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
