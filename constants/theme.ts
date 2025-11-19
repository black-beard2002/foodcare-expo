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
  // Rich Gold & Deep Navy - Premium palette
  primary: '#C9A961', // Champagne Gold
  primaryLight: '#D4B876', // Lighter Gold
  primaryDark: '#B8964D', // Deeper Gold

  secondary: '#2C3E50', // Deep Navy
  secondaryLight: '#34495E', // Lighter Navy
  secondaryDark: '#1A252F', // Darker Navy

  background: '#FAFAFA', // Soft Off-White
  backgroundSecondary: '#F5F5F7', // Subtle Gray
  surface: '#FFFFFF', // Pure White
  card: '#FFFFFF', // Pure White Cards

  text: '#1A1A1A', // Rich Black
  textSecondary: '#4A5568', // Sophisticated Gray
  textTertiary: '#718096', // Muted Gray
  textInverse: '#FFFFFF', // White

  border: '#E2E8F0', // Soft Border
  borderLight: '#EDF2F7', // Lighter Border
  divider: '#E8EAF0', // Subtle Divider

  success: '#059669', // Emerald Green
  successLight: '#D1FAE5', // Light Emerald
  warning: '#D97706', // Amber
  warningLight: '#FEF3C7', // Light Amber
  error: '#DC2626', // Ruby Red
  errorLight: '#FEE2E2', // Light Ruby

  info: '#0891B2', // Cyan
  infoLight: '#CFFAFE', // Light Cyan

  inputBackground: '#F9FAFB', // Soft Input BG
  inputBorder: '#D1D5DB', // Input Border
  inputPlaceholder: '#9CA3AF', // Placeholder Gray

  shadow: '#C9A96120', // Gold Shadow
  overlay: '#1A1A1ACC', // Dark Overlay

  tabBarBackground: '#FFFFFF', // White Tab Bar
  tabBarBorder: '#E8EAF0', // Subtle Border
  tabBarActive: '#C9A961', // Gold Active
  tabBarInactive: '#9CA3AF', // Gray Inactive

  accent: '#8B5CF6', // Royal Purple
  highlight: '#F3F1EC', // Cream Highlight
  disabled: '#CBD5E0', // Disabled Gray
};

export const darkTheme: ColorTheme = {
  // Luxurious Dark with Gold Accents
  primary: '#D4AF37', // Pure Gold
  primaryLight: '#E5C158', // Bright Gold
  primaryDark: '#B8941F', // Deep Gold

  secondary: '#1E293B', // Midnight Blue
  secondaryLight: '#334155', // Slate
  secondaryDark: '#0F172A', // Deep Midnight

  background: '#0A0A0A', // Rich Black
  backgroundSecondary: '#141414', // Charcoal
  surface: '#1A1A1A', // Dark Surface
  card: '#1F1F1F', // Dark Card

  text: '#FAFAFA', // Off-White Text
  textSecondary: '#A1A1AA', // Silver Gray
  textTertiary: '#71717A', // Muted Gray
  textInverse: '#0A0A0A', // Black

  border: '#27272A', // Dark Border
  borderLight: '#2D2D30', // Lighter Dark Border
  divider: '#262626', // Subtle Divider

  success: '#10B981', // Emerald
  successLight: '#05966933', // Transparent Emerald
  warning: '#F59E0B', // Amber
  warningLight: '#D9770633', // Transparent Amber
  error: '#EF4444', // Red
  errorLight: '#DC262633', // Transparent Red

  info: '#06B6D4', // Cyan
  infoLight: '#0891B233', // Transparent Cyan

  inputBackground: '#1F1F1F', // Dark Input
  inputBorder: '#3F3F46', // Input Border
  inputPlaceholder: '#71717A', // Placeholder

  shadow: '#00000060', // Deep Shadow
  overlay: '#000000DD', // Strong Overlay

  tabBarBackground: '#141414', // Dark Tab Bar
  tabBarBorder: '#27272A', // Border
  tabBarActive: '#D4AF37', // Gold Active
  tabBarInactive: '#71717A', // Gray Inactive

  accent: '#A78BFA', // Lavender Purple
  highlight: '#D4AF3726', // Transparent Gold
  disabled: '#52525B', // Disabled Gray
};

