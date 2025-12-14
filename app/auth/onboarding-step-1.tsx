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
  Image,
} from 'react-native';
import { router } from 'expo-router';
import {
  User,
  Calendar,
  ArrowRight,
  Sparkles,
  Mail,
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '@/stores/authStore';
import { useAlert } from '@/providers/AlertProvider';
import { useTheme } from '@/hooks/useTheme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingStep1() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [focusedField, setFocusedField] = useState<
    'lname' | 'fname' | 'dob' | 'email' | null
  >(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { isLoading, user, setUser,sendWelcomeEmail } = useAuthStore();
  const { showAlert } = useAlert();
  const { theme, isDark } = useTheme();

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validateAge = useCallback((date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    const dayDiff = today.getDate() - date.getDate();
    let actualAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) actualAge--;
    return actualAge >= 13 && actualAge <= 120;
  }, []);

  const validateFields = useCallback(() => {
    const newErrors: { [key: string]: string } = {};

    if (firstName.trim().length < 2)
      newErrors.firstName = 'Please enter at least 2 characters';
    if (lastName.trim().length < 2)
      newErrors.lastName = 'Please enter at least 2 characters';
    if (!email.trim() || !validateEmail(email))
      newErrors.email = 'Please enter a valid email address';
    if (!dateOfBirth || !validateAge(dateOfBirth))
      newErrors.dateOfBirth = 'Enter a valid date (must be 13+ years old)';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [firstName, lastName, email, dateOfBirth, validateEmail, validateAge]);

  const handleContinue = useCallback(async () => {
    if (!validateFields()) {
      showAlert(
        'Invalid Information',
        'Please fix the highlighted fields.',
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

    const year = dateOfBirth?.getFullYear();
    const month =
      dateOfBirth && String(dateOfBirth.getMonth() + 1).padStart(2, '0');
    const day = dateOfBirth && String(dateOfBirth.getDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${day}`;

    setUser({
      ...user,
      first_name: firstName,
      last_name: lastName,
      birthdate: isoDate,
      email_address: email.trim(),
    });

    sendWelcomeEmail(email.trim(), firstName, lastName,"Food For Less","https://foodcare.compugear.store/signin");
    console.log(email.trim());
    
    console.log(firstName);
    console.log(lastName);
    
    router.push('/auth/onboarding-step-2');
  }, [
    validateFields,
    user,
    firstName,
    lastName,
    dateOfBirth,
    setUser,
    showAlert,
  ]);

  const getBorderColor = (field: string, value?: string | Date | null) => {
    if (errors[field]) return '#ef4444'; // red border
    if (focusedField === field) return theme.primary;
    if (value) return isDark ? 'rgba(59,130,246,0.3)' : 'rgba(99,102,241,0.3)';
    return isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: theme.background,
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
          <View className="flex-1 px-6 pb-8">
            {/* Header */}
            <View className="items-center mb-6">
              <Image
                className="w-72 h-72 mx-auto"
                resizeMode="cover"
                style={{
                  shadowColor: theme.primary,
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                }}
                source={require('../../assets/images/backgrounds/user.png')}
              />
              <Text
                className="text-3xl font-bold"
                style={{ color: theme.text }}
              >
                Welcome Aboard
              </Text>
              <Text
                className="text-base text-center opacity-70 mt-2"
                style={{ color: theme.text }}
              >
                Let's personalize your experience
              </Text>
            </View>

            {/* Form */}
            <View className="gap-6 ">
              {/* First & Last Name */}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text style={{ color: theme.text }} className="text-sm mb-2">
                    First Name
                  </Text>
                  <View
                    className="flex-row items-center px-3 py-2 rounded-2xl border-2"
                    style={{
                      borderColor: getBorderColor('fname', firstName),
                      backgroundColor: isDark ? 'rgba(30,41,59,0.5)' : '#fff',
                    }}
                  >
                    <User color={theme.textSecondary} size={20} />
                    <TextInput
                      value={firstName}
                      onChangeText={setFirstName}
                      onFocus={() => setFocusedField('fname')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="First name"
                      placeholderTextColor={theme.inputPlaceholder}
                      style={{
                        color: theme.text,
                        flex: 1,
                        fontSize: 16,
                        marginLeft: 8,
                      }}
                    />
                  </View>
                  {errors.firstName && (
                    <Text
                      style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}
                    >
                      {errors.firstName}
                    </Text>
                  )}
                </View>

                <View className="flex-1">
                  <Text style={{ color: theme.text }} className="text-sm mb-2">
                    Last Name
                  </Text>
                  <View
                    className="flex-row items-center px-3 py-2 rounded-2xl border-2"
                    style={{
                      borderColor: getBorderColor('lname', lastName),
                      backgroundColor: isDark ? 'rgba(30,41,59,0.5)' : '#fff',
                    }}
                  >
                    <User color={theme.textSecondary} size={20} />
                    <TextInput
                      value={lastName}
                      onChangeText={setLastName}
                      onFocus={() => setFocusedField('lname')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Last name"
                      placeholderTextColor={theme.inputPlaceholder}
                      style={{
                        color: theme.text,
                        flex: 1,
                        fontSize: 16,
                        marginLeft: 8,
                      }}
                    />
                  </View>
                  {errors.lastName && (
                    <Text
                      style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}
                    >
                      {errors.lastName}
                    </Text>
                  )}
                </View>
              </View>

              {/* Email */}
              <View>
                <Text style={{ color: theme.text }} className="text-sm mb-2">
                  Email Address
                </Text>
                <View
                  className="flex-row items-center px-3 py-2 rounded-2xl border-2"
                  style={{
                    borderColor: getBorderColor('email', email),
                    backgroundColor: isDark ? 'rgba(30,41,59,0.5)' : '#fff',
                  }}
                >
                  <Mail color={theme.textSecondary} size={20} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="your.email@example.com"
                    placeholderTextColor={theme.inputPlaceholder}
                    style={{
                      color: theme.text,
                      flex: 1,
                      fontSize: 16,
                      marginLeft: 8,
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {errors.email && (
                  <Text
                    style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}
                  >
                    {errors.email}
                  </Text>
                )}
              </View>

              {/* Date of Birth */}
              <View>
                <Text style={{ color: theme.text }} className="text-sm mb-2">
                  Date of Birth
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker((prev) => !prev)}
                  activeOpacity={0.7}
                >
                  <View
                    className="flex-row items-center px-3 py-3 rounded-2xl border-2"
                    style={{
                      borderColor: getBorderColor('dob', dateOfBirth),
                      backgroundColor: isDark ? 'rgba(30,41,59,0.5)' : '#fff',
                    }}
                  >
                    <Calendar color={theme.textSecondary} size={20} />
                    <Text
                      style={{
                        color: dateOfBirth
                          ? theme.text
                          : theme.inputPlaceholder,
                        fontSize: 16,
                        marginLeft: 8,
                      }}
                    >
                      {dateOfBirth
                        ? `${dateOfBirth.getDate()}/${
                            dateOfBirth.getMonth() + 1
                          }/${dateOfBirth.getFullYear()}`
                        : 'DD/MM/YYYY'}
                    </Text>
                  </View>
                </TouchableOpacity>
                {errors.dateOfBirth && (
                  <Text
                    style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}
                  >
                    {errors.dateOfBirth}
                  </Text>
                )}
                {showDatePicker && (
                  <DateTimePicker
                    value={dateOfBirth || new Date(2000, 0, 1)}
                    mode="date"
                    style={{ backgroundColor: theme.text }}
                    display="inline"
                    onChange={(event, selected) => {
                      setShowDatePicker(false);
                      if (selected) setDateOfBirth(selected);
                    }}
                    maximumDate={new Date()}
                  />
                )}
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                onPress={handleContinue}
                disabled={isLoading}
                activeOpacity={0.8}
                style={{ backgroundColor: theme.primary }}
                className="overflow-hidden rounded-2xl shadow-lg mt-8"
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 16,
                    borderRadius: 16,
                  }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Text
                        style={{
                          color: '#fff',
                          fontWeight: 'bold',
                          fontSize: 16,
                          marginRight: 6,
                        }}
                      >
                        Continue
                      </Text>
                      <ArrowRight color="#fff" size={20} />
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
