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
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

interface ThemeOptions {
  key: 'light' | 'dark' | 'system';
  label: string;
  icon: LucideIcon;
  description: string;
  color: string;
  gradient: [ColorValue, ColorValue];
}
export default function SettingsScreen() {
  const { theme, isDark, toggleTheme, setTheme, currentTheme } = useTheme();

  const themeOptions: ThemeOptions[] = [
    {
      key: 'light',
      label: 'Light',
      icon: Sun,
      description: 'Always use light theme',
      color: '#F59E0B',
      gradient: ['#FEF3C7', '#FCD34D'],
    },
    {
      key: 'dark',
      label: 'Dark',
      icon: Moon,
      description: 'Always use dark theme',
      color: '#8B5CF6',
      gradient: ['#DDD6FE', '#A78BFA'],
    },
    {
      key: 'system',
      label: 'System',
      icon: Smartphone,
      description: 'Follow system settings',
      color: '#3B82F6',
      gradient: ['#DBEAFE', '#93C5FD'],
    },
  ];

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <View className="flex-row items-center px-5 pt-4 pb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-xl justify-center items-center mr-4"
          style={{ backgroundColor: theme.inputBackground }}
          activeOpacity={0.7}
        >
          <ArrowLeft color={theme.text} size={20} strokeWidth={2} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold" style={{ color: theme.text }}>
          Appearance
        </Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Theme Preview Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          className="mb-6 rounded-3xl overflow-hidden shadow-lg"
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <LinearGradient
            colors={isDark ? ['#1F2937', '#111827'] : ['#F3F4F6', '#E5E7EB']}
            className="p-6"
          >
            <View className="flex-row items-center justify-center mb-4">
              <View
                className="w-16 h-16 rounded-2xl justify-center items-center"
                style={{ backgroundColor: `${theme.primary}20` }}
              >
                <Palette color={theme.primary} size={32} strokeWidth={2} />
              </View>
            </View>
            <Text
              className="text-center text-lg font-bold mb-2"
              style={{ color: theme.text }}
            >
              Current Theme
            </Text>
            <Text
              className="text-center text-sm"
              style={{ color: theme.textSecondary }}
            >
              {currentTheme === 'light' && 'Light mode is active'}
              {currentTheme === 'dark' && 'Dark mode is active'}
              {currentTheme === 'system' && 'Following system preference'}
            </Text>
          </LinearGradient>
        </MotiView>

        {/* Quick Toggle Section */}
        <View className="mb-6">
          <View
            className="rounded-2xl p-5 shadow-sm"
            style={{
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center flex-1 gap-3">
                <View
                  className="w-12 h-12 rounded-xl justify-center items-center"
                  style={{ backgroundColor: `${theme.primary}15` }}
                >
                  {isDark ? (
                    <Moon color={theme.primary} size={24} strokeWidth={2} />
                  ) : (
                    <Sun color={theme.primary} size={24} strokeWidth={2} />
                  )}
                </View>
                <View className="flex-1">
                  <Text
                    className="text-base font-semibold mb-0.5"
                    style={{ color: theme.text }}
                  >
                    Dark Mode
                  </Text>
                  <Text
                    className="text-xs"
                    style={{ color: theme.textSecondary }}
                  >
                    Quick toggle theme
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
        <View className="mb-6">
          <Text
            className="text-xs font-semibold mb-3 uppercase tracking-wider px-1"
            style={{ color: theme.textSecondary }}
          >
            Theme Options
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
                    delay: index * 100,
                  }}
                >
                  <TouchableOpacity
                    className="rounded-2xl p-4 overflow-hidden shadow-sm"
                    style={{
                      backgroundColor: isSelected
                        ? `${option.color}15`
                        : theme.card,
                      borderWidth: 2,
                      borderColor: isSelected ? option.color : theme.border,
                    }}
                    onPress={() => setTheme(option.key as any)}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center">
                      <View className="flex-row items-center flex-1 gap-4">
                        <View className="relative">
                          <View
                            className="w-14 h-14 rounded-2xl justify-center items-center overflow-hidden"
                            style={{
                              backgroundColor: isSelected
                                ? option.color
                                : theme.inputBackground,
                            }}
                          >
                            {isSelected ? (
                              <LinearGradient
                                colors={option.gradient}
                                className="w-full h-full justify-center items-center"
                              >
                                <option.icon
                                  color={option.color}
                                  size={26}
                                  strokeWidth={2.5}
                                />
                              </LinearGradient>
                            ) : (
                              <option.icon
                                color={theme.textSecondary}
                                size={26}
                                strokeWidth={2}
                              />
                            )}
                          </View>
                          {isSelected && (
                            <MotiView
                              from={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', damping: 12 }}
                              className="absolute -top-1 -right-1 w-6 h-6 rounded-full justify-center items-center shadow-md"
                              style={{ backgroundColor: option.color }}
                            >
                              <Check color="#fff" size={14} strokeWidth={3} />
                            </MotiView>
                          )}
                        </View>
                        <View className="flex-1">
                          <Text
                            className="text-lg font-bold mb-0.5"
                            style={{
                              color: isSelected ? option.color : theme.text,
                            }}
                          >
                            {option.label}
                          </Text>
                          <Text
                            className="text-sm leading-5"
                            style={{ color: theme.textSecondary }}
                          >
                            {option.description}
                          </Text>
                        </View>
                      </View>
                    </View>
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
          transition={{ type: 'timing', duration: 400, delay: 400 }}
          className="mb-8 rounded-2xl p-5 border"
          style={{
            backgroundColor: `${theme.primary}10`,
            borderColor: `${theme.primary}30`,
          }}
        >
          <View className="flex-row items-start gap-3">
            <View
              className="w-10 h-10 rounded-full justify-center items-center mt-0.5"
              style={{ backgroundColor: `${theme.primary}20` }}
            >
              <Palette color={theme.primary} size={20} strokeWidth={2.5} />
            </View>
            <View className="flex-1">
              <Text
                className="text-base font-bold mb-2"
                style={{ color: theme.text }}
              >
                About Theme
              </Text>
              <Text
                className="text-sm leading-6"
                style={{ color: theme.textSecondary }}
              >
                The app uses a dynamic color scheme that adapts to your selected
                theme preference. System theme automatically switches between
                light and dark modes based on your device settings.
              </Text>
            </View>
          </View>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}
