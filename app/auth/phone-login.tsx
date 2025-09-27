import React, { useState, useEffect, JSX } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Vibration,
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  ChevronDown,
  Phone,
  Shield,
  Check,
} from 'lucide-react-native';
import { CountryPicker } from 'react-native-country-codes-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Country {
  code: string;
  flag: string;
  name?: string;
}

interface ColorTheme {
  background: string;
  primary: string;
  primaryLight: string;
  secondary: string;
  text: string;
  textSecondary: string;
  inputBackground: string;
  border: string;
  cardBackground: string;
  success: string;
  error: string;
  warning: string;
}

export default function PhoneLoginScreen(): JSX.Element {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isValidNumber, setIsValidNumber] = useState<boolean>(false);
  const [show, setShow] = useState<boolean>(false);
  const [country, setCountry] = useState<Country>({
    code: '961',
    flag: '🇱🇧',
    name: 'Lebanon',
  });

  const colorScheme = useColorScheme();

  const colors: Record<'light' | 'dark', ColorTheme> = {
    light: {
      background: '#FFFFFF',
      primary: '#22C55E',
      primaryLight: '#DCFCE7',
      secondary: '#16A34A',
      text: '#1F2937',
      textSecondary: '#6B7280',
      inputBackground: '#F9FAFB',
      border: '#E5E7EB',
      cardBackground: '#FFFFFF',
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
    },
    dark: {
      background: '#101114ff',
      primary: '#22C55E',
      primaryLight: '#052E16',
      secondary: '#16A34A',
      text: '#F8FAFC',
      textSecondary: '#94A3B8',
      inputBackground: '#121316ff',
      border: '#262626ff',
      cardBackground: '#1E293B',
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
    },
  };

  const theme: ColorTheme = colors[colorScheme ?? 'light'];

  // Validate phone number format
  useEffect(() => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    setIsValidNumber(cleanNumber.length >= 7 && cleanNumber.length <= 15);
  }, [phoneNumber]);

  const formatPhoneNumber = (text: string): string => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');

    // Format based on length
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    } else if (cleaned.length <= 10) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
        6
      )}`;
    } else {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
        6,
        10
      )}`;
    }
  };

  const handlePhoneChange = (text: string): void => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const cleanNumber = phone.replace(/\D/g, '');
    return cleanNumber.length >= 7 && cleanNumber.length <= 15;
  };

  const handleContinue = (): void => {
    if (!isValidNumber) {
      Vibration.vibrate(500);
      Alert.alert(
        'Invalid Phone Number',
        'Please enter a valid phone number with country code.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Here you would typically make an API call to send OTP
    router.push('/auth/otp-verification');
  };

  const handleCountrySelect = (item: any): void => {
    setCountry({
      code: item.dial_code,
      flag: item.flag,
      name: item.name,
    });
    setShow(false);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.backButton,
              { backgroundColor: theme.inputBackground },
            ]}
          >
            <ArrowLeft color={theme.text} size={20} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.title, { color: theme.text }]}>
              Phone Verification
            </Text>
            <Text
              style={[styles.headerSubtitle, { color: theme.textSecondary }]}
            >
              We'll send you a verification code
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Icon Container */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${theme.primary}15` },
            ]}
          >
            <Phone color={theme.primary} size={32} />
          </View>

          {/* Main Description */}
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Enter your phone number to receive a verification code for secure
            access
          </Text>

          {/* Phone Input Section */}
          <View style={styles.phoneSection}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Phone Number
            </Text>

            <View
              style={[styles.inputContainer, { borderColor: theme.border }]}
            >
              {/* Country Code Picker */}
              <TouchableOpacity
                onPress={() => setShow(true)}
                style={[
                  styles.countryPicker,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.flagEmoji}>{country.flag}</Text>
                <Text style={[styles.countryCode, { color: theme.text }]}>
                  {country.code}
                </Text>
              </TouchableOpacity>

              {/* Phone Number Input */}
              <TextInput
                style={[
                  styles.phoneInput,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: isValidNumber ? theme.success : theme.border,
                  },
                ]}
                placeholder="123 456 789"
                placeholderTextColor={theme.textSecondary}
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={20}
                autoFocus={true}
              />

              {/* Validation Icon */}
              {phoneNumber.length > 0 && (
                <View style={styles.validationContainer}>
                  {isValidNumber ? (
                    <View
                      style={[
                        styles.validationIcon,
                        { backgroundColor: theme.success },
                      ]}
                    >
                      <Check color="#FFFFFF" size={12} />
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.validationIcon,
                        { backgroundColor: theme.error },
                      ]}
                    >
                      <Text style={styles.errorIcon}>!</Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Validation Message */}
            {phoneNumber.length > 0 && !isValidNumber && (
              <Text style={[styles.errorText, { color: theme.error }]}>
                Please enter a valid phone number
              </Text>
            )}
          </View>

          {/* Security Notice */}
          <View
            style={[
              styles.securityNotice,
              { backgroundColor: theme.primaryLight },
            ]}
          >
            <Shield color={theme.primary} size={16} />
            <Text style={[styles.securityText, { color: theme.primary }]}>
              Your phone number is encrypted and secure
            </Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              {
                backgroundColor: isValidNumber ? theme.primary : theme.border,
                shadowColor: isValidNumber ? theme.primary : 'transparent',
              },
            ]}
            onPress={handleContinue}
            disabled={!isValidNumber}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.continueButtonText,
                {
                  color: isValidNumber ? '#FFFFFF' : theme.textSecondary,
                },
              ]}
            >
              Send Verification Code
            </Text>
          </TouchableOpacity>

          {/* Terms */}
          <Text style={[styles.terms, { color: theme.textSecondary }]}>
            By continuing, you agree to our{' '}
            <Text style={[styles.termsLink, { color: theme.primary }]}>
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text style={[styles.termsLink, { color: theme.primary }]}>
              Privacy Policy
            </Text>
          </Text>
        </View>

        {/* Country Picker Modal */}
        <CountryPicker
          show={show}
          onBackdropPress={() => setShow(false)}
          style={{
            modal: {
              height: 500,
              backgroundColor: theme.cardBackground,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            },
            line: {
              backgroundColor: theme.border,
            },
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
              backgroundColor: 'transparent',
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
              paddingHorizontal: 20,
            },
            searchMessageText: {
              color: theme.textSecondary,
            },
            countryMessageContainer: {
              backgroundColor: theme.inputBackground,
              borderRadius: 8,
              margin: 16,
            },
            flag: {
              fontSize: 24,
            },
            dialCode: {
              color: theme.textSecondary,
              fontFamily: 'Inter-Medium',
            },
            countryName: {
              color: theme.text,
              fontFamily: 'Inter-Regular',
            },
          }}
          lang="en"
          pickerButtonOnPress={handleCountrySelect}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  phoneSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: '100%',
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    minWidth: 110,
  },
  flagEmoji: {
    fontSize: 20,
  },
  countryCode: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  validationContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  validationIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 32,
    gap: 8,
  },
  securityText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  continueButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  terms: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  termsLink: {
    fontFamily: 'Inter-Medium',
    textDecorationLine: 'underline',
  },
});
