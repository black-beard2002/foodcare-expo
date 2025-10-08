import React, { useState, useEffect, JSX } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  Vibration,
  ActivityIndicator,
  ColorValue,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Lock, Fingerprint, Shield } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAlert } from '@/providers/AlertProvider';
import { useTheme } from '@/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';

interface ColorTheme {
  background: string;
  primary: string;
  primaryLight: string;
  text: string;
  textSecondary: string;
  card: string;
  border: string;
  success: string;
  error: string;
  modalBackground: string;
  overlay: string;
}

export default function SetupSecurityScreen(): JSX.Element {
  const { setOnboardingComplete } = useAuthStore();
  const {
    biometricEnabled,
    setUserPin,
    setBiometricEnabled,
    pinEnabled,
    setPinEnabled,
  } = useSettingsStore();

  const [localBiometricEnabled, setLocalBiometricEnabled] =
    useState<boolean>(biometricEnabled);
  const [localPinEnabled, setLocalPinEnabled] = useState<boolean>(pinEnabled);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [isSettingPin, setIsSettingPin] = useState<boolean>(false);
  const [isConfirmingPin, setIsConfirmingPin] = useState<boolean>(false);
  const [biometricAvailable, setBiometricAvailable] = useState<boolean>(false);
  const [biometricType, setBiometricType] = useState<string>('');
  const [isTestingBiometric, setIsTestingBiometric] = useState<boolean>(false);
  const { showAlert } = useAlert();
  const { theme, isDark } = useTheme();

  // Check biometric availability on component mount
  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  // Auto-focus and validation for PIN input
  useEffect(() => {
    if (pin.length === 4 && !isConfirmingPin) {
      setIsConfirmingPin(true);
      // Small delay to allow state update before focusing
      setTimeout(() => {
        // The TextInput will auto-focus when isConfirmingPin changes
      }, 100);
    }
    if (confirmPin.length === 4 && isConfirmingPin) {
      validatePin();
    }
  }, [pin, confirmPin, isConfirmingPin]);

  const checkBiometricAvailability = async (): Promise<void> => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const types =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      setBiometricAvailable(compatible && enrolled);

      /*if (
        types.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
        )
      ) {
        setBiometricType('Face ID');
      }*/ if (
        types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
      ) {
        setBiometricType('Fingerprint');
      } else {
        setBiometricType('Biometric');
      }
    } catch (error) {
      console.error('Biometric check error:', error);
      setBiometricAvailable(false);
    }
  };

  const handleBiometricToggle = async (value: boolean): Promise<void> => {
    if (!value) {
      setLocalBiometricEnabled(false);
      return;
    }

    if (!biometricAvailable) {
      showAlert(
        'Biometric Not Available',
        'Please set up biometric authentication in your device settings first.',
        'warning'
      );
      return;
    }

    // Test biometric authentication
    setIsTestingBiometric(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Set up ${biometricType} authentication`,
        // subtitle: 'Place your finger on the sensor or look at the camera',
        fallbackLabel: 'Use PIN instead',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        setLocalBiometricEnabled(true);
      } else if (result.error === 'user_cancel') {
        // User cancelled, don't show error
      } else {
        showAlert('Authentication Failed', 'Please try again.', 'error');
      }
    } catch (error) {
      showAlert(
        'Error',
        'Something went wrong with biometric authentication.',
        'error'
      );
    } finally {
      setIsTestingBiometric(false);
    }
  };

  const handlePinToggle = (value: boolean): void => {
    if (!value) {
      setLocalPinEnabled(false);
      return;
    }

    setShowPinModal(true);
    setIsSettingPin(true);
  };

  const validatePin = (): void => {
    if (pin === confirmPin) {
      setUserPin(pin);
      setLocalPinEnabled(true);
      closePinModal();
      showAlert(
        'Success!',
        'Your 4-digit PIN has been set successfully.',
        'success'
      );
    } else {
      Vibration.vibrate(500);
      showAlert(
        'PIN Mismatch',
        'The PINs you entered do not match. Please try again.',
        'warning'
      );
      resetPinInputs();
    }
  };

  const resetPinInputs = (): void => {
    setPin('');
    setConfirmPin('');
    setIsConfirmingPin(false);
  };

  const handleBackToFirstPin = (): void => {
    setConfirmPin('');
    setIsConfirmingPin(false);
  };

  const closePinModal = (): void => {
    setShowPinModal(false);
    setIsSettingPin(false);
    resetPinInputs();
  };

  const handlePinInput = (value: string): void => {
    const numericValue = value.replace(/[^0-9]/g, '');

    if (isConfirmingPin) {
      if (numericValue.length <= 4) {
        setConfirmPin(numericValue);
      }
    } else {
      if (numericValue.length <= 4) {
        setPin(numericValue);
      }
    }
  };

  const handleContinue = (): void => {
    setBiometricEnabled(localBiometricEnabled);
    setPinEnabled(localPinEnabled);
    setOnboardingComplete(true);
    router.replace('/auth/onboarding-step-3');
  };

  const renderPinInput = (
    currentPin: string,
    isConfirming: boolean
  ): JSX.Element => (
    <View className="items-center w-full">
      <TextInput
        className="w-full h-15 border-2 rounded-xl px-5 font-inter-bold mb-6 text-center tracking-widest"
        style={{
          color: theme.text,
          borderColor: theme.border,
        }}
        value={currentPin}
        onChangeText={handlePinInput}
        keyboardType="numeric"
        maxLength={4}
        autoFocus={!isConfirming}
        placeholder="Enter 4-digit PIN"
        placeholderTextColor={theme.textSecondary}
        textAlign="center"
        secureTextEntry
      />
      <View className="flex-row gap-4">
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            className="w-4 h-4 rounded-full"
            style={{
              backgroundColor:
                index < currentPin.length ? theme.primary : theme.border,
            }}
          />
        ))}
      </View>
    </View>
  );

  const gradientColors: [ColorValue, ColorValue] = isDark
    ? ['rgba(15, 23, 42, 1)', 'rgba(33, 42, 54,1)']
    : ['rgba(250, 250, 250, 1)', 'rgba(226, 232, 240, 1)'];

  const accentGradient: [ColorValue, ColorValue] = isDark
    ? ['rgba(244, 208, 63, 1)', 'rgba(245, 158, 11, 1)']
    : ['rgba(244, 208, 63, 1)', 'rgb(247, 177, 57)'];

  return (
    <LinearGradient colors={gradientColors} className="flex-1 pt-12 md:pt-16">
      {/* Header */}
      <View className="flex-row items-center px-6 mb-10 md:px-8 md:mb-12">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <Text
          className="text-2xl font-inter-bold"
          style={{ color: theme.text }}
        >
          Setup Security
        </Text>
      </View>

      {/* Content */}
      <View className="flex-1 px-6 items-center md:px-8">
        <LinearGradient
          colors={accentGradient}
          style={{ borderRadius: 16 }}
          className="w-20 h-20 justify-center items-center mb-8 md:w-24 md:h-24"
        >
          <Lock color={theme.text} size={45} />
        </LinearGradient>

        <Text
          className="text-base font-inter-regular text-center leading-6 mb-10 md:text-lg md:mb-12"
          style={{ color: theme.textSecondary }}
        >
          Choose how you'd like to secure your app
        </Text>

        {/* Options Container */}
        <View className="w-full gap-4 mb-10 max-w-md md:gap-6 md:mb-12">
          {/* Biometric Option */}
          <View
            className="flex-row items-center justify-between p-5 rounded-2xl border md:p-6"
            style={{
              backgroundColor: theme.card,
              borderColor: localBiometricEnabled ? theme.primary : theme.border,
              borderWidth: localBiometricEnabled ? 2 : 1,
            }}
          >
            <View className="flex-row items-center flex-1">
              <Fingerprint color={theme.primary} size={32} />
              <View className="ml-4 flex-1">
                <Text
                  className="text-base font-inter-medium mb-1 md:text-lg"
                  style={{ color: theme.text }}
                >
                  {biometricType} Authentication
                </Text>
                <Text
                  className="text-sm font-inter-regular leading-5 md:text-base"
                  style={{ color: theme.textSecondary }}
                >
                  {biometricAvailable
                    ? `Use ${biometricType.toLowerCase()} to unlock the app quickly and securely`
                    : 'Not available on this device'}
                </Text>
              </View>
            </View>
            {isTestingBiometric ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <Switch
                value={localBiometricEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#FFFFFF"
                disabled={!biometricAvailable}
              />
            )}
          </View>

          {/* PIN Option */}
          <View
            className="flex-row items-center justify-between p-5 rounded-2xl border md:p-6"
            style={{
              backgroundColor: theme.card,
              borderColor: localPinEnabled ? theme.primary : theme.border,
              borderWidth: localPinEnabled ? 2 : 1,
            }}
          >
            <View className="flex-row items-center flex-1">
              <Shield color={theme.primary} size={32} />
              <View className="ml-4 flex-1">
                <Text
                  className="text-base font-inter-medium mb-1 md:text-lg"
                  style={{ color: theme.text }}
                >
                  4-Digit PIN Protection
                </Text>
                <Text
                  className="text-sm font-inter-regular leading-5 md:text-base"
                  style={{ color: theme.textSecondary }}
                >
                  Set up a secure 4-digit PIN as a backup or primary security
                  method
                </Text>
              </View>
            </View>
            <Switch
              value={localPinEnabled}
              onValueChange={handlePinToggle}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          className="w-full p-4 rounded-xl items-center mb-4 max-w-md md:p-5"
          style={{ backgroundColor: theme.primary }}
          onPress={handleContinue}
        >
          <Text className="text-white text-base font-inter-medium md:text-lg">
            Continue to App
          </Text>
        </TouchableOpacity>

        {/* Skip Option */}
        <TouchableOpacity onPress={handleContinue}>
          <Text
            className="text-sm font-inter-medium md:text-base"
            style={{ color: theme.textSecondary }}
          >
            Skip for now
          </Text>
        </TouchableOpacity>
      </View>

      {/* PIN Setup Modal */}
      <Modal
        visible={showPinModal}
        transparent
        animationType="fade"
        onRequestClose={closePinModal}
      >
        <View
          className="flex-1 justify-start pt-48 items-center md:pt-56"
          style={{ backgroundColor: theme.overlay }}
        >
          <View
            className="w-11/12 rounded-2xl p-6 items-center max-w-sm md:w-2/3 md:p-8 lg:max-w-md"
            style={{ backgroundColor: theme.card }}
          >
            {/* Modal Header */}
            <View className="items-center mb-8">
              <Text
                className="text-xl font-inter-bold mb-2 md:text-2xl"
                style={{ color: theme.text }}
              >
                {isConfirmingPin ? 'Confirm Your PIN' : 'Create Your PIN'}
              </Text>
              <Text
                className="text-sm font-inter-regular text-center leading-5 md:text-base"
                style={{ color: theme.textSecondary }}
              >
                {isConfirmingPin
                  ? 'Enter your PIN again to confirm'
                  : "Enter a 4-digit PIN you'll remember"}
              </Text>
            </View>

            {/* Modal Body */}
            <View className="items-center mb-8 w-full">
              {renderPinInput(
                isConfirmingPin ? confirmPin : pin,
                isConfirmingPin
              )}
            </View>

            {/* Modal Footer */}
            <View className="flex-row gap-3 w-full">
              <TouchableOpacity
                className="flex-1 p-3 rounded-lg border items-center"
                style={{ borderColor: theme.border }}
                onPress={closePinModal}
              >
                <Text
                  className="text-sm font-inter-medium md:text-base"
                  style={{ color: theme.textSecondary }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              {isConfirmingPin && (
                <TouchableOpacity
                  className="flex-1 p-3 rounded-lg items-center"
                  style={{ backgroundColor: theme.card }}
                  onPress={handleBackToFirstPin}
                >
                  <Text
                    className="text-sm font-inter-medium md:text-base"
                    style={{ color: theme.text }}
                  >
                    Back
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}
