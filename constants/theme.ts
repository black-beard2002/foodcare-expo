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
  // Primary colors - Golden Yellow/Amber (matches the buttons and accents)
  primary: 'rgba(255, 193, 7, 1)', // Sampled from active button/icon: #FFC107
  primaryLight: 'rgba(255, 215, 64, 1)', // Lighter golden
  primaryDark: 'rgba(230, 169, 0, 1)', // Darker golden
  secondary: 'rgba(255, 152, 0, 1)', // A complementary orange/amber
  secondaryLight: 'rgba(255, 183, 77, 1)',
  secondaryDark: 'rgba(245, 124, 0, 1)',

  // Background colors - Soft white/off-white with subtle depth
  background: 'rgba(252, 252, 252, 1)', // Very light off-white background
  backgroundSecondary: 'rgba(248, 248, 248, 1)', // Slightly deeper for subtle layers
  surface: 'rgba(255, 255, 255, 1)', // Pure white for cards/surfaces
  card: 'rgba(255, 255, 255, 1)', // Pure white for cards

  // Text colors - Dark grey/black for contrast
  text: 'rgba(30, 30, 30, 1)', // Very dark grey, almost black for main text
  textSecondary: 'rgba(100, 100, 100, 1)', // Medium grey for less important text (e.g., recipe details)
  textTertiary: 'rgba(160, 160, 160, 1)', // Light grey for subtle labels/placeholders
  textInverse: 'rgba(255, 255, 255, 1)', // White text (used on primary-colored elements)

  // Border and divider colors - Very light grey for a clean look
  border: 'rgba(230, 230, 230, 1)',
  borderLight: 'rgba(240, 240, 240, 1)',
  divider: 'rgba(230, 230, 230, 1)',

  // Status colors - Standard web colors (no clear status colors in the image, so keeping standard)
  success: 'rgba(76, 175, 80, 1)',
  successLight: 'rgba(232, 245, 233, 1)',
  warning: 'rgba(255, 193, 7, 1)', // Using primary for warning since it's a common pattern
  warningLight: 'rgba(254, 249, 231, 1)',
  error: 'rgba(244, 67, 54, 1)',
  errorLight: 'rgba(252, 232, 230, 1)',
  info: 'rgba(33, 150, 243, 1)',
  infoLight: 'rgba(232, 240, 254, 1)',

  // Input colors (Assuming standard light design for inputs not explicitly shown)
  inputBackground: 'rgba(248, 248, 248, 1)',
  inputBorder: 'rgba(215, 215, 215, 1)',
  inputPlaceholder: 'rgba(160, 160, 160, 1)',

  // Shadow and overlay - Soft, subtle shadow
  shadow: 'rgba(0, 0, 0, 0.2)', // Very light shadow for depth
  overlay: 'rgba(30, 30, 30, 0.5)',

  // Tab bar colors (Based on the bottom navigation bar)
  tabBarBackground: 'rgba(255, 255, 255, 1)',
  tabBarBorder: 'rgba(240, 240, 240, 1)',
  tabBarActive: 'rgba(255, 193, 7, 1)', // Primary color
  tabBarInactive: 'rgba(160, 160, 160, 1)', // Text tertiary color

  // Special colors
  accent: 'rgba(255, 87, 34, 1)', // A bright orange (used for the occasional red element like the heart icon)
  highlight: 'rgba(255, 243, 224, 1)', // Lightest yellow for subtle highlight
  disabled: 'rgba(215, 215, 215, 1)',
};

export const darkTheme: ColorTheme = {
  // Keeping dark theme as is since the request only focused on light mode
  // Primary colors - Golden amber (like in the image)
  primary: 'rgba(255, 193, 7, 1)',
  primaryLight: 'rgba(255, 213, 79, 1)',
  primaryDark: 'rgba(255, 160, 0, 1)',
  secondary: 'rgba(255, 152, 0, 1)',
  secondaryLight: 'rgba(255, 183, 77, 1)',
  secondaryDark: 'rgba(245, 124, 0, 1)',

  // Background colors - Dark sophisticated tones from image
  background: 'rgba(26, 26, 26, 1)',
  backgroundSecondary: 'rgba(35, 35, 35, 1)',
  surface: 'rgba(40, 40, 40, 1)',
  card: 'rgba(45, 45, 45, 1)', // Glassmorphism effect

  // Text colors
  text: 'rgba(255, 255, 255, 1)',
  textSecondary: 'rgba(189, 189, 189, 1)',
  textTertiary: 'rgba(138, 138, 138, 1)',
  textInverse: 'rgba(26, 26, 26, 1)',

  // Border and divider colors - Subtle for glassmorphism
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.05)',
  divider: 'rgba(255, 255, 255, 0.08)',

  // Status colors
  success: 'rgba(76, 175, 80, 1)',
  successLight: 'rgba(76, 175, 80, 0.2)',
  warning: 'rgba(255, 193, 7, 1)',
  warningLight: 'rgba(255, 193, 7, 0.2)',
  error: 'rgba(244, 67, 54, 1)',
  errorLight: 'rgba(244, 67, 54, 0.2)',
  info: 'rgba(33, 150, 243, 1)',
  infoLight: 'rgba(33, 150, 243, 0.2)',

  // Input colors
  inputBackground: 'rgba(255, 255, 255, 0.05)',
  inputBorder: 'rgba(255, 255, 255, 0.1)',
  inputPlaceholder: 'rgba(138, 138, 138, 1)',

  // Shadow and overlay - Enhanced for depth
  shadow: 'rgba(0, 0, 0, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.8)',

  // Tab bar colors
  tabBarBackground: 'rgba(35, 35, 35, 0.95)',
  tabBarBorder: 'rgba(255, 255, 255, 0.05)',
  tabBarActive: 'rgba(255, 193, 7, 1)',
  tabBarInactive: 'rgba(138, 138, 138, 1)',

  // Special colors
  accent: 'rgba(255, 87, 34, 1)', // Deep orange accent
  highlight: 'rgba(255, 193, 7, 0.15)',
  disabled: 'rgba(97, 97, 97, 1)',
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
