export interface ColorTheme {
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  // Background colors
  background: string;
  backgroundSecondary: string;
  surface: string;
  card: string;
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  // Border and divider colors
  border: string;
  borderLight: string;
  divider: string;
  // Status colors
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;
  // Input colors
  inputBackground: string;
  inputBorder: string;
  inputPlaceholder: string;
  // Shadow and overlay
  shadow: string;
  overlay: string;
  // Tab bar colors
  tabBarBackground: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
  // Special colors
  accent: string;
  highlight: string;
  disabled: string;
}

export const lightTheme: ColorTheme = {
  primary: '#3e73ff',
  primaryLight: '#6b93ff',
  primaryDark: '#2656e6',
  secondary: '#4d45d6',
  secondaryLight: '#6e68e0',
  secondaryDark: '#352bb1',
  background: '#ffffff',
  backgroundSecondary: '#FFFFFF',
  surface: '#FFFFFF',
  card: '#F5F5F5',
  text: '#1A1A2E',
  textSecondary: '#5A5F7D',
  textTertiary: '#9095B0',
  textInverse: '#FFFFFF',
  border: '#D8DCEF',
  borderLight: '#E8EBFA',
  divider: '#E3E6F5',
  success: '#4CAF50',
  successLight: '#E8F5E9',
  warning: '#FFA726',
  warningLight: '#FFF3E0',
  error: '#EF5350',
  errorLight: '#FFEBEE',
  info: '#3e73ff',
  infoLight: '#E8EEFF',
  inputBackground: '#F5F7FF',
  inputBorder: '#D8DCEF',
  inputPlaceholder: '#9095B0',
  shadow: '#3e73ff15',
  overlay: '#1A1A2E80',
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#E8EBFA',
  tabBarActive: '#3e73ff',
  tabBarInactive: '#9095B0',
  accent: '#4d45d6',
  highlight: '#F0F2FF',
  disabled: '#CED1E0',
};

export const darkTheme: ColorTheme = {
  primary: '#3e73ff',
  primaryLight: '#6b93ff',
  primaryDark: '#2656e6',
  secondary: '#4d45d6',
  secondaryLight: '#6e68e0',
  secondaryDark: '#352bb1',
  background: '#111111',
  backgroundSecondary: '#16182A',
  surface: '#1C1F33',
  card: '#1e1e1e',
  text: '#FFFFFF',
  textSecondary: '#B4B8D4',
  textTertiary: '#7E83A8',
  textInverse: '#0F1119',
  border: '#2D3250',
  borderLight: '#252840',
  divider: '#2A2E4A',
  success: '#66BB6A',
  successLight: '#4CAF5033',
  warning: '#FFB74D',
  warningLight: '#FFA72633',
  error: '#EF5350',
  errorLight: '#EF535033',
  info: '#3e73ff',
  infoLight: '#3e73ff33',
  inputBackground: '#1C1F33',
  inputBorder: '#353A5C',
  inputPlaceholder: '#7E83A8',
  shadow: '#00000050',
  overlay: '#000000CC',
  tabBarBackground: '#16182A',
  tabBarBorder: '#2A2E4A',
  tabBarActive: '#3e73ff',
  tabBarInactive: '#7E83A8',
  accent: '#4d45d6',
  highlight: '#3e73ff26',
  disabled: '#4A4E6B',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
};

export const fontSize = {
  '2xs': 8,
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 36,
};

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};
