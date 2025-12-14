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
  // Neon Green & Dark Purple - Electric palette
  primary: '#2FAE7B', // Calm emerald green
  primaryLight: '#6ED3AE', // Soft mint green
  primaryDark: '#1F7F5C', // Deep forest green

  secondary: '#2D1B69', // Deep Purple
  secondaryLight: '#3D2585', // Lighter Purple
  secondaryDark: '#1D0F4D', // Darker Purple

  // Soft off-white and light grays for better eye comfort
  background: '#FAFAFA', // Off-white background
  backgroundSecondary: '#F5F5F7', // Slightly darker off-white
  surface: '#FFFFFF', // Pure white only for surfaces
  card: '#FFFFFF', // White cards

  // Dark text on light background (not pure black)
  text: '#1A1A1A', // Very dark gray (almost black but not pure)
  textSecondary: '#4A4A4A', // Dark gray
  textTertiary: '#707070', // Medium gray
  textInverse: '#FFFFFF', // White for inverse text

  border: '#E0E0E0', // Light gray border
  borderLight: '#F0F0F0', // Very light gray border
  divider: '#EAEAEA', // Subtle divider

  success: '#00B578', // Softer green (less intense than #00FF41)
  successLight: '#E6F7F0', // Very light green
  warning: '#FF8F1F', // Orange warning (easier on eyes than electric yellow)
  warningLight: '#FFF4E8', // Very light orange
  error: '#FF4D4F', // Softer red (less intense than hot pink)
  errorLight: '#FFE8E6', // Very light red

  info: '#1890FF', // Softer blue (less intense than neon cyan)
  infoLight: '#E6F7FF', // Very light blue

  inputBackground: '#FFFFFF', // White input background
  inputBorder: '#D9D9D9', // Subtle gray border
  inputPlaceholder: '#8C8C8C', // Medium gray placeholder

  shadow: 'rgba(0, 0, 0, 0.08)', // Subtle gray shadow
  overlay: 'rgba(0, 0, 0, 0.45)', // Semi-transparent black overlay

  tabBarBackground: '#FFFFFF', // White tab bar
  tabBarBorder: '#F0F0F0', // Very light border
  tabBarActive: '#39FF14', // Neon Green Active
  tabBarInactive: '#8C8C8C', // Medium gray inactive

  accent: '#722ED1', // Softer purple (less intense than electric purple)
  highlight: 'rgba(57, 255, 20, 0.12)', // Transparent Neon Green
  disabled: '#D9D9D9', // Light gray for disabled state
};

export const darkTheme: ColorTheme = {
  // Neon Green with Dark Gray/Blue palette
  primary: '#3BCF9B', // Soft vibrant emerald (main accent)
  primaryLight: '#7EE6C3', // Mint highlight for hover / focus
  primaryDark: '#24926F', // Deep teal-green for pressed states

  secondary: '#3D2585', // Deep Violet (lighter than pure black)
  secondaryLight: '#4D30A0', // Lighter Violet
  secondaryDark: '#2D1B69', // Dark Violet

  // Dark gray backgrounds (no pure black)
  background: '#121212', // Dark gray (not pure black)
  backgroundSecondary: '#1E1E1E', // Slightly lighter dark gray
  surface: '#242424', // Dark surface
  card: '#2D2D2D', // Dark card

  // Light text on dark background (not pure white)
  text: '#E6E6E6', // Off-white (not pure white)
  textSecondary: '#B3B3B3', // Light gray
  textTertiary: '#8C8C8C', // Medium-light gray
  textInverse: '#1A1A1A', // Very dark gray for inverse text

  border: '#404040', // Dark gray border
  borderLight: '#4D4D4D', // Lighter dark gray border
  divider: '#363636', // Subtle divider

  success: '#52C41A', // Softer green
  successLight: 'rgba(82, 196, 26, 0.2)', // Transparent green
  warning: '#FAAD14', // Softer yellow/orange
  warningLight: 'rgba(250, 173, 20, 0.2)', // Transparent yellow
  error: '#FF4D4F', // Softer red
  errorLight: 'rgba(255, 77, 79, 0.2)', // Transparent red

  info: '#1890FF', // Softer blue
  infoLight: 'rgba(24, 144, 255, 0.2)', // Transparent blue

  inputBackground: '#2D2D2D', // Dark input
  inputBorder: '#404040', // Dark gray border
  inputPlaceholder: '#666666', // Medium gray placeholder

  shadow: 'rgba(57, 255, 20, 0.15)', // Neon Green Shadow
  overlay: 'rgba(18, 18, 18, 0.85)', // Dark overlay

  tabBarBackground: '#1E1E1E', // Dark Tab Bar
  tabBarBorder: '#363636', // Border
  tabBarActive: '#39FF14', // Neon Green Active
  tabBarInactive: '#8C8C8C', // Gray Inactive

  accent: '#BD00FF', // Electric Purple
  highlight: 'rgba(57, 255, 20, 0.15)', // Transparent Neon Green
  disabled: '#4A4A4A', // Disabled Gray
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
