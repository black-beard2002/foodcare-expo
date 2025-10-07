import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  ColorValue,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { User, Calendar, ArrowRight, Sparkles } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '@/stores/authStore';
import { useAlert } from '@/providers/AlertProvider';
import { useTheme } from '@/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';

export default function OnboardingStep1() {
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [focusedField, setFocusedField] = useState<'name' | 'dob' | null>(null);
  const { updateProfile, isLoading, user } = useAuthStore();
  const { showAlert } = useAlert();
  const { theme, isDark } = useTheme();

  const formatDisplayDate = useCallback((date: Date | null): string => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }, []);

  const handleDateChange = useCallback((event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  }, []);

  const validateAge = useCallback((date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    const dayDiff = today.getDate() - date.getDate();

    let actualAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      actualAge--;
    }

    return actualAge >= 13 && actualAge <= 120;
  }, []);

  const maxDate = useMemo(() => new Date(), []);
  const minDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 120);
    return date;
  }, []);
  const defaultDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date;
  }, []);

  const isFormValid = useMemo(
    () =>
      fullName.trim().length >= 2 &&
      dateOfBirth !== null &&
      validateAge(dateOfBirth),
    [fullName, dateOfBirth, validateAge]
  );

  const handleContinue = useCallback(async () => {
    if (!isFormValid || !dateOfBirth) {
      showAlert(
        'Invalid Information',
        'Please enter a valid name and date of birth. You must be at least 13 years old.',
        'error'
      );
      return;
    }

    if (!user?.id) {
      showAlert(
        'Error',
        'User session not found. Please login again.',
        'error'
      );
      return;
    }

    const year = dateOfBirth.getFullYear();
    const month = String(dateOfBirth.getMonth() + 1).padStart(2, '0');
    const day = String(dateOfBirth.getDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${day}`;

    const result = await updateProfile({
      full_name: fullName.trim(),
      date_of_birth: isoDate,
    });

    if (result.success) router.push('/auth/onboarding-step-2');
    else
      showAlert('Error', result.error || 'Failed to save information', 'error');
  }, [fullName, dateOfBirth, isFormValid, user, updateProfile, showAlert]);

  const gradientColors: [ColorValue, ColorValue, ColorValue] = isDark
    ? ['rgba(15,23,42,1)', 'rgba(30,41,59,1)', 'rgba(15,23,42,1)']
    : ['rgba(255,255,255,1)', 'rgba(248,250,252,1)', 'rgba(241,245,249,1)'];

  const accentGradient: [ColorValue, ColorValue] = isDark
    ? ['rgba(59,130,246,1)', 'rgba(147,51,234,1)']
    : ['rgba(99,102,241,1)', 'rgba(139,92,246,1)'];

  return (
    <LinearGradient
      colors={gradientColors}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        paddingTop: 30,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-20 pb-8">
            {/* Header Section */}
            <View className="items-center mb-12">
              <View className="relative mb-6">
                <LinearGradient
                  colors={accentGradient}
                  style={{
                    borderRadius: 32,
                    width: 80,
                    height: 80,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Sparkles color="#fff" size={40} strokeWidth={2.5} />
                </LinearGradient>
                <View
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full items-center justify-center"
                  style={{ backgroundColor: isDark ? '#10b981' : '#22c55e' }}
                >
                  <View className="w-2 h-2 rounded-full bg-white" />
                </View>
              </View>

              <Text
                className="text-4xl font-bold mb-3 text-center"
                style={{ color: theme.text, letterSpacing: -0.5 }}
              >
                Welcome Aboard
              </Text>
              <Text
                className="text-base text-center leading-6 px-8 opacity-70"
                style={{ color: theme.text }}
              >
                Let's personalize your experience with a few quick details
              </Text>

              {/* Progress Indicator */}
              <View className="flex-row items-center mt-8 gap-2">
                <View
                  className="h-1.5 rounded-full"
                  style={{
                    width: 32,
                    backgroundColor: theme.primary,
                  }}
                />
                <View
                  className="h-1.5 rounded-full"
                  style={{
                    width: 16,
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.2)'
                      : 'rgba(0,0,0,0.1)',
                  }}
                />
                <View
                  className="h-1.5 rounded-full"
                  style={{
                    width: 16,
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.2)'
                      : 'rgba(0,0,0,0.1)',
                  }}
                />
              </View>
              <Text
                className="text-xs mt-3 font-medium tracking-wider opacity-60"
                style={{ color: theme.text }}
              >
                STEP 1 OF 3
              </Text>
            </View>

            {/* Form Section */}
            <View className="flex-1 justify-center space-y-5">
              {/* Full Name Input */}
              <View className="mb-5">
                <Text
                  className="text-sm font-semibold mb-3 tracking-wide"
                  style={{ color: theme.text }}
                >
                  FULL NAME
                </Text>
                <View
                  className="flex-row items-center px-5 py-4 rounded-2xl border-2 shadow-sm"
                  style={{
                    backgroundColor: isDark ? 'rgba(30,41,59,0.5)' : '#ffffff',
                    borderColor:
                      focusedField === 'name'
                        ? theme.primary
                        : fullName
                        ? isDark
                          ? 'rgba(59,130,246,0.3)'
                          : 'rgba(99,102,241,0.3)'
                        : isDark
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(0,0,0,0.05)',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                  }}
                >
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(59,130,246,0.15)'
                        : 'rgba(99,102,241,0.1)',
                    }}
                  >
                    <User color={theme.primary} size={20} strokeWidth={2.5} />
                  </View>
                  <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="John Doe"
                    placeholderTextColor={
                      isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
                    }
                    autoCapitalize="words"
                    autoCorrect={false}
                    editable={!isLoading}
                    className="flex-1 text-base font-medium"
                    style={{ color: theme.text }}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Date of Birth Input */}
              <View className="mb-8">
                <Text
                  className="text-sm font-semibold mb-3 tracking-wide"
                  style={{ color: theme.text }}
                >
                  DATE OF BIRTH
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <View
                    className="flex-row items-center px-5 py-4 rounded-2xl border-2 shadow-sm"
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(30,41,59,0.5)'
                        : '#ffffff',
                      borderColor: showDatePicker
                        ? theme.primary
                        : dateOfBirth
                        ? isDark
                          ? 'rgba(59,130,246,0.3)'
                          : 'rgba(99,102,241,0.3)'
                        : isDark
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(0,0,0,0.05)',
                      shadowColor: showDatePicker
                        ? theme.primary
                        : 'transparent',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                    }}
                  >
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                      style={{
                        backgroundColor: isDark
                          ? 'rgba(59,130,246,0.15)'
                          : 'rgba(99,102,241,0.1)',
                      }}
                    >
                      <Calendar
                        color={theme.primary}
                        size={20}
                        strokeWidth={2.5}
                      />
                    </View>
                    <Text
                      className="flex-1 text-base font-medium"
                      style={{
                        color: dateOfBirth
                          ? theme.text
                          : isDark
                          ? 'rgba(255,255,255,0.3)'
                          : 'rgba(0,0,0,0.3)',
                      }}
                    >
                      {dateOfBirth
                        ? formatDisplayDate(dateOfBirth)
                        : 'DD/MM/YYYY'}
                    </Text>
                  </View>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={dateOfBirth || defaultDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={maxDate}
                    minimumDate={minDate}
                    textColor={theme.text}
                  />
                )}
                <View
                  className="flex-row items-center mt-3 px-2"
                  style={{ opacity: 0.6 }}
                >
                  <View
                    className="w-1 h-1 rounded-full mr-2"
                    style={{ backgroundColor: theme.text }}
                  />
                  <Text className="text-xs" style={{ color: theme.text }}>
                    Must be at least 13 years old
                  </Text>
                </View>
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                onPress={handleContinue}
                disabled={!isFormValid || isLoading}
                activeOpacity={0.8}
                className="overflow-hidden rounded-2xl shadow-lg"
                style={{
                  shadowColor: isFormValid ? theme.primaryLight : 'transparent',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                }}
              >
                <LinearGradient
                  colors={
                    isFormValid && !isLoading
                      ? accentGradient
                      : [
                          isDark ? 'rgba(71,85,105,1)' : 'rgba(203,213,225,1)',
                          isDark ? 'rgba(51,65,85,1)' : 'rgba(226,232,240,1)',
                        ]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 24,
                    paddingVertical: 16,
                    gap: 12,
                    borderRadius: 16,
                  }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <View className="flex-row items-center">
                      <Text
                        className="text-base font-bold tracking-wide mr-2"
                        style={{
                          color: isFormValid
                            ? '#fff'
                            : isDark
                            ? 'rgba(255,255,255,0.4)'
                            : 'rgba(0,0,0,0.3)',
                        }}
                      >
                        Continue
                      </Text>
                      <ArrowRight
                        color={
                          isFormValid
                            ? '#fff'
                            : isDark
                            ? 'rgba(255,255,255,0.4)'
                            : 'rgba(0,0,0,0.3)'
                        }
                        size={20}
                        strokeWidth={2.5}
                      />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
