import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/stores/themeStore';
import { lightTheme, darkTheme, ColorTheme } from '@/constants/theme';

export const useTheme = (): {
  theme: ColorTheme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  currentTheme: 'light' | 'dark' | 'system';
} => {
  const systemScheme = useColorScheme();
  const { theme: userTheme, setTheme } = useThemeStore();

  // Determine the effective theme
  const effectiveScheme = userTheme === 'system' ? systemScheme ?? 'light' : userTheme;
  const isDark = effectiveScheme === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    const newTheme = effectiveScheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme,
    currentTheme: userTheme,
  };
};