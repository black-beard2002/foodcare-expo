import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  JSX,
} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { useAlert } from '@/providers/AlertProvider';
import { useTheme } from '@/hooks/useTheme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OTPVerificationScreen(): JSX.Element {
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [timer, setTimer] = useState<number>(60);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [hasVerified, setHasVerified] = useState<boolean>(false);
  const { user } = useAuthStore();
  const { phoneNumber } = useLocalSearchParams<{
    phoneNumber: string;
  }>();
  const { verifyOtp, signInWithPhone, isLoading } = useAuthStore();
  const { showAlert } = useAlert();
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const { theme } = useTheme();

  // Timer countdown
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = useCallback(
    (value: string, index: number) => {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 1) {
        const newOtp = [...otp];
        newOtp[index] = numericValue;
        setOtp(newOtp);
        if (numericValue && index < 5) inputRefs.current[index + 1]?.focus();
      }
    },
    [otp]
  );

  const handleKeyPress = useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
      if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  const handlePaste = useCallback((text: string) => {
    const numericText = text.replace(/\D/g, '');
    if (numericText.length >= 6) {
      setOtp(numericText.slice(0, 6).split(''));
      inputRefs.current[5]?.focus();
    }
  }, []);

  const simulateOtpVerification = async (otpCode: string) => {
    const result = await verifyOtp(otpCode, phoneNumber);
    return {
      success: result.success,
      message: result.message,
      attempts: result.attempts,
    };
  };

  const handleAutoVerify = useCallback(async () => {
    if (hasVerified || isLoading) return;

    setHasVerified(true);
    const otpCode = otp.join('');
    try {
      const response = await simulateOtpVerification(otpCode);
      if (response.success) {
        showAlert(
          'Success',
          response.message || 'Phone number verified successfully.',
          'success'
        );
        if (response.attempts && response.attempts > 1) {
          router.push('/');
        } else {
          router.push('/auth/onboarding-step-1');
        }
      } else {
        setHasVerified(false);
        setOtp(['', '', '', '']);
        inputRefs.current[0]?.focus();
        showAlert(
          'Invalid Code',
          'Please enter the correct verification code.',
          'error'
        );
      }
    } catch {
      setHasVerified(false);
      showAlert('Error', 'Something went wrong. Please try again.', 'error');
    }
  }, [otp, hasVerified, isLoading, showAlert]);

  useEffect(() => {
    const otpCode = otp.join('');
    if (otpCode.length === 4 && !isLoading && !hasVerified) handleAutoVerify();
  }, [otp, isLoading, hasVerified, handleAutoVerify]);

  const handleManualVerify = useCallback(() => {
    const otpCode = otp.join('');
    if (otpCode.length === 4 && !hasVerified) handleAutoVerify();
  }, [otp, hasVerified, handleAutoVerify]);

  const simulateResendCode = async () => {
    if (!phoneNumber) return { success: false, message: 'No phone number' };
    const result = await signInWithPhone(phoneNumber);
    return result;
  };

  const handleCodeResend = useCallback(async () => {
    setIsResending(true);
    try {
      const response = await simulateResendCode();
      if (response.success) {
        setOtp(['', '', '', '']);
        setTimer(60);
        setHasVerified(false);
        inputRefs.current[0]?.focus();
        showAlert(
          'Code Sent',
          'A new verification code has been sent to your phone.',
          'success'
        );
        setTimeout(() => {
          showAlert('Code recieved', response.message, 'success');
        }, 1000);
      } else
        showAlert('Error', 'Failed to resend code. Please try again.', 'error');
    } catch {
      showAlert('Error', 'Failed to resend code. Please try again.', 'error');
    } finally {
      setIsResending(false);
    }
  }, [phoneNumber, showAlert, signInWithPhone]);

  const isOtpComplete = useMemo(() => otp.every((d) => d !== ''), [otp]);
  const canResend = useMemo(
    () => timer === 0 && !isResending,
    [timer, isResending]
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        width: '100%',
        paddingTop: 30,
        backgroundColor: theme.background,
        height: '100%',
      }}
    >
      {/* Header */}
      <View className="flex-row items-center px-6 mb-10">
        <TouchableOpacity onPress={() => router.back()} disabled={isLoading}>
          <ArrowLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold ml-4" style={{ color: theme.text }}>
          Verify Phone Number
        </Text>
      </View>

      <KeyboardAvoidingView className="flex-1 px-6 items-center">
        {/* Subtitle */}
        <Image
          source={require('../../assets/images/backgrounds/verify_page_background.png')}
          className="w-72  h-72 mx-auto "
          resizeMode="cover"
        />
        <Text
          className="text-base text-center mb-5 leading-6"
          style={{ color: theme.textSecondary }}
        >
          Enter the 6-digit code sent to your phone number
        </Text>

        {/* OTP Inputs */}
        <View className="flex-row gap-3 mb-6">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              autoFocus={index === 0}
              keyboardType="numeric"
              maxLength={1}
              editable={!isLoading}
              selectTextOnFocus
              textAlign="center"
              onChangeText={(val) =>
                val.length > 1 ? handlePaste(val) : handleOtpChange(val, index)
              }
              onKeyPress={(e) => handleKeyPress(e, index)}
              className={`w-12 h-14 sm:w-14 sm:h-16 rounded-lg border-2 text-xl font-bold ${
                isLoading ? 'opacity-60' : ''
              }`}
              style={{
                backgroundColor: theme.inputBackground,
                color: theme.text,
                borderColor: digit ? theme.primary : theme.border,
              }}
            />
          ))}
        </View>

        {/* Loading Indicator */}
        {isLoading && (
          <View className="flex-row items-center mb-4">
            <ActivityIndicator size="small" color={theme.primary} />
            <Text
              className="text-sm ml-2"
              style={{ color: theme.textSecondary }}
            >
              Verifying...
            </Text>
          </View>
        )}

        {/* Verify Button */}
        <TouchableOpacity
          onPress={handleManualVerify}
          disabled={!isOtpComplete || isLoading}
          className="w-full py-4 rounded-lg mb-6 items-center"
          style={{
            backgroundColor:
              isOtpComplete && !isLoading ? theme.primary : theme.border,
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          <Text
            className="text-base font-medium"
            style={{
              color: isOtpComplete && !isLoading ? '#fff' : theme.textSecondary,
            }}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </Text>
        </TouchableOpacity>

        {/* Resend Button */}
        <TouchableOpacity onPress={handleCodeResend} disabled={!canResend}>
          {isResending ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color={theme.primary} />
              <Text
                className="text-sm text-secondary ml-2"
                style={{ color: theme.textSecondary }}
              >
                Sending...
              </Text>
            </View>
          ) : (
            <Text className="text-sm">
              {timer > 0 ? `Resend code in ${timer}s` : 'Resend code'}
            </Text>
          )}
        </TouchableOpacity>

        <Text
          className="text-xs text-center mt-4 leading-4"
          style={{ color: theme.textSecondary }}
        >
          Didn't receive the code? Check your SMS or try resending.
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
