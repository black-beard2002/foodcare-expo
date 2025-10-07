import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { MapPin, Navigation, ArrowLeft } from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { useAlert } from '@/providers/AlertProvider';
import { useTheme } from '@/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';

export default function OnboardingStep2() {
  const [address, setAddress] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { updateProfile, isLoading, user } = useAuthStore();
  const { showAlert } = useAlert();
  const { theme, isDark } = useTheme();

  const isFormValid = useMemo(() => address.trim().length >= 5, [address]);

  const handleGetCurrentLocation = useCallback(async () => {
    setIsGettingLocation(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockAddresses = [
        '123 Main Street, New York, NY 10001',
        '456 Oak Avenue, Los Angeles, CA 90001',
        '789 Maple Drive, Chicago, IL 60601',
        '321 Elm Street, Houston, TX 77001',
        '654 Pine Road, Phoenix, AZ 85001',
      ];

      const randomAddress = mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
      setAddress(randomAddress);

      showAlert('Location Found', 'Your current location has been detected', 'success');
    } catch (error) {
      showAlert('Error', 'Unable to get your current location. Please enter manually.', 'error');
    } finally {
      setIsGettingLocation(false);
    }
  }, [showAlert]);

  const handleContinue = useCallback(async () => {
    if (!isFormValid) {
      showAlert('Invalid Address', 'Please enter a valid address (at least 5 characters)', 'error');
      return;
    }

    if (!user?.id) {
      showAlert('Error', 'User session not found. Please login again.', 'error');
      return;
    }

    const result = await updateProfile({
      address: address.trim(),
      latitude: 40.7128,
      longitude: -74.006,
    });

    if (result.success) {
      router.push('/auth/onboarding-step-3');
    } else {
      showAlert('Error', result.error || 'Failed to save address', 'error');
    }
  }, [address, isFormValid, user, updateProfile, showAlert]);

  const handleSkip = useCallback(() => {
    Alert.alert(
      'Skip Address',
      'You can add your address later in settings. Continue without adding address?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Skip',
          onPress: () => router.push('/auth/onboarding-step-3'),
        },
      ]
    );
  }, []);

  const gradientColors = isDark
    ? (['rgba(15,23,42,1)', 'rgba(33,42,54,1)'] as const)
    : (['rgba(250,250,250,1)', 'rgba(226,232,240,1)'] as const);

  const accentGradient = isDark
    ? (['rgba(244,208,63,1)', 'rgba(245,158,11,1)'] as const)
    : (['rgba(244,208,63,1)', 'rgb(247,177,57)'] as const);

  return (
    <LinearGradient colors={gradientColors} className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pt-16 pb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            disabled={isLoading}
            className="mb-4"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft color={theme.text} size={24} />
          </TouchableOpacity>

          <View className="items-center mb-8">
            <LinearGradient
              colors={accentGradient}
              style={{ borderRadius: 24 }}
              className="w-24 h-24 justify-center items-center mb-6"
            >
              <MapPin color="#fff" size={56} />
            </LinearGradient>

            <Text className="text-3xl font-bold mb-3 text-center" style={{ color: theme.text }}>
              Where Are You?
            </Text>
            <Text
              className="text-base text-center leading-6 px-4"
              style={{ color: theme.textSecondary }}
            >
              Add your location to help us find the best restaurants near you
            </Text>

            <View className="flex-row items-center mt-6">
              <View className="w-8 h-1 rounded-full" style={{ backgroundColor: theme.border }} />
              <View className="w-8 h-1 rounded-full mx-2" style={{ backgroundColor: theme.primary }} />
              <View className="w-8 h-1 rounded-full" style={{ backgroundColor: theme.border }} />
            </View>
            <Text className="text-sm mt-2" style={{ color: theme.textSecondary }}>
              Step 2 of 3
            </Text>
          </View>

          <View className="flex-1 justify-center">
            <TouchableOpacity
              onPress={handleGetCurrentLocation}
              disabled={isGettingLocation || isLoading}
              className="flex-row items-center justify-center py-4 rounded-xl mb-6 border-2"
              style={{
                backgroundColor: theme.inputBackground,
                borderColor: theme.primary,
                opacity: isGettingLocation || isLoading ? 0.6 : 1,
              }}
            >
              {isGettingLocation ? (
                <>
                  <ActivityIndicator color={theme.primary} size="small" />
                  <Text className="text-base font-medium ml-3" style={{ color: theme.text }}>
                    Getting Location...
                  </Text>
                </>
              ) : (
                <>
                  <Navigation color={theme.primary} size={22} />
                  <Text className="text-base font-medium ml-3" style={{ color: theme.text }}>
                    Use Current Location
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px" style={{ backgroundColor: theme.border }} />
              <Text className="text-sm mx-4" style={{ color: theme.textSecondary }}>
                or enter manually
              </Text>
              <View className="flex-1 h-px" style={{ backgroundColor: theme.border }} />
            </View>

            <View className="mb-8">
              <Text className="text-sm font-medium mb-2" style={{ color: theme.text }}>
                Delivery Address
              </Text>
              <View
                className="px-4 py-4 rounded-xl border-2"
                style={{
                  backgroundColor: theme.inputBackground,
                  borderColor: address ? theme.primary : theme.border,
                }}
              >
                <View className="flex-row items-start">
                  <MapPin color={theme.textSecondary} size={20} style={{ marginTop: 2 }} />
                  <TextInput
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Enter your full address"
                    placeholderTextColor={theme.textSecondary}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    editable={!isLoading}
                    className="flex-1 ml-3 text-base"
                    style={{ color: theme.text, minHeight: 60 }}
                  />
                </View>
              </View>
              <Text className="text-xs mt-2 px-1" style={{ color: theme.textSecondary }}>
                Include street, city, and postal code
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleContinue}
              disabled={!isFormValid || isLoading}
              className="w-full py-4 rounded-xl items-center justify-center mb-4"
              style={{
                backgroundColor: isFormValid && !isLoading ? theme.primary : theme.border,
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  className="text-base font-semibold"
                  style={{
                    color: isFormValid ? '#fff' : theme.textSecondary,
                  }}
                >
                  Continue
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSkip}
              disabled={isLoading}
              className="w-full py-3 items-center"
            >
              <Text className="text-base font-medium" style={{ color: theme.textSecondary }}>
                Skip for Now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
