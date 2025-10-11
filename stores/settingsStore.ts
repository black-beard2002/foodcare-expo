import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  biometricEnabled: boolean;
  pinEnabled: boolean;
  userPin: string;
  notificationsEnabled: boolean;
  darkMode: boolean;
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
  setPinEnabled: (enabled: boolean) => Promise<void>;
  setUserPin: (pin: string) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  setDarkMode: (enabled: boolean) => Promise<void>;
  loadSettings: () => Promise<void>;
  resetSettings: () => Promise<void>;
}

const defaultSettings = {
  biometricEnabled: false,
  pinEnabled: false,
  userPin: '',
  notificationsEnabled: true,
  darkMode: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      setBiometricEnabled: async (enabled: boolean) => {
        set({ biometricEnabled: enabled });
        await AsyncStorage.setItem(
          'settings-storage',
          JSON.stringify({ state: { ...get() } })
        );
      },

      setPinEnabled: async (enabled: boolean) => {
        set({ pinEnabled: enabled });
        await AsyncStorage.setItem(
          'settings-storage',
          JSON.stringify({ state: { ...get() } })
        );
      },

      setUserPin: async (pin: string) => {
        set({ userPin: pin });
        await AsyncStorage.setItem(
          'settings-storage',
          JSON.stringify({ state: { ...get() } })
        );
      },

      setNotificationsEnabled: async (enabled: boolean) => {
        set({ notificationsEnabled: enabled });
        await AsyncStorage.setItem(
          'settings-storage',
          JSON.stringify({ state: { ...get() } })
        );
      },

      setDarkMode: async (enabled: boolean) => {
        set({ darkMode: enabled });
        await AsyncStorage.setItem(
          'settings-storage',
          JSON.stringify({ state: { ...get() } })
        );
      },

      loadSettings: async () => {
        try {
          const stored = await AsyncStorage.getItem('settings-storage');
          if (stored) {
            const parsed = JSON.parse(stored);
            set({
              ...defaultSettings,
              ...parsed.state,
            });
            console.log('Settings loaded successfully:', parsed.state);
          } else {
            console.log('No stored settings found, using defaults');
            set(defaultSettings);
          }
        } catch (error) {
          console.error('Error loading settings:', error);
          set(defaultSettings);
        }
      },

      resetSettings: async () => {
        set(defaultSettings);
        await AsyncStorage.setItem(
          'settings-storage',
          JSON.stringify({ state: defaultSettings })
        );
        console.log('Settings reset to defaults');
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        console.log('Settings hydration complete:', state);
      },
    }
  )
);
