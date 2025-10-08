import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  biometricEnabled: boolean;
  pinEnabled: boolean;
  userPin: string;
  notificationsEnabled: boolean;
  darkMode: boolean;
  setBiometricEnabled: (enabled: boolean) => void;
  setPinEnabled: (enabled: boolean) => void;
  setUserPin: (pin: string) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDarkMode: (enabled: boolean) => void;
  loadSettings: () => Promise<void>;
  resetSettings: () => void;
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

      setBiometricEnabled: (enabled: boolean) =>
        set({ biometricEnabled: enabled }),

      setPinEnabled: (enabled: boolean) => set({ pinEnabled: enabled }),

      setUserPin: (pin: string) => set({ userPin: pin }),

      setNotificationsEnabled: (enabled: boolean) =>
        set({ notificationsEnabled: enabled }),

      setDarkMode: (enabled: boolean) => set({ darkMode: enabled }),

      loadSettings: async () => {
        try {
          const stored = await AsyncStorage.getItem('settings-storage');
          if (stored) {
            const parsedSettings = JSON.parse(stored);
            // Merge stored settings with defaults to ensure all fields exist
            set({
              ...defaultSettings,
              ...parsedSettings.state,
            });
            console.log('Settings loaded successfully:', parsedSettings.state);
          } else {
            console.log('No stored settings found, using defaults');
            set(defaultSettings);
          }
        } catch (error) {
          console.error('Error loading settings:', error);
          // On error, use defaults
          set(defaultSettings);
        }
      },

      resetSettings: () => {
        set(defaultSettings);
        console.log('Settings reset to defaults');
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Ensure settings are loaded from storage on hydration
      onRehydrateStorage: () => (state) => {
        console.log('Settings hydration complete:', state);
      },
    }
  )
);
