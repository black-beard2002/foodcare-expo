import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  biometricEnabled: boolean;
  pinEnabled: boolean;
  userPin: string;
  setBiometricEnabled: (enabled: boolean) => void;
  setPinEnabled: (enabled: boolean) => void;
  setUserPin: (pin: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      biometricEnabled: false,
      pinEnabled: false,
      userPin: '',
      setBiometricEnabled: (enabled: boolean) => set({ biometricEnabled: enabled }),
      setPinEnabled: (enabled: boolean) => set({ pinEnabled: enabled }),
      setUserPin: (pin: string) => set({ userPin: pin }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
