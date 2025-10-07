import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  TextInput,
  Vibration,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import {
  User,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Palette,
  Tag,
  Gift,
  Wallet,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTheme } from '@/hooks/useTheme';
import { useAlert } from '@/providers/AlertProvider';
import { LinearGradient } from 'expo-linear-gradient';

export default function SettingScreen() {
  const { theme, isDark } = useTheme();
  const { user, signOut } = useAuthStore();
  const {
    biometricEnabled,
    setBiometricEnabled,
    pinEnabled,
    setPinEnabled,
    setUserPin,
    userPin,
  } = useSettingsStore();
  const { showAlert } = useAlert();

  const [localBiometricEnabled, setLocalBiometricEnabled] =
    useState<boolean>(biometricEnabled);
  const [localPinEnabled, setLocalPinEnabled] = useState<boolean>(pinEnabled);
  const [biometricAvailable, setBiometricAvailable] = useState<boolean>(false);
  const [biometricType, setBiometricType] = useState<string>('Biometric');
  const [isTestingBiometric, setIsTestingBiometric] = useState<boolean>(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<
    'biometric' | 'pin' | null
  >(null);
  const [authPin, setAuthPin] = useState('');
  const [authError, setAuthError] = useState('');

  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfirmingPin, setIsConfirmingPin] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  useEffect(() => {
    if (pin.length === 4 && !isConfirmingPin) {
      setIsConfirmingPin(true);
    }
    if (confirmPin.length === 4 && isConfirmingPin) {
      validatePin();
    }
  }, [pin, confirmPin, isConfirmingPin]);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const types =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      setBiometricAvailable(compatible && enrolled);
      if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('Fingerprint');
      } else {
        setBiometricType('Biometric');
      }
    } catch (error) {
      console.error('Biometric check error:', error);
      setBiometricAvailable(false);
    }
  };

  const authenticateBeforeDisable = async (type: 'biometric' | 'pin') => {
    if (type === 'biometric') {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to disable biometric',
          fallbackLabel: 'Use PIN instead',
          cancelLabel: 'Cancel',
        });
        return result.success;
      } catch (error) {
        return false;
      }
    } else if (type === 'pin') {
      setPendingToggle(type);
      setAuthModalVisible(true);
      return false;
    }
    return false;
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (!value) {
      const authenticated = await authenticateBeforeDisable('biometric');
      if (!authenticated) return;
    } else {
      if (!biometricAvailable) {
        showAlert(
          'Biometric Not Available',
          'Please set up biometric authentication first.',
          'warning'
        );
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Set up biometric authentication',
        cancelLabel: 'Cancel',
      });
      if (!result.success) return;
    }

    setLocalBiometricEnabled(value);
  };

  const handlePinToggle = async (value: boolean) => {
    if (!value) {
      const authenticated = await authenticateBeforeDisable('pin');
      if (!authenticated) return;
    } else {
      setShowPinModal(true);
    }
  };

  const validatePin = () => {
    if (pin === confirmPin) {
      setUserPin(pin);
      setLocalPinEnabled(true);
      setPinEnabled(true);
      closePinModal();
      showAlert('Success', 'Your 4-digit PIN has been set.', 'success');
    } else {
      Vibration.vibrate(500);
      showAlert(
        'PIN Mismatch',
        'The PINs you entered do not match.',
        'warning'
      );
      resetPinInputs();
    }
  };

  const resetPinInputs = () => {
    setPin('');
    setConfirmPin('');
    setIsConfirmingPin(false);
  };

  const closePinModal = () => {
    setShowPinModal(false);
    resetPinInputs();
  };

  const handlePinInput = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (isConfirmingPin) {
      if (numericValue.length <= 4) setConfirmPin(numericValue);
    } else {
      if (numericValue.length <= 4) setPin(numericValue);
    }
  };

  const handleSignOut = () => {
    signOut();
    router.replace('/auth');
  };

  const renderSectionItem = (
    item: any,
    itemIndex: number,
    itemsLength: number
  ) => (
    <TouchableOpacity
      key={itemIndex}
      className={`flex-row justify-between items-center p-4 ${
        itemIndex < itemsLength - 1 ? 'border-b' : ''
      }`}
      style={[
        itemIndex < itemsLength - 1 ? { borderBottomColor: theme.border } : {},
        {
          backgroundColor: item.disabled
            ? theme.backgroundSecondary
            : theme.card,
        },
      ]}
      onPress={item.action}
      disabled={item.hasSwitch || item.disabled}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center flex-1 gap-3">
        <View
          className="w-11 h-11 rounded-xl justify-center items-center"
          style={{ backgroundColor: `${item.color || theme.primary}15` }}
        >
          <item.icon
            color={item.color || theme.primary}
            strokeWidth={2}
            size={22}
          />
        </View>
        <View className="flex-1">
          <Text
            className="text-base font-semibold mb-0.5"
            style={{ color: theme.text }}
          >
            {item.label}
          </Text>
          {item.subtitle && (
            <Text className="text-xs" style={{ color: theme.textSecondary }}>
              {item.subtitle}
            </Text>
          )}
        </View>
      </View>
      {item.hasSwitch ? (
        item.type === 'biometric' ? (
          isTestingBiometric ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <Switch
              value={localBiometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
              disabled={!biometricAvailable}
              ios_backgroundColor={theme.border}
            />
          )
        ) : item.type === 'pin' ? (
          <Switch
            value={localPinEnabled}
            onValueChange={handlePinToggle}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#fff"
            ios_backgroundColor={theme.border}
          />
        ) : (
          <Switch
            value={item.value}
            onValueChange={item.onValueChange}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#fff"
            ios_backgroundColor={theme.border}
          />
        )
      ) : (
        <ChevronRight color={theme.textSecondary} size={20} strokeWidth={2} />
      )}
    </TouchableOpacity>
  );

  const profileSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Personal Information',
          subtitle: 'Update your details',
          color: '#3B82F6',
          action: () => router.push('/(in_app_screens)/personal-info'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          label: 'Notifications',
          subtitle: 'Manage alerts',
          color: '#8B5CF6',
          hasSwitch: true,
        },
        {
          icon: Palette,
          label: 'Appearance',
          subtitle: 'Theme settings',
          color: '#EC4899',
          action: () => router.push('/(in_app_screens)/appearance'),
        },
      ],
    },
    {
      title: 'Rewards & Savings',
      items: [
        {
          icon: Tag,
          label: 'Coupons & Deals',
          subtitle: 'This section will soon be available!',
          color: '#F59E0B',
          disabled: true,
          action: () => router.push('/(in_app_screens)/coupons'),
        },
        {
          icon: Gift,
          label: 'Loyalty Rewards',
          subtitle: 'This section will soon be available!',
          disabled: true,
          color: '#10B981',
          action: () => router.push('/(in_app_screens)/rewards'),
        },
        {
          icon: Wallet,
          label: 'Budget Tracker',
          subtitle: 'Monitor spending',
          color: '#06B6D4',
          action: () => router.push('/(in_app_screens)/budget-tracker'),
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          icon: Shield,
          label: `${biometricType} Authentication`,
          subtitle: 'Quick secure access',
          color: '#EF4444',
          hasSwitch: true,
          type: 'biometric',
        },
        {
          icon: Shield,
          label: '4-Digit PIN Protection',
          subtitle: 'Additional security',
          color: '#F97316',
          hasSwitch: true,
          type: 'pin',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help Center',
          subtitle: 'FAQs & support',
          color: '#6366F1',
          action: () => router.push('/(in_app_screens)/help-center'),
        },
      ],
    },
  ];

  return (
    <View
      className="flex-1 pt-14"
      style={{ backgroundColor: theme.background }}
    >
      <View className="px-6 pb-4">
        <Text className="text-3xl font-bold" style={{ color: theme.text }}>
          Settings
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View
          className="items-center flex-row gap-7 p-6 rounded-2xl mb-6 shadow-sm"
          style={{
            backgroundColor: theme.card,
            borderColor: theme.border,
            borderWidth: 1,
          }}
        >
          <View className="mb-4 gap-2 justify-center items-center">
            <View
              className="w-24 h-24 rounded-full justify-center items-center overflow-hidden"
              style={{ backgroundColor: `${theme.primary}20` }}
            >
              <LinearGradient
                colors={[theme.primary, `${theme.accent}CC`]}
                className="w-full h-full justify-center items-center"
              >
                <User color="#fff" size={40} strokeWidth={2} />
              </LinearGradient>
            </View>
            <Text
              className="text-xl font-bold mb-1"
              style={{ color: theme.text }}
            >
              {user?.full_name || 'Guest User'}
            </Text>
          </View>
          <View className="gap-1 flex-1">
            <View className="flex-row items-center gap-1 mb-1">
              <Mail color={theme.textSecondary} size={14} />
              <Text className="text-sm" style={{ color: theme.textSecondary }}>
                {user?.email || 'No email'}
              </Text>
            </View>

            <View className="flex-row items-center gap-1">
              <Phone color={theme.textSecondary} size={14} />
              <Text className="text-sm" style={{ color: theme.textSecondary }}>
                {user?.phone_number ?? 'No phone number'}
              </Text>
            </View>

            <View className="flex-row items-center gap-1">
              <Calendar color={theme.textSecondary} size={14} />
              <Text className="text-sm" style={{ color: theme.textSecondary }}>
                {new Date(user?.date_of_birth ?? '').toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} className="mb-6">
            <Text
              className="text-xs font-semibold mb-3 uppercase tracking-wider px-1"
              style={{ color: theme.textSecondary }}
            >
              {section.title}
            </Text>
            <View
              className="rounded-2xl overflow-hidden shadow-sm"
              style={{
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              {section.items.map((item, itemIndex) =>
                renderSectionItem(item, itemIndex, section.items.length)
              )}
            </View>
          </View>
        ))}

        {/* Sign Out Button */}
        <TouchableOpacity
          className="flex-row items-center justify-center p-4 rounded-2xl mb-8 gap-3 shadow-sm"
          style={{
            backgroundColor: isDark ? `${theme.error}60` : `${theme.error}`,
            borderWidth: 1,
            borderColor: `${theme.error}30`,
          }}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <LogOut color={theme.text} size={22} strokeWidth={2} />
          <Text
            className="text-base font-semibold"
            style={{ color: theme.text }}
          >
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* PIN Creation Modal */}
      <Modal
        visible={showPinModal}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        onRequestClose={closePinModal}
      >
        <View
          className="flex-1 justify-center items-center px-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <View
            className="w-full rounded-3xl p-6 shadow-lg"
            style={{ backgroundColor: theme.card }}
          >
            <View className="items-center mb-6">
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: `${theme.primary}15` }}
              >
                <Shield color={theme.primary} size={32} strokeWidth={2} />
              </View>
              <Text
                className="text-xl font-bold mb-2"
                style={{ color: theme.text }}
              >
                {isConfirmingPin ? 'Confirm Your PIN' : 'Create Your PIN'}
              </Text>
              <Text
                className="text-sm text-center"
                style={{ color: theme.textSecondary }}
              >
                {isConfirmingPin
                  ? 'Enter your PIN again to confirm'
                  : "Enter a 4-digit PIN you'll remember"}
              </Text>
            </View>

            <View className="flex-row justify-center gap-3 mb-6">
              <TextInput
                className="w-full h-16 rounded-2xl border border-1"
                style={{
                  borderColor: theme.border,
                  color: theme.text,
                }}
                value={isConfirmingPin ? confirmPin : pin}
                onChangeText={handlePinInput}
                keyboardType="numeric"
                maxLength={4}
                autoFocus
                selectionColor={theme.primary}
                secureTextEntry
                textAlign="center"
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 p-4 rounded-xl border"
                style={{ borderColor: theme.border }}
                onPress={closePinModal}
                activeOpacity={0.7}
              >
                <Text
                  className="text-center font-semibold"
                  style={{ color: theme.textSecondary }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              {isConfirmingPin && (
                <TouchableOpacity
                  className="flex-1 p-4 rounded-xl"
                  style={{ backgroundColor: theme.primary }}
                  onPress={resetPinInputs}
                  activeOpacity={0.7}
                >
                  <Text className="text-center font-semibold text-white">
                    Back
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Authentication Modal */}
      <Modal
        visible={authModalVisible}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        onRequestClose={() => setAuthModalVisible(false)}
      >
        <View
          className="flex-1 justify-center items-center px-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <View
            className="w-full rounded-3xl p-6 shadow-lg"
            style={{ backgroundColor: theme.card }}
          >
            <View className="items-center mb-6">
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: `${theme.error}15` }}
              >
                <Shield color={theme.error} size={32} strokeWidth={2} />
              </View>
              <Text
                className="text-xl font-bold mb-2"
                style={{ color: theme.text }}
              >
                Verify Your Identity
              </Text>
              <Text
                className="text-sm text-center"
                style={{ color: theme.textSecondary }}
              >
                Enter your PIN to disable this security feature
              </Text>
            </View>

            <View className="mb-4">
              <TextInput
                className="w-full h-16 rounded-2xl border border-1"
                style={[{ borderColor: theme.border, color: theme.text }]}
                value={authPin}
                onChangeText={setAuthPin}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                placeholder="Enter PIN"
                placeholderTextColor={theme.textSecondary}
                textAlign="center"
              />
              {authError ? (
                <Text
                  style={{
                    color: theme.error,
                    marginTop: 8,
                    textAlign: 'center',
                    fontWeight: 600,
                  }}
                >
                  {authError}
                </Text>
              ) : null}
            </View>

            <View className="flex-row gap-3 mt-2">
              <TouchableOpacity
                className="flex-1 p-4 rounded-xl border"
                style={{ borderColor: theme.border }}
                onPress={() => {
                  setAuthModalVisible(false);
                  setAuthPin('');
                  setAuthError('');
                }}
                activeOpacity={0.7}
              >
                <Text
                  className="text-center font-semibold"
                  style={{ color: theme.textSecondary }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 p-4 rounded-xl"
                style={{ backgroundColor: theme.primary }}
                onPress={() => {
                  if (authPin === userPin) {
                    if (pendingToggle === 'pin') setLocalPinEnabled(false);
                    if (pendingToggle === 'biometric')
                      setLocalBiometricEnabled(false);
                    setAuthModalVisible(false);
                    setAuthPin('');
                    setPendingToggle(null);
                    setAuthError('');
                  } else {
                    setAuthError('Incorrect PIN');
                    setAuthPin('');
                  }
                }}
                activeOpacity={0.7}
              >
                <Text className="text-center font-semibold text-white">
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
