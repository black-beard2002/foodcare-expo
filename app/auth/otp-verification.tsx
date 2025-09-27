import React, { useState, useEffect, useRef, JSX } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Alert,
  ActivityIndicator,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Shield } from 'lucide-react-native';

interface ColorTheme {
  background: string;
  primary: string;
  primaryLight: string;
  text: string;
  textSecondary: string;
  inputBackground: string;
  border: string;
  success: string;
  error: string;
}

export default function OTPVerificationScreen(): JSX.Element {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState<number>(60);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const colorScheme = useColorScheme();
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const colors: Record<'light' | 'dark', ColorTheme> = {
    light: {
      background: '#FFFFFF',
      primary: '#22C55E', // Nice green color
      primaryLight: '#16A34A',
      text: '#1A1A1A',
      textSecondary: '#666666',
      inputBackground: '#F5F5F5',
      border: '#E5E5EA',
      success: '#10B981',
      error: '#EF4444',
    },
    dark: {
      background: '#000000',
      primary: '#22C55E', // Same green for consistency
      primaryLight: '#16A34A',
      text: '#FFFFFF',
      textSecondary: '#8E8E93',
      inputBackground: '#1C1C1E',
      border: '#2C2C2E',
      success: '#10B981',
      error: '#EF4444',
    },
  };

  const theme: ColorTheme = colors[colorScheme ?? 'light'];

  // Timer countdown effect
  useEffect(() => {
    let interval: number;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  // Auto-verify when OTP is complete
  useEffect(() => {
    const otpCode = otp.join('');
    if (otpCode.length === 6 && !isLoading) {
      handleAutoVerify();
    }
  }, [otp, isLoading]);

  const handleOtpChange = (value: string, index: number): void => {
    // Only allow numeric input
    const numericValue = value.replace(/[^0-9]/g, '');

    if (numericValue.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = numericValue;
      setOtp(newOtp);

      // Auto-focus next input
      if (numericValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ): void => {
    // Handle backspace to move to previous input
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (text: string, index: number): void => {
    // Handle paste operation for the entire OTP
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length >= 6) {
      const newOtp = numericText.slice(0, 6).split('');
      setOtp(newOtp);
      // Focus the last input
      inputRefs.current[5]?.focus();
    }
  };

  const simulateOtpVerification = async (otpCode: string): Promise<boolean> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // For demo purposes, accept any 6-digit code
        // In real app, this would be an API call
        resolve(otpCode.length === 6);
      }, 1000);
    });
  };

  const handleAutoVerify = async (): Promise<void> => {
    const otpCode = otp.join('');
    setIsLoading(true);

    try {
      const isValid = await simulateOtpVerification(otpCode);

      if (isValid) {
        // Success feedback could be added here (like a checkmark animation)
        setTimeout(() => {
          router.push('/auth/setup-security');
        }, 500);
      } else {
        // Invalid OTP
        setIsLoading(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        Alert.alert(
          'Invalid Code',
          'Please enter the correct verification code.'
        );
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleManualVerify = (): void => {
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      handleAutoVerify();
    }
  };

  const simulateResendCode = async (): Promise<boolean> => {
    // Simulate API call to resend code
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 2000);
    });
  };

  const handleCodeResend = async (): Promise<void> => {
    setIsResending(true);

    try {
      await simulateResendCode();

      // Reset OTP and timer
      setOtp(['', '', '', '', '', '']);
      setTimer(60);
      inputRefs.current[0]?.focus();

      Alert.alert(
        'Code Sent',
        'A new verification code has been sent to your phone.'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const isOtpComplete: boolean = otp.every((digit) => digit !== '');
  const canResend: boolean = timer === 0 && !isResending;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          disabled={isLoading}
        >
          <ArrowLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>
          Verify Phone Number
        </Text>
      </View>

      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${theme.primary}20` },
          ]}
        >
          <Shield color={theme.primary} size={48} />
        </View>

        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Enter the 6-digit code sent to your phone number
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              autoFocus={index === 0}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.otpInput,
                {
                  backgroundColor: theme.inputBackground,
                  color: theme.text,
                  borderColor: digit ? theme.primary : theme.border,
                },
                isLoading && styles.otpInputDisabled,
              ]}
              value={digit}
              onChangeText={(value) => {
                // Handle paste operation for the entire OTP
                if (value.length > 1) {
                  handlePaste(value, index);
                } else {
                  handleOtpChange(value, index);
                }
              }}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              editable={!isLoading}
              selectTextOnFocus
            />
          ))}
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Verifying...
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.verifyButton,
            {
              backgroundColor:
                isOtpComplete && !isLoading ? theme.primary : theme.border,
              opacity: isLoading ? 0.6 : 1,
            },
          ]}
          onPress={handleManualVerify}
          disabled={!isOtpComplete || isLoading}
        >
          <Text
            style={[
              styles.verifyButtonText,
              {
                color:
                  isOtpComplete && !isLoading ? '#FFFFFF' : theme.textSecondary,
              },
            ]}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={!canResend}
          onPress={handleCodeResend}
          style={styles.resendButton}
        >
          {isResending ? (
            <View style={styles.resendLoadingContainer}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text
                style={[
                  styles.resendText,
                  { color: theme.textSecondary, marginLeft: 8 },
                ]}
              >
                Sending...
              </Text>
            </View>
          ) : (
            <Text
              style={[
                styles.resendText,
                { color: canResend ? theme.primary : theme.textSecondary },
              ]}
            >
              {timer > 0 ? `Resend code in ${timer}s` : 'Resend code'}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={[styles.helpText, { color: theme.textSecondary }]}>
          Didn't receive the code? Check your SMS or try resending.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  otpContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  otpInputDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
  },
  verifyButton: {
    width: '100%',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  verifyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  resendButton: {
    marginBottom: 16,
  },
  resendLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  helpText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 18,
  },
});
