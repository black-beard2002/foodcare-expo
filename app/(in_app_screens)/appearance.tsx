import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  ColorValue,
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Palette,
  Moon,
  Sun,
  Smartphone,
  Check,
  LucideIcon,
  Sparkles,
  Crown,
  Gem,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

interface ThemeOptions {
  key: 'light' | 'dark' | 'system' | 'rose' | 'platinum';
  label: string;
  icon: LucideIcon;
  description: string;
  color: string;
  gradient: [ColorValue, ColorValue];
  isPremium?: boolean;
}

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme, setTheme, currentTheme } = useTheme();

  const themeOptions: ThemeOptions[] = [
    {
      key: 'light',
      label: 'Champagne Gold',
      icon: Sun,
      description: 'Classic luxury with gold accents',
      color: '#C9A961',
      gradient: ['#F3F1EC', '#D4B876'],
    },
    {
      key: 'dark',
      label: 'Pure Gold',
      icon: Moon,
      description: 'Bold luxury for dark mode',
      color: '#D4AF37',
      gradient: ['#2A2A2A', '#D4AF37'],
    },
    {
      key: 'rose',
      label: 'Rose Gold',
      icon: Crown,
      description: 'Modern feminine elegance',
      color: '#B76E79',
      gradient: ['#FFF0F0', '#C8888F'],
      isPremium: true,
    },
    {
      key: 'platinum',
      label: 'Platinum',
      icon: Gem,
      description: 'Sleek contemporary luxury',
      color: '#8E9AAF',
      gradient: ['#F1F3F5', '#A5AFBF'],
      isPremium: true,
    },
    {
      key: 'system',
      label: 'System Default',
      icon: Smartphone,
      description: 'Follow device settings',
      color: '#3B82F6',
      gradient: ['#DBEAFE', '#93C5FD'],
    },
  ];

  const getThemeDisplayName = (themeKey: string) => {
    const option = themeOptions.find((opt) => opt.key === themeKey);
    return option?.label || 'Light';
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      {/* Header */}
      <View
        className="px-6 py-5"
        style={{
          backgroundColor: theme.card,
          shadowColor: theme.text,
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 2 },
          elevation: 4,
        }}
      >
        <View className="flex-row items-center mb-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 rounded-2xl justify-center items-center mr-4"
            style={{
              backgroundColor: theme.background,
              borderWidth: 1,
              borderColor: theme.border,
            }}
            activeOpacity={0.7}
          >
            <ArrowLeft color={theme.text} size={22} strokeWidth={2.5} />
          </TouchableOpacity>

          <View className="flex-1">
            <Text
              className="text-3xl font-inter-bold"
              style={{ color: theme.text }}
            >
              Appearance
            </Text>
          </View>

          <View
            className="w-12 h-12 rounded-2xl items-center justify-center"
            style={{
              backgroundColor: theme.primary + '15',
            }}
          >
            <Palette color={theme.primary} size={24} />
          </View>
        </View>

        <Text
          className="text-sm font-inter-medium"
          style={{ color: theme.textSecondary }}
        >
          Customize your luxury experience
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Current Theme Preview Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          className="mx-5 mt-6 mb-6 rounded-3xl overflow-hidden"
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
            shadowColor: theme.text,
            shadowOpacity: 0.1,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 5,
          }}
        >
          <LinearGradient
            colors={[theme.primary + '15', theme.primary + '05']}
            className="p-6"
          >
            <View className="flex-row items-center justify-center mb-4">
              <View
                className="w-20 h-20 rounded-3xl justify-center items-center"
                style={{
                  backgroundColor: theme.primary + '20',
                  borderWidth: 2,
                  borderColor: theme.primary + '40',
                }}
              >
                <Sparkles color={theme.primary} size={40} strokeWidth={2} />
              </View>
            </View>
            <Text
              className="text-center text-xl font-inter-bold mb-2"
              style={{ color: theme.text }}
            >
              {getThemeDisplayName(currentTheme)}
            </Text>
            <Text
              className="text-center text-sm font-inter-medium"
              style={{ color: theme.textSecondary }}
            >
              Currently active theme
            </Text>
          </LinearGradient>
        </MotiView>

        {/* Quick Toggle Section */}
        <View className="mx-5 mb-6">
          <View
            className="rounded-2xl p-5"
            style={{
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              shadowColor: theme.text,
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center flex-1 gap-3">
                <View
                  className="w-12 h-12 rounded-xl justify-center items-center"
                  style={{ backgroundColor: theme.primary + '15' }}
                >
                  {isDark ? (
                    <Moon color={theme.primary} size={24} strokeWidth={2} />
                  ) : (
                    <Sun color={theme.primary} size={24} strokeWidth={2} />
                  )}
                </View>
                <View className="flex-1">
                  <Text
                    className="text-base font-inter-bold mb-0.5"
                    style={{ color: theme.text }}
                  >
                    Dark Mode
                  </Text>
                  <Text
                    className="text-xs font-inter-medium"
                    style={{ color: theme.textSecondary }}
                  >
                    Quick toggle between light and dark
                  </Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={theme.border}
              />
            </View>
          </View>
        </View>

        {/* Theme Options Section */}
        <View className="mx-5 mb-6">
          <Text
            className="text-xs font-inter-bold mb-4 uppercase tracking-wider px-1"
            style={{ color: theme.textSecondary }}
          >
            Luxury Themes
          </Text>

          <View className="gap-3">
            {themeOptions.map((option, index) => {
              const isSelected = currentTheme === option.key;
              return (
                <MotiView
                  key={option.key}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{
                    type: 'timing',
                    duration: 300,
                    delay: index * 80,
                  }}
                >
                  <TouchableOpacity
                    className="rounded-2xl overflow-hidden"
                    style={{
                      backgroundColor: isSelected
                        ? theme.primary + '10'
                        : theme.card,
                      borderWidth: 2,
                      borderColor: isSelected ? theme.primary : theme.border,
                      shadowColor: isSelected ? theme.primary : theme.text,
                      shadowOpacity: isSelected ? 0.2 : 0.05,
                      shadowRadius: isSelected ? 12 : 8,
                      shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
                      elevation: isSelected ? 5 : 2,
                    }}
                    onPress={() => setTheme(option.key as any)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={
                        isSelected
                          ? [theme.primary + '10', theme.primary + '05']
                          : [theme.card, theme.card]
                      }
                      className="p-5"
                    >
                      <View className="flex-row items-center">
                        <View className="flex-row items-center flex-1 gap-4">
                          <View className="relative">
                            <View
                              className="w-16 h-16 rounded-2xl justify-center items-center overflow-hidden"
                              style={{
                                backgroundColor: isSelected
                                  ? theme.primary + '20'
                                  : theme.inputBackground,
                                borderWidth: isSelected ? 2 : 0,
                                borderColor: theme.primary + '40',
                              }}
                            >
                              {isSelected ? (
                                <LinearGradient
                                  colors={option.gradient}
                                  className="w-full h-full justify-center items-center"
                                >
                                  <option.icon
                                    color={option.color}
                                    size={28}
                                    strokeWidth={2.5}
                                  />
                                </LinearGradient>
                              ) : (
                                <option.icon
                                  color={theme.textSecondary}
                                  size={28}
                                  strokeWidth={2}
                                />
                              )}
                            </View>
                            {isSelected && (
                              <MotiView
                                from={{ scale: 0, rotate: '-180deg' }}
                                animate={{ scale: 1, rotate: '0deg' }}
                                transition={{
                                  type: 'spring',
                                  damping: 12,
                                  stiffness: 200,
                                }}
                                className="absolute -top-2 -right-2 w-7 h-7 rounded-full justify-center items-center"
                                style={{
                                  backgroundColor: theme.primary,
                                  shadowColor: theme.primary,
                                  shadowOpacity: 0.4,
                                  shadowRadius: 4,
                                  elevation: 4,
                                }}
                              >
                                <Check color="#fff" size={16} strokeWidth={3} />
                              </MotiView>
                            )}
                            {option.isPremium && !isSelected && (
                              <View
                                className="absolute -top-1 -right-1 w-6 h-6 rounded-full justify-center items-center"
                                style={{ backgroundColor: option.color }}
                              >
                                <Sparkles
                                  color="#fff"
                                  size={12}
                                  strokeWidth={2.5}
                                />
                              </View>
                            )}
                          </View>
                          <View className="flex-1">
                            <View className="flex-row items-center gap-2 mb-1">
                              <Text
                                className="text-lg font-inter-bold"
                                style={{
                                  color: isSelected
                                    ? theme.primary
                                    : theme.text,
                                }}
                              >
                                {option.label}
                              </Text>
                              {option.isPremium && (
                                <View
                                  className="px-2 py-0.5 rounded-md"
                                  style={{
                                    backgroundColor: option.color + '20',
                                  }}
                                >
                                  <Text
                                    className="text-xs font-inter-bold"
                                    style={{ color: option.color }}
                                  >
                                    PREMIUM
                                  </Text>
                                </View>
                              )}
                            </View>
                            <Text
                              className="text-sm font-inter-medium leading-5"
                              style={{ color: theme.textSecondary }}
                            >
                              {option.description}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </MotiView>
              );
            })}
          </View>
        </View>

        {/* Info Card */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 500 }}
          className="mx-5 mb-8 rounded-2xl p-5"
          style={{
            backgroundColor: theme.primary + '10',
            borderWidth: 1,
            borderColor: theme.primary + '30',
          }}
        >
          <View className="flex-row items-start gap-3">
            <View
              className="w-12 h-12 rounded-2xl justify-center items-center mt-0.5"
              style={{ backgroundColor: theme.primary + '20' }}
            >
              <Sparkles color={theme.primary} size={22} strokeWidth={2.5} />
            </View>
            <View className="flex-1">
              <Text
                className="text-base font-inter-bold mb-2"
                style={{ color: theme.text }}
              >
                Premium Experience
              </Text>
              <Text
                className="text-sm font-inter-medium leading-6"
                style={{ color: theme.textSecondary }}
              >
                Each theme is carefully crafted with premium color palettes to
                provide a luxury experience. Choose the one that best matches
                your style and mood.
              </Text>
            </View>
          </View>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}
