import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Mail, PartyPopper, ArrowLeft, Sparkles } from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { useAlert } from '@/providers/AlertProvider';
import { useTheme } from '@/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

export default function OnboardingStep3() {
  const [email, setEmail] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  const { updateProfile, setOnboardingComplete, isLoading, user } = useAuthStore();
  const { showAlert } = useAlert();
  const { theme, isDark } = useTheme();

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const isFormValid = useMemo(
    () => email.trim().length > 0 && validateEmail(email.trim()),
    [email, validateEmail]
  );

  const handleComplete = useCallback(async () => {
    if (!isFormValid) {
      showAlert('Invalid Email', 'Please enter a valid email address', 'error');
      return;
    }

    if (!user?.id) {
      showAlert('Error', 'User session not found. Please login again.', 'error');
      return;
    }

    setIsCompleting(true);

    const result = await updateProfile({
      email: email.trim().toLowerCase(),
      has_completed_onboarding: true,
    });

    if (result.success) {
      setOnboardingComplete(true);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      showAlert('Welcome!', 'Your account is ready. Let\'s start exploring!', 'success');

      setTimeout(() => {
        router.replace('/(tabs)');
      }, 500);
    } else {
      setIsCompleting(false);
      showAlert('Error', result.error || 'Failed to complete setup', 'error');
    }
  }, [email, isFormValid, user, updateProfile, setOnboardingComplete, showAlert]);

  const gradientColors = isDark
    ? (['rgba(15,23,42,1)', 'rgba(33,42,54,1)'] as const)
    : (['rgba(250,250,250,1)', 'rgba(226,232,240,1)'] as const);

  const accentGradient = isDark
    ? (['rgba(244,208,63,1)', 'rgba(245,158,11,1)'] as const)
    : (['rgba(244,208,63,1)', 'rgb(247,177,57)'] as const);

  const successGradient = isDark
    ? (['rgba(34,197,94,1)', 'rgba(22,163,74,1)'] as const)
    : (['rgba(34,197,94,1)', 'rgba(22,163,74,1)'] as const);

  if (isCompleting) {
    return (
      <LinearGradient colors={gradientColors} className="flex-1 items-center justify-center px-6">
        <MotiView
          from={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'timing',
            duration: 600,
          }}
        >
          <LinearGradient
            colors={successGradient}
            style={{ borderRadius: 32 }}
            className="w-32 h-32 justify-center items-center mb-8"
          >
            <PartyPopper color="#fff" size={72} />
          </LinearGradient>
        </MotiView>

        <MotiView
          from={{ translateY: 20, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{
            type: 'timing',
            duration: 600,
            delay: 300,
          }}
        >
          <Text className="text-4xl font-bold mb-4 text-center" style={{ color: theme.text }}>
            Welcome Aboard!
          </Text>
          <Text
            className="text-lg text-center leading-7 mb-8 px-8"
            style={{ color: theme.textSecondary }}
          >
            Your account is all set up. Get ready to discover amazing food!
          </Text>
        </MotiView>

        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'timing',
            duration: 600,
            delay: 600,
          }}
        >
          <ActivityIndicator size="large" color={theme.primary} />
        </MotiView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={gradientColors} className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pt-16 pb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            disabled={isLoading}
            className="mb-4"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft color={theme.text} size={24} />
          </TouchableOpacity>

          <View className="items-center mb-8">
            <LinearGradient
              colors={accentGradient}
              style={{ borderRadius: 24 }}
              className="w-24 h-24 justify-center items-center mb-6"
            >
              <Sparkles color="#fff" size={56} />
            </LinearGradient>

            <Text className="text-3xl font-bold mb-3 text-center" style={{ color: theme.text }}>
              Almost There!
            </Text>
            <Text
              className="text-base text-center leading-6 px-4"
              style={{ color: theme.textSecondary }}
            >
              Add your email to receive order updates and exclusive offers
            </Text>

            <View className="flex-row items-center mt-6">
              <View className="w-8 h-1 rounded-full" style={{ backgroundColor: theme.border }} />
              <View className="w-8 h-1 rounded-full mx-2" style={{ backgroundColor: theme.border }} />
              <View className="w-8 h-1 rounded-full" style={{ backgroundColor: theme.primary }} />
            </View>
            <Text className="text-sm mt-2" style={{ color: theme.textSecondary }}>
              Step 3 of 3
            </Text>
          </View>

          <View className="flex-1 justify-center">
            <View className="mb-8">
              <Text className="text-sm font-medium mb-2" style={{ color: theme.text }}>
                Email Address
              </Text>
              <View
                className="flex-row items-center px-4 py-4 rounded-xl border-2"
                style={{
                  backgroundColor: theme.inputBackground,
                  borderColor: email && validateEmail(email) ? theme.primary : theme.border,
                }}
              >
                <Mail color={theme.textSecondary} size={20} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your.email@example.com"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  editable={!isLoading}
                  className="flex-1 ml-3 text-base"
                  style={{ color: theme.text }}
                />
              </View>
              {email && !validateEmail(email) && (
                <Text className="text-xs mt-2 px-1" style={{ color: '#ef4444' }}>
                  Please enter a valid email address
                </Text>
              )}
            </View>

            <View
              className="p-4 rounded-xl mb-8"
              style={{ backgroundColor: isDark ? 'rgba(244,208,63,0.1)' : 'rgba(244,208,63,0.15)' }}
            >
              <View className="flex-row items-start">
                <Mail color={theme.primary} size={18} style={{ marginTop: 2 }} />
                <View className="flex-1 ml-3">
                  <Text className="text-sm font-semibold mb-1" style={{ color: theme.text }}>
                    Why we need your email
                  </Text>
                  <Text className="text-xs leading-5" style={{ color: theme.textSecondary }}>
                    • Order confirmations and updates{'\n'}
                    • Exclusive deals and promotions{'\n'}
                    • Account security notifications
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleComplete}
              disabled={!isFormValid || isLoading}
              className="w-full py-4 rounded-xl items-center justify-center"
              style={{
                backgroundColor: isFormValid && !isLoading ? theme.primary : theme.border,
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View className="flex-row items-center">
                  <Text
                    className="text-base font-semibold mr-2"
                    style={{
                      color: isFormValid ? '#fff' : theme.textSecondary,
                    }}
                  >
                    Complete Setup
                  </Text>
                  <Sparkles color={isFormValid ? '#fff' : theme.textSecondary} size={18} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
