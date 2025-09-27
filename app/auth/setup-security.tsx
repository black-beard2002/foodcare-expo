import React, { useState, useEffect, JSX } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Switch,
  Modal,
  TextInput,
  Vibration,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Lock, Fingerprint, Shield } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAlert } from '@/providers/AlertProvider';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const colorScheme = useColorScheme();
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
  const colors: Record<'light' | 'dark', ColorTheme> = {
    light: {
      background: '#FFFFFF',
      primary: '#22C55E',
      primaryLight: '#16A34A',
      text: '#1A1A1A',
      textSecondary: '#666666',
      card: '#F8F9FA',
      border: '#E5E5EA',
      success: '#10B981',
      error: '#EF4444',
      modalBackground: '#FFFFFF',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    dark: {
      background: '#000000',
      primary: '#22C55E',
      primaryLight: '#16A34A',
      text: '#FFFFFF',
      textSecondary: '#8E8E93',
      card: '#1C1C1E',
      border: '#2C2C2E',
      success: '#10B981',
      error: '#EF4444',
      modalBackground: '#1C1C1E',
      overlay: 'rgba(0, 0, 0, 0.7)',
    },
  };

  const theme: ColorTheme = colors[colorScheme ?? 'light'];

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
        showAlert(
          'Success!',
          `${biometricType} authentication has been set up successfully.`,
          'success'
        );
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
    router.replace('/(tabs)');
  };

  const renderPinInput = (
    currentPin: string,
    isConfirming: boolean
  ): JSX.Element => (
    <View style={styles.pinInputContainer}>
      <TextInput
        style={[
          styles.pinTextInput,
          {
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
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
      <View style={styles.pinDotsContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              {
                backgroundColor:
                  index < currentPin.length ? theme.primary : theme.border,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>
          Setup Security
        </Text>
      </View>

      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${theme.primary}20` },
          ]}
        >
          <Lock color={theme.primary} size={48} />
        </View>

        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Choose how you'd like to secure your app
        </Text>

        <View style={styles.optionsContainer}>
          <View
            style={[
              styles.optionCard,
              {
                backgroundColor: theme.card,
                borderColor: localBiometricEnabled
                  ? theme.primary
                  : theme.border,
                borderWidth: localBiometricEnabled ? 2 : 1,
              },
            ]}
          >
            <View style={styles.optionContent}>
              <Fingerprint color={theme.primary} size={32} />
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: theme.text }]}>
                  {biometricType} Authentication
                </Text>
                <Text
                  style={[
                    styles.optionDescription,
                    { color: theme.textSecondary },
                  ]}
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

          <View
            style={[
              styles.optionCard,
              {
                backgroundColor: theme.card,
                borderColor: localPinEnabled ? theme.primary : theme.border,
                borderWidth: localPinEnabled ? 2 : 1,
              },
            ]}
          >
            <View style={styles.optionContent}>
              <Shield color={theme.primary} size={32} />
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: theme.text }]}>
                  4-Digit PIN Protection
                </Text>
                <Text
                  style={[
                    styles.optionDescription,
                    { color: theme.textSecondary },
                  ]}
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

        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: theme.primary }]}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue to App</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleContinue}>
          <Text style={[styles.skipText, { color: theme.textSecondary }]}>
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
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.modalBackground },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {isConfirmingPin ? 'Confirm Your PIN' : 'Create Your PIN'}
              </Text>
              <Text
                style={[styles.modalSubtitle, { color: theme.textSecondary }]}
              >
                {isConfirmingPin
                  ? 'Enter your PIN again to confirm'
                  : "Enter a 4-digit PIN you'll remember"}
              </Text>
            </View>

            <View style={styles.modalBody}>
              {renderPinInput(
                isConfirmingPin ? confirmPin : pin,
                isConfirmingPin
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  { borderColor: theme.border },
                ]}
                onPress={closePinModal}
              >
                <Text
                  style={[
                    styles.cancelButtonText,
                    { color: theme.textSecondary },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              {isConfirmingPin && (
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.backButton,
                    { backgroundColor: theme.card },
                  ]}
                  onPress={handleBackToFirstPin}
                >
                  <Text style={[styles.backButtonText, { color: theme.text }]}>
                    Back
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
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
  optionsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 40,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    marginLeft: 16,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  continueButton: {
    width: '100%',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  skipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalBody: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  pinInputContainer: {
    alignItems: 'center',
    width: '100%',
  },
  pinTextInput: {
    width: '100%',
    height: 60,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 24,
    letterSpacing: 8,
  },
  pinDotsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },

  backButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});
