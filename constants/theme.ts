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
  // Primary colors - Green theme
  primary: '#22C55E',
  primaryLight: '#86EFAC',
  primaryDark: '#16A34A',
  secondary: '#10B981',
  secondaryLight: '#6EE7B7',
  secondaryDark: '#059669',
  
  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  // Text colors
  text: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Border and divider colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#E5E7EB',
  
  // Status colors
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  
  // Input colors
  inputBackground: '#F9FAFB',
  inputBorder: '#D1D5DB',
  inputPlaceholder: '#9CA3AF',
  
  // Shadow and overlay
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Tab bar colors
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#E5E7EB',
  tabBarActive: '#22C55E',
  tabBarInactive: '#9CA3AF',
  
  // Special colors
  accent: '#F59E0B',
  highlight: '#FEF3C7',
  disabled: '#D1D5DB',
};

export const darkTheme: ColorTheme = {
  // Primary colors - Green theme
  primary: '#22C55E',
  primaryLight: '#4ADE80',
  primaryDark: '#15803D',
  secondary: '#10B981',
  secondaryLight: '#34D399',
  secondaryDark: '#047857',
  
  // Background colors
  background: '#111827',
  backgroundSecondary: '#1F2937',
  surface: '#1F2937',
  card: '#374151',
  
  // Text colors
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
  textInverse: '#111827',
  
  // Border and divider colors
  border: '#4B5563',
  borderLight: '#374151',
  divider: '#4B5563',
  
  // Status colors
  success: '#10B981',
  successLight: '#064E3B',
  warning: '#F59E0B',
  warningLight: '#78350F',
  error: '#EF4444',
  errorLight: '#7F1D1D',
  info: '#3B82F6',
  infoLight: '#1E3A8A',
  
  // Input colors
  inputBackground: '#374151',
  inputBorder: '#4B5563',
  inputPlaceholder: '#9CA3AF',
  
  // Shadow and overlay
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  // Tab bar colors
  tabBarBackground: '#1F2937',
  tabBarBorder: '#374151',
  tabBarActive: '#22C55E',
  tabBarInactive: '#9CA3AF',
  
  // Special colors
  accent: '#F59E0B',
  highlight: '#78350F',
  disabled: '#6B7280',
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