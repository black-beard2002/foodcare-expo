import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { User, Calendar } from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { useAlert } from '@/providers/AlertProvider';
import { useTheme } from '@/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';

export default function OnboardingStep1() {
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const { updateProfile, isLoading, user } = useAuthStore();
  const { showAlert } = useAlert();
  const { theme, isDark } = useTheme();

  const formatDate = useCallback((text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;

    if (cleaned.length >= 2) {
      formatted = `${cleaned.slice(0, 2)}`;
      if (cleaned.length >= 4) {
        formatted += `/${cleaned.slice(2, 4)}`;
        if (cleaned.length >= 8) {
          formatted += `/${cleaned.slice(4, 8)}`;
        } else if (cleaned.length > 4) {
          formatted += `/${cleaned.slice(4)}`;
        }
      } else if (cleaned.length > 2) {
        formatted += `/${cleaned.slice(2)}`;
      }
    }

    return formatted;
  }, []);

  const handleDateChange = useCallback(
    (text: string) => {
      const formatted = formatDate(text);
      setDateOfBirth(formatted);
    },
    [formatDate]
  );

  const validateDate = useCallback((date: string): boolean => {
    const parts = date.split('/');
    if (parts.length !== 3) return false;

    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    if (
      day < 1 ||
      day > 31 ||
      month < 1 ||
      month > 12 ||
      year < 1900 ||
      year > new Date().getFullYear()
    )
      return false;

    const dateObj = new Date(year, month - 1, day);
    const age = new Date().getFullYear() - year;

    return age >= 13 && age <= 120;
  }, []);

  const isFormValid = useMemo(
    () => fullName.trim().length >= 2 && dateOfBirth.length === 10 && validateDate(dateOfBirth),
    [fullName, dateOfBirth, validateDate]
  );

  const handleContinue = useCallback(async () => {
    if (!isFormValid) {
      showAlert(
        'Invalid Information',
        'Please enter a valid name and date of birth (DD/MM/YYYY). You must be at least 13 years old.',
        'error'
      );
      return;
    }

    if (!user?.id) {
      showAlert('Error', 'User session not found. Please login again.', 'error');
      return;
    }

    const [day, month, year] = dateOfBirth.split('/');
    const isoDate = `${year}-${month}-${day}`;

    const result = await updateProfile({
      full_name: fullName.trim(),
      date_of_birth: isoDate,
    });

    if (result.success) {
      router.push('/auth/onboarding-step-2');
    } else {
      showAlert('Error', result.error || 'Failed to save information', 'error');
    }
  }, [fullName, dateOfBirth, isFormValid, user, updateProfile, showAlert]);

  const gradientColors = isDark
    ? (['rgba(15,23,42,1)', 'rgba(33,42,54,1)'] as const)
    : (['rgba(250,250,250,1)', 'rgba(226,232,240,1)'] as const);

  const accentGradient = isDark
    ? (['rgba(244,208,63,1)', 'rgba(245,158,11,1)'] as const)
    : (['rgba(244,208,63,1)', 'rgb(247,177,57)'] as const);

  return (
    <LinearGradient colors={gradientColors} className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pt-16 pb-8">
          <View className="items-center mb-8">
            <LinearGradient
              colors={accentGradient}
              style={{ borderRadius: 24 }}
              className="w-24 h-24 justify-center items-center mb-6"
            >
              <User color="#fff" size={56} />
            </LinearGradient>

            <Text className="text-3xl font-bold mb-3 text-center" style={{ color: theme.text }}>
              Let's Get to Know You
            </Text>
            <Text
              className="text-base text-center leading-6 px-4"
              style={{ color: theme.textSecondary }}
            >
              Tell us a bit about yourself so we can personalize your experience
            </Text>

            <View className="flex-row items-center mt-6">
              <View className="w-8 h-1 rounded-full" style={{ backgroundColor: theme.primary }} />
              <View className="w-8 h-1 rounded-full mx-2" style={{ backgroundColor: theme.border }} />
              <View className="w-8 h-1 rounded-full" style={{ backgroundColor: theme.border }} />
            </View>
            <Text className="text-sm mt-2" style={{ color: theme.textSecondary }}>
              Step 1 of 3
            </Text>
          </View>

          <View className="flex-1 justify-center">
            <View className="mb-6">
              <Text className="text-sm font-medium mb-2" style={{ color: theme.text }}>
                Full Name
              </Text>
              <View
                className="flex-row items-center px-4 py-4 rounded-xl border-2"
                style={{
                  backgroundColor: theme.inputBackground,
                  borderColor: fullName ? theme.primary : theme.border,
                }}
              >
                <User color={theme.textSecondary} size={20} />
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  placeholderTextColor={theme.textSecondary}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!isLoading}
                  className="flex-1 ml-3 text-base"
                  style={{ color: theme.text }}
                />
              </View>
            </View>

            <View className="mb-8">
              <Text className="text-sm font-medium mb-2" style={{ color: theme.text }}>
                Date of Birth
              </Text>
              <View
                className="flex-row items-center px-4 py-4 rounded-xl border-2"
                style={{
                  backgroundColor: theme.inputBackground,
                  borderColor: dateOfBirth ? theme.primary : theme.border,
                }}
              >
                <Calendar color={theme.textSecondary} size={20} />
                <TextInput
                  value={dateOfBirth}
                  onChangeText={handleDateChange}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  maxLength={10}
                  editable={!isLoading}
                  className="flex-1 ml-3 text-base"
                  style={{ color: theme.text }}
                />
              </View>
              <Text className="text-xs mt-2 px-1" style={{ color: theme.textSecondary }}>
                You must be at least 13 years old to use this app
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleContinue}
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
                <Text
                  className="text-base font-semibold"
                  style={{
                    color: isFormValid ? '#fff' : theme.textSecondary,
                  }}
                >
                  Continue
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
