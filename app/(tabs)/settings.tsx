import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
} from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTheme } from '@/hooks/useTheme';
import { useAlert } from '@/providers/AlertProvider';

export default function SettingScreen() {
  const { theme } = useTheme();
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

  // local states for biometrics and pin
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
  const [authConfirming, setAuthConfirming] = useState(false);
  const [authError, setAuthError] = useState('');

  // pin modal
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfirmingPin, setIsConfirmingPin] = useState(false);

  // check biometric availability on mount
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
      // Use expo-local-authentication
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
      // Show PIN modal
      setPendingToggle(type);
      setAuthModalVisible(true);
      return false;
    }
    return false;
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (!value) {
      // Trying to disable
      const authenticated = await authenticateBeforeDisable('biometric');
      if (!authenticated) return;
    } else {
      // Enable normally
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
      // Trying to disable
      const authenticated = await authenticateBeforeDisable('pin');
      if (!authenticated) return;
    } else {
      // Enable normally
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
      style={[
        styles.menuItem,
        itemIndex < itemsLength - 1 && [
          styles.menuItemBorder,
          { borderBottomColor: theme.border },
        ],
      ]}
      onPress={item.action}
      disabled={item.hasSwitch}
    >
      <View style={styles.menuItemLeft}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${theme.primaryLight}20` },
          ]}
        >
          <item.icon color={theme.primaryDark} strokeWidth={2.5} size={20} />
        </View>
        <Text style={[styles.menuItemText, { color: theme.text }]}>
          {item.label}
        </Text>
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
              thumbColor={theme.primary}
              disabled={!biometricAvailable}
            />
          )
        ) : item.type === 'pin' ? (
          <Switch
            value={localPinEnabled}
            onValueChange={handlePinToggle}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={theme.primary}
          />
        ) : (
          <Switch
            value={item.value}
            onValueChange={item.onValueChange}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={theme.primary}
          />
        )
      ) : (
        <ChevronRight color={theme.textSecondary} size={20} />
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
          action: () => router.push('/(in_app_screens)/personal-info'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', hasSwitch: true },
        {
          icon: Palette,
          label: 'Appearance',
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
          action: () => router.push('/(in_app_screens)/coupons'),
        },
        {
          icon: Gift,
          label: 'Loyalty Rewards',
          action: () => router.push('/(in_app_screens)/rewards'),
        },
        {
          icon: Wallet,
          label: 'Budget Tracker',
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
          hasSwitch: true,
          type: 'biometric',
        },
        {
          icon: Shield,
          label: '4-Digit PIN Protection',
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
          action: () => router.push('/(in_app_screens)/help-center'),
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.profileCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <User color={theme.text} size={32} />
            </View>
          </View>
          <Text style={[styles.profileName, { color: theme.text }]}>
            {user?.full_name || 'Guest User'}
          </Text>
          <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>
            {user?.email || user?.phone_number || 'Not signed in'}
          </Text>
        </View>

        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              {section.title}
            </Text>
            <View
              style={[
                styles.sectionContent,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              {section.items.map((item, itemIndex) =>
                renderSectionItem(item, itemIndex, section.items.length)
              )}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[
            styles.signOutButton,
            { backgroundColor: `${theme.errorLight}` },
          ]}
          onPress={handleSignOut}
        >
          <LogOut color={theme.error} size={20} />
          <Text style={[styles.signOutText, { color: theme.error }]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* PIN Modal */}
      <Modal
        visible={showPinModal}
        transparent
        animationType="fade"
        onRequestClose={closePinModal}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
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
            <TextInput
              style={[
                styles.pinTextInput,
                { color: theme.text, borderColor: theme.border },
              ]}
              value={isConfirmingPin ? confirmPin : pin}
              onChangeText={handlePinInput}
              keyboardType="numeric"
              maxLength={4}
              autoFocus
              placeholder="Enter PIN"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              textAlign="center"
            />
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: theme.border }]}
                onPress={closePinModal}
              >
                <Text style={{ color: theme.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              {isConfirmingPin && (
                <TouchableOpacity
                  style={[styles.modalButton, { borderColor: theme.border }]}
                  onPress={resetPinInputs}
                >
                  <Text style={{ color: theme.text }}>Back</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={authModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAuthModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Enter your PIN to disable
            </Text>
            <TextInput
              style={[
                styles.pinTextInput,
                { borderColor: theme.border, color: theme.text },
              ]}
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
              <Text style={{ color: theme.error, marginTop: 8 }}>
                {authError}
              </Text>
            ) : null}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: 16,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setAuthModalVisible(false);
                  setAuthPin('');
                  setAuthError('');
                }}
              >
                <Text style={{ color: theme.textSecondary, marginRight: 16 }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
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
              >
                <Text style={{ color: theme.primary }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: { paddingHorizontal: 24, paddingBottom: 24 },
  title: { fontSize: 28, fontFamily: 'Inter-Bold' },
  content: { flex: 1, paddingHorizontal: 24 },
  profileCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: { marginBottom: 16 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: { fontSize: 20, fontFamily: 'Inter-Bold', marginBottom: 4 },
  profileEmail: { fontSize: 14, fontFamily: 'Inter-Regular' },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  menuItemBorder: { borderBottomWidth: 1 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: { fontSize: 16, fontFamily: 'Inter-Medium' },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginVertical: 24,
    gap: 12,
  },
  signOutText: { fontSize: 16, fontFamily: 'Inter-Medium' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', padding: 20, borderRadius: 16 },
  modalTitle: { fontSize: 18, fontFamily: 'Inter-Bold', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, marginBottom: 16 },
  pinTextInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 20,
    marginBottom: 20,
  },
  modalFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  modalButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 10,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
});
