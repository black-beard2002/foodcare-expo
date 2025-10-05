import React, { useState, useEffect, JSX } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Vibration,
  ColorValue,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Phone, Shield, Check } from 'lucide-react-native';
import { CountryItem, CountryPicker } from 'react-native-country-codes-picker';
import { useAuthStore } from '@/stores/authStore';
import { useAlert } from '@/providers/AlertProvider';
import { useTheme } from '@/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';

export default function PhoneLoginScreen(): JSX.Element {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isValidNumber, setIsValidNumber] = useState<boolean>(false);
  const [show, setShow] = useState<boolean>(false);
  const { signInWithPhone, isLoading } = useAuthStore();
  const { showAlert } = useAlert();
  const { theme, isDark } = useTheme();
  const [country, setCountry] = useState<CountryItem>({
    name: { en: 'Lebanon', ar: 'لبنان' },
    dial_code: '+961',
    code: 'LB',
    flag: '🇱🇧',
  });

  // Validate phone number
  useEffect(() => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    setIsValidNumber(cleanNumber.length >= 7 && cleanNumber.length <= 15);
  }, [phoneNumber]);

  const formatPhoneNumber = (text: string): string => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6)
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    if (cleaned.length <= 10)
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
        6
      )}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
      6,
      10
    )}`;
  };

  const handlePhoneChange = (text: string): void => {
    setPhoneNumber(formatPhoneNumber(text));
  };

  const handleContinue = (): void => {
    if (!isValidNumber || isLoading) {
      Vibration.vibrate(500);
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number', [
        { text: 'OK' },
      ]);
      return;
    }
    handlePhoneSignIn();
  };

  const handlePhoneSignIn = async (): Promise<void> => {
    const fullPhoneNumber = `+${country.code}${phoneNumber.replace(/\s/g, '')}`;
    const result = await signInWithPhone(fullPhoneNumber);
    if (result.success && result.verificationId) {
      router.push({
        pathname: '/auth/otp-verification',
        params: {
          verificationId: result.verificationId,
          phoneNumber: fullPhoneNumber,
        },
      });
    } else {
      showAlert(
        'Error',
        result.error || 'Failed to send verification code',
        'error'
      );
    }
  };

  const gradientColors: [ColorValue, ColorValue] = isDark
    ? ['rgba(15,23,42,1)', 'rgba(33,42,54,1)']
    : ['rgba(250,250,250,1)', 'rgba(226,232,240,1)'];

  const accentGradient: [ColorValue, ColorValue] = isDark
    ? ['rgba(244,208,63,1)', 'rgba(245,158,11,1)']
    : ['rgba(244,208,63,1)', 'rgb(247,177,57)'];

  return (
    <LinearGradient className="flex-1 pt-10" colors={gradientColors}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl justify-center items-center mr-4"
            style={{ backgroundColor: theme.inputBackground }}
          >
            <ArrowLeft color={theme.text} size={20} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold" style={{ color: theme.text }}>
              Phone Verification
            </Text>
            <Text className="text-sm" style={{ color: theme.textSecondary }}>
              We'll send you a verification code
            </Text>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 px-5 pt-5">
          {/* Icon */}
          <LinearGradient
            colors={accentGradient}
            className="w-18 h-18 p-5 rounded-xl items-center justify-center self-center mb-8"
            style={{ borderRadius: 16 }} // Tailwind 'rounded-xl' = 16
          >
            <Phone color={theme.text} size={32} />
          </LinearGradient>

          {/* Description */}
          <Text
            className="text-base text-center leading-6 mb-10 px-5"
            style={{ color: theme.textSecondary }}
          >
            Enter your phone number to receive a verification code for secure
            access
          </Text>

          {/* Phone Input */}
          <View className="mb-6">
            <Text
              className="text-base font-semibold mb-3"
              style={{ color: theme.text }}
            >
              Phone Number
            </Text>

            <View className="flex-row items-center gap-3 mb-2 rounded-xl">
              {/* Country Code */}
              <TouchableOpacity
                onPress={() => setShow(true)}
                activeOpacity={0.7}
                className="flex-row items-center justify-center px-4 min-w-[110px] h-full rounded-xl border"
                style={{
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.border,
                }}
              >
                <Text className="text-lg">{country.flag}</Text>
                <Text
                  className="ml-2 font-semibold text-sm"
                  style={{ color: theme.text }}
                >
                  {country.code} ({country.dial_code})
                </Text>
              </TouchableOpacity>

              {/* Phone Input */}
              <TextInput
                className="flex-1 text-base px-4 py-4 rounded-xl border"
                style={{
                  backgroundColor: theme.inputBackground,
                  color: theme.text,
                  borderColor: isValidNumber ? theme.success : theme.border,
                }}
                placeholder="123 456 789"
                placeholderTextColor={theme.textSecondary}
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={20}
                autoFocus
              />

              {/* Validation Icon */}
              {phoneNumber.length > 0 && (
                <View className="absolute right-4 top-1/2 -translate-y-2.5">
                  {isValidNumber ? (
                    <View
                      className="w-5 h-5 rounded-full items-center justify-center"
                      style={{ backgroundColor: theme.success }}
                    >
                      <Check color="#fff" size={12} />
                    </View>
                  ) : (
                    <View
                      className="w-5 h-5 rounded-full items-center justify-center"
                      style={{ backgroundColor: theme.error }}
                    >
                      <Text className="text-xs font-bold text-white">!</Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Error */}
            {phoneNumber.length > 0 && !isValidNumber && (
              <Text className="text-xs mt-1" style={{ color: theme.error }}>
                Please enter a valid phone number
              </Text>
            )}
          </View>

          {/* Security Notice */}
          <View
            className="flex-row items-center px-4 py-3 rounded-xl mb-8 gap-2"
            style={{ backgroundColor: theme.border }}
          >
            <Shield color={theme.primary} size={16} />
            <Text className="text-sm flex-1" style={{ color: theme.primary }}>
              Your phone number is encrypted and secure
            </Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!isValidNumber || isLoading}
            activeOpacity={0.8}
            className="w-full py-4 rounded-xl items-center mb-6 shadow"
            style={{
              backgroundColor:
                isValidNumber && !isLoading ? theme.primary : theme.border,
              opacity: isLoading ? 0.7 : 1,
              shadowColor: isValidNumber ? theme.primary : 'transparent',
            }}
          >
            <Text
              className="text-base font-semibold"
              style={{
                color:
                  isValidNumber && !isLoading ? '#fff' : theme.textSecondary,
              }}
            >
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </Text>
          </TouchableOpacity>

          {/* Terms */}
          <Text
            className="text-sm text-center leading-5 px-5"
            style={{ color: theme.textSecondary }}
          >
            By continuing, you agree to our{' '}
            <Text
              className="underline font-medium"
              style={{ color: theme.primary }}
            >
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text
              className="underline font-medium"
              style={{ color: theme.primary }}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>

        {/* Country Picker */}
        <CountryPicker
          show={show}
          onBackdropPress={() => setShow(false)}
          style={{
            modal: {
              height: 500,
              backgroundColor: theme.card,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            },
            line: { backgroundColor: theme.border },
            textInput: {
              height: 45,
              backgroundColor: theme.inputBackground,
              borderRadius: 12,
              color: theme.text,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: theme.border,
            },
            countryButtonStyles: {
              height: 60,
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
              paddingHorizontal: 20,
            },
            searchMessageText: { color: theme.textSecondary },
            countryMessageContainer: {
              backgroundColor: theme.inputBackground,
              borderRadius: 8,
              margin: 16,
            },
            flag: { fontSize: 24 },
            dialCode: { color: theme.textSecondary },
            countryName: { color: theme.text },
          }}
          lang="en"
          pickerButtonOnPress={(item) => {
            setCountry(item);
            setShow(false);
          }}
        />
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