// Optional: Rose Gold variant for even more luxury
export const roseGoldTheme: ColorTheme = {
  // Rose Gold & Burgundy - Ultra Premium
  primary: '#B76E79', // Rose Gold
  primaryLight: '#C8888F', // Light Rose Gold
  primaryDark: '#9F5A63', // Deep Rose Gold

  secondary: '#5D3A3A', // Burgundy
  secondaryLight: '#6E4848', // Light Burgundy
  secondaryDark: '#4A2E2E', // Deep Burgundy

  background: '#FFF8F8', // Soft Blush
  backgroundSecondary: '#FFF0F0', // Blush Tint
  surface: '#FFFFFF', // Pure White
  card: '#FFFFFF', // Pure White Cards

  text: '#2D1B1B', // Rich Brown
  textSecondary: '#5D4848', // Warm Gray
  textTertiary: '#8B7373', // Muted Rose
  textInverse: '#FFFFFF', // White

  border: '#F0E0E0', // Soft Rose Border
  borderLight: '#F5E8E8', // Lighter Border
  divider: '#F0E5E5', // Subtle Divider

  success: '#059669', // Emerald
  successLight: '#D1FAE5', // Light Emerald
  warning: '#D97706', // Amber
  warningLight: '#FEF3C7', // Light Amber
  error: '#BE123C', // Deep Rose Red
  errorLight: '#FFE4E6', // Light Rose

  info: '#0891B2', // Cyan
  infoLight: '#CFFAFE', // Light Cyan

  inputBackground: '#FFF5F5', // Blush Input
  inputBorder: '#E8D5D5', // Rose Border
  inputPlaceholder: '#A89090', // Rose Gray

  shadow: '#B76E7920', // Rose Shadow
  overlay: '#2D1B1BCC', // Dark Overlay

  tabBarBackground: '#FFFFFF', // White Tab Bar
  tabBarBorder: '#F0E5E5', // Subtle Border
  tabBarActive: '#B76E79', // Rose Gold Active
  tabBarInactive: '#A89090', // Gray Inactive

  accent: '#BE123C', // Deep Rose Accent
  highlight: '#FFF0F0', // Blush Highlight
  disabled: '#D5C5C5', // Disabled Rose Gray
};

// Optional: Platinum variant for modern luxury
export const platinumTheme: ColorTheme = {
  // Platinum & Charcoal - Modern Luxury
  primary: '#8E9AAF', // Cool Platinum
  primaryLight: '#A5AFBF', // Light Platinum
  primaryDark: '#6D7B95', // Deep Platinum

  secondary: '#3D4451', // Charcoal
  secondaryLight: '#4F5765', // Light Charcoal
  secondaryDark: '#2A2F3A', // Deep Charcoal

  background: '#F8F9FA', // Cool White
  backgroundSecondary: '#F1F3F5', // Cool Gray
  surface: '#FFFFFF', // Pure White
  card: '#FFFFFF', // Pure White Cards

  text: '#212529', // Deep Charcoal Text
  textSecondary: '#495057', // Medium Gray
  textTertiary: '#6C757D', // Light Gray
  textInverse: '#FFFFFF', // White

  border: '#DEE2E6', // Cool Border
  borderLight: '#E9ECEF', // Lighter Border
  divider: '#E5E8EB', // Subtle Divider

  success: '#059669', // Emerald
  successLight: '#D1FAE5', // Light Emerald
  warning: '#D97706', // Amber
  warningLight: '#FEF3C7', // Light Amber
  error: '#DC2626', // Red
  errorLight: '#FEE2E2', // Light Red

  info: '#0284C7', // Sky Blue
  infoLight: '#E0F2FE', // Light Sky

  inputBackground: '#F8F9FA', // Cool Input
  inputBorder: '#CED4DA', // Input Border
  inputPlaceholder: '#6C757D', // Placeholder

  shadow: '#8E9AAF20', // Platinum Shadow
  overlay: '#212529CC', // Dark Overlay

  tabBarBackground: '#FFFFFF', // White Tab Bar
  tabBarBorder: '#E5E8EB', // Subtle Border
  tabBarActive: '#8E9AAF', // Platinum Active
  tabBarInactive: '#6C757D', // Gray Inactive

  accent: '#6366F1', // Indigo Accent
  highlight: '#F1F3F5', // Cool Highlight
  disabled: '#ADB5BD', // Disabled Gray
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
