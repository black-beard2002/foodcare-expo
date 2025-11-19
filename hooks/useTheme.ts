import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/stores/themeStore';
import {
  lightTheme,
  darkTheme,
  ColorTheme,
  platinumTheme,
  roseGoldTheme,
} from '@/constants/theme';

export const useTheme = (): {
  theme: ColorTheme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system' | 'rose' | 'platinum') => void;
  currentTheme: 'light' | 'dark' | 'system' | 'rose' | 'platinum';
} => {
  const systemScheme = useColorScheme();
  const { theme: userTheme, setTheme } = useThemeStore();

  // Determine the theme based on user selection
  let theme: ColorTheme;
  let isDark: boolean;

  switch (userTheme) {
    case 'rose':
      theme = roseGoldTheme;
      isDark = false; // Rose Gold is a light theme variant
      break;
    case 'platinum':
      theme = platinumTheme;
      isDark = false; // Platinum is a light theme variant
      break;
    case 'dark':
      theme = darkTheme;
      isDark = true;
      break;
    case 'light':
      theme = lightTheme;
      isDark = false;
      break;
    case 'system':
    default:
      // Follow system preference
      const effectiveScheme = systemScheme ?? 'light';
      isDark = effectiveScheme === 'dark';
      theme = isDark ? darkTheme : lightTheme;
      break;
  }

  const toggleTheme = () => {
    // Toggle between light and dark (ignore custom themes when using quick toggle)
    if (userTheme === 'rose' || userTheme === 'platinum') {
      // If on a custom light theme, go to dark
      setTheme('dark');
    } else if (userTheme === 'dark') {
      // If on dark, go to light
      setTheme('light');
    } else if (userTheme === 'light') {
      // If on light, go to dark
      setTheme('dark');
    } else {
      // System theme - toggle based on current effective theme
      const newTheme = isDark ? 'light' : 'dark';
      setTheme(newTheme);
    }
  };

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme,
    currentTheme: userTheme,
  };
};
