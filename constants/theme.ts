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
  primary: '#FF6B35',
  primaryLight: '#FF8C5F',
  primaryDark: '#E54D1F',
  secondary: '#FFB84D',
  secondaryLight: '#FFC670',
  secondaryDark: '#FFA033',
  background: '#F5F5F5',
  backgroundSecondary: '#FFFFFF',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#FFFFFF',
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  divider: '#EEEEEE',
  success: '#4CAF50',
  successLight: '#E8F5E9',
  warning: '#FFB84D',
  warningLight: '#FFF8E1',
  error: '#FF5252',
  errorLight: '#FFE5E5',
  info: '#2196F3',
  infoLight: '#E3F2FD',
  inputBackground: '#F8F8F8',
  inputBorder: '#E0E0E0',
  inputPlaceholder: '#999999',
  shadow: '#00000015',
  overlay: '#00000080',
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#F0F0F0',
  tabBarActive: '#FF6B35',
  tabBarInactive: '#999999',
  accent: '#FF6B35',
  highlight: '#FFF5F0',
  disabled: '#CCCCCC',
};

export const darkTheme: ColorTheme = {
  primary: '#FF6B35',
  primaryLight: '#FF8C5F',
  primaryDark: '#E54D1F',
  secondary: '#FFB84D',
  secondaryLight: '#FFC670',
  secondaryDark: '#FFA033',
  background: '#161616',
  backgroundSecondary: '#1E1E1E',
  surface: '#242424',
  card: '#2C2C2C',
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textTertiary: '#808080',
  textInverse: '#1A1A1A',
  border: '#333333',
  borderLight: '#2A2A2A',
  divider: '#333333',
  success: '#66BB6A',
  successLight: '#4CAF5033',
  warning: '#FFB84D',
  warningLight: '#FFB84D33',
  error: '#FF5252',
  errorLight: '#FF525233',
  info: '#42A5F5',
  infoLight: '#2196F333',
  inputBackground: '#2A2A2A',
  inputBorder: '#404040',
  inputPlaceholder: '#808080',
  shadow: '#00000040',
  overlay: '#000000CC',
  tabBarBackground: '#1E1E1E',
  tabBarBorder: '#333333',
  tabBarActive: '#FF6B35',
  tabBarInactive: '#808080',
  accent: '#FF6B35',
  highlight: '#FF6B3526',
  disabled: '#555555',
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
