import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
  ColorValue,
} from 'react-native';
import { router } from 'expo-router';
import {
  MapPin,
  Navigation,
  ArrowLeft,
  ArrowRight,
  Map,
  AlertCircle,
} from 'lucide-react-native';
import * as Location from 'expo-location';
import { useAuthStore } from '@/stores/authStore';
import { useAlert } from '@/providers/AlertProvider';
import { useTheme } from '@/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';

export default function OnboardingStep2() {
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState(false);
  const { updateProfile, isLoading, user } = useAuthStore();
  const { showAlert } = useAlert();
  const { theme, isDark } = useTheme();

  const isFormValid = useMemo(() => address.trim().length >= 5, [address]);

  const reverseGeocode = useCallback(
    async (latitude: number, longitude: number) => {
      try {
        const results = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        if (results && results.length > 0) {
          const result = results[0];
          const addressParts = [
            result.streetNumber,
            result.street,
            result.city,
            result.region,
            result.postalCode,
            result.country,
          ].filter(Boolean);

          return addressParts.join(', ');
        }
        return null;
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
      }
    },
    []
  );

  const handleGetCurrentLocation = useCallback(async () => {
    setIsGettingLocation(true);
    setLocationError(null);

    try {
      // Check if location services are enabled
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setLocationError('Location services are disabled');
        showAlert(
          'Location Services Disabled',
          'Please enable location services in your device settings to use this feature.',
          'error'
        );
        setIsGettingLocation(false);
        return;
      }

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'denied') {
        setLocationError('Location permission denied');
        Alert.alert(
          'Permission Required',
          'Location access is required to find restaurants near you. Would you like to open settings?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              },
            },
          ]
        );
        setIsGettingLocation(false);
        return;
      }

      if (status !== 'granted') {
        setLocationError('Location permission not granted');
        showAlert(
          'Permission Denied',
          'Location permission is required to use this feature.',
          'error'
        );
        setIsGettingLocation(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      setCoordinates({ latitude, longitude });

      // Reverse geocode to get address
      const addressString = await reverseGeocode(latitude, longitude);

      if (addressString) {
        setAddress(addressString);
        showAlert(
          'Location Found',
          'Your current location has been detected successfully',
          'success'
        );
      } else {
        setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        showAlert(
          'Location Found',
          'Please refine your address manually',
          'info'
        );
      }
    } catch (error: any) {
      console.error('Location error:', error);
      setLocationError('Failed to get location');
      showAlert(
        'Error',
        error.message ||
          'Unable to get your current location. Please enter your address manually.',
        'error'
      );
    } finally {
      setIsGettingLocation(false);
    }
  }, [showAlert, reverseGeocode]);

  const handleContinue = useCallback(async () => {
    if (!isFormValid) {
      showAlert(
        'Invalid Address',
        'Please enter a valid address (at least 5 characters)',
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

    // Use detected coordinates or default coordinates
    const lat = coordinates?.latitude || 0;
    const lng = coordinates?.longitude || 0;

    const result = await updateProfile({
      address: address.trim(),
      latitude: lat,
      longitude: lng,
    });

    if (result.success) {
      router.push('/auth/onboarding-step-3');
    } else {
      showAlert('Error', result.error || 'Failed to save address', 'error');
    }
  }, [address, coordinates, isFormValid, user, updateProfile, showAlert]);

  const handleSkip = useCallback(() => {
    Alert.alert(
      'Skip Address',
      'You can add your address later in settings. Continue without adding address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => router.push('/auth/onboarding-step-3'),
        },
      ]
    );
  }, []);

  const gradientColors: [ColorValue, ColorValue, ColorValue] = isDark
    ? ['rgba(15,23,42,1)', 'rgba(30,41,59,1)', 'rgba(15,23,42,1)']
    : ['rgba(255,255,255,1)', 'rgba(248,250,252,1)', 'rgba(241,245,249,1)'];

  const accentGradient: [ColorValue, ColorValue] = isDark
    ? ['rgba(59,130,246,1)', 'rgba(147,51,234,1)']
    : ['rgba(99,102,241,1)', 'rgba(139,92,246,1)'];

  return (
    <LinearGradient colors={gradientColors} className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pt-16 pb-8">
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            disabled={isLoading}
            className="mb-6 w-10 h-10 rounded-xl items-center justify-center"
            style={{
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(0,0,0,0.05)',
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft color={theme.text} size={20} strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Header Section */}
          <View className="items-center mb-12">
            <View className="relative mb-6">
              <LinearGradient
                colors={accentGradient}
                style={{ borderRadius: 32 }}
                className="w-20 h-20 justify-center items-center shadow-lg"
              >
                <Map color="#fff" size={40} strokeWidth={2.5} />
              </LinearGradient>
              {coordinates && (
                <View
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full items-center justify-center"
                  style={{ backgroundColor: isDark ? '#10b981' : '#22c55e' }}
                >
                  <View className="w-2 h-2 rounded-full bg-white" />
                </View>
              )}
            </View>

            <Text
              className="text-4xl font-bold mb-3 text-center"
              style={{ color: theme.text, letterSpacing: -0.5 }}
            >
              Your Location
            </Text>
            <Text
              className="text-base text-center leading-6 px-8 opacity-70"
              style={{ color: theme.text }}
            >
              Help us discover the best restaurants and dining experiences near
              you
            </Text>

            {/* Progress Indicator */}
            <View className="flex-row items-center mt-8 gap-2">
              <View
                className="h-1.5 rounded-full"
                style={{
                  width: 16,
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.2)'
                    : 'rgba(0,0,0,0.1)',
                }}
              />
              <View
                className="h-1.5 rounded-full"
                style={{
                  width: 32,
                  backgroundColor: theme.primary,
                }}
              />
              <View
                className="h-1.5 rounded-full"
                style={{
                  width: 16,
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.2)'
                    : 'rgba(0,0,0,0.1)',
                }}
              />
            </View>
            <Text
              className="text-xs mt-3 font-medium tracking-wider opacity-60"
              style={{ color: theme.text }}
            >
              STEP 2 OF 3
            </Text>
          </View>

          {/* Content Section */}
          <View className="flex-1 justify-center">
            {/* Current Location Button */}
            <TouchableOpacity
              onPress={handleGetCurrentLocation}
              disabled={isGettingLocation || isLoading}
              activeOpacity={0.8}
              className="rounded-2xl mb-6 overflow-hidden shadow-lg"
              style={{
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
              }}
            >
              <LinearGradient
                colors={accentGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex-row items-center justify-center py-5 px-6"
              >
                {isGettingLocation ? (
                  <>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text className="text-base font-bold ml-3 text-white">
                      Detecting Location...
                    </Text>
                  </>
                ) : (
                  <>
                    <Navigation color="#fff" size={22} strokeWidth={2.5} />
                    <Text className="text-base font-bold ml-3 text-white">
                      Use Current Location
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Location Error */}
            {locationError && (
              <View
                className="flex-row items-center px-4 py-3 rounded-xl mb-6"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(239,68,68,0.15)'
                    : 'rgba(239,68,68,0.1)',
                }}
              >
                <AlertCircle
                  color={isDark ? '#fca5a5' : '#dc2626'}
                  size={18}
                  strokeWidth={2.5}
                />
                <Text
                  className="text-sm ml-3 flex-1"
                  style={{ color: isDark ? '#fca5a5' : '#dc2626' }}
                >
                  {locationError}
                </Text>
              </View>
            )}

            {/* Divider */}
            <View className="flex-row items-center mb-6">
              <View
                className="flex-1 h-px"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.1)',
                }}
              />
              <Text
                className="text-sm mx-4 font-medium opacity-50"
                style={{ color: theme.text }}
              >
                or enter manually
              </Text>
              <View
                className="flex-1 h-px"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.1)',
                }}
              />
            </View>

            {/* Address Input */}
            <View className="mb-8">
              <Text
                className="text-sm font-semibold mb-3 tracking-wide"
                style={{ color: theme.text }}
              >
                DELIVERY ADDRESS
              </Text>
              <View
                className="px-5 py-4 rounded-2xl border-2 shadow-sm"
                style={{
                  backgroundColor: isDark ? 'rgba(30,41,59,0.5)' : '#ffffff',
                  borderColor: focusedField
                    ? theme.primary
                    : address
                    ? isDark
                      ? 'rgba(59,130,246,0.3)'
                      : 'rgba(99,102,241,0.3)'
                    : isDark
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.05)',
                  shadowColor: focusedField ? theme.primary : 'transparent',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  minHeight: 100,
                }}
              >
                <View className="flex-row items-start">
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(59,130,246,0.15)'
                        : 'rgba(99,102,241,0.1)',
                    }}
                  >
                    <MapPin color={theme.primary} size={20} strokeWidth={2.5} />
                  </View>
                  <TextInput
                    value={address}
                    onChangeText={setAddress}
                    onFocus={() => setFocusedField(true)}
                    onBlur={() => setFocusedField(false)}
                    placeholder="Street address, city, postal code"
                    placeholderTextColor={
                      isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
                    }
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    editable={!isLoading}
                    className="flex-1 text-base font-medium"
                    style={{ color: theme.text }}
                  />
                </View>
              </View>
              {coordinates && (
                <View
                  className="flex-row items-center mt-3 px-2"
                  style={{ opacity: 0.6 }}
                >
                  <View
                    className="w-1 h-1 rounded-full mr-2"
                    style={{ backgroundColor: isDark ? '#10b981' : '#22c55e' }}
                  />
                  <Text className="text-xs" style={{ color: theme.text }}>
                    Location coordinates saved:{' '}
                    {coordinates.latitude.toFixed(4)},{' '}
                    {coordinates.longitude.toFixed(4)}
                  </Text>
                </View>
              )}
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              onPress={handleContinue}
              disabled={!isFormValid || isLoading}
              activeOpacity={0.8}
              className="overflow-hidden rounded-2xl shadow-lg mb-4"
              style={{
                shadowColor: isFormValid ? theme.primary : 'transparent',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
              }}
            >
              <LinearGradient
                colors={
                  isFormValid && !isLoading
                    ? accentGradient
                    : [
                        isDark ? 'rgba(71,85,105,1)' : 'rgba(203,213,225,1)',
                        isDark ? 'rgba(51,65,85,1)' : 'rgba(226,232,240,1)',
                      ]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="w-full py-5 items-center justify-center"
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <View className="flex-row items-center">
                    <Text
                      className="text-base font-bold tracking-wide mr-2"
                      style={{
                        color: isFormValid
                          ? '#fff'
                          : isDark
                          ? 'rgba(255,255,255,0.4)'
                          : 'rgba(0,0,0,0.3)',
                      }}
                    >
                      Continue
                    </Text>
                    <ArrowRight
                      color={
                        isFormValid
                          ? '#fff'
                          : isDark
                          ? 'rgba(255,255,255,0.4)'
                          : 'rgba(0,0,0,0.3)'
                      }
                      size={20}
                      strokeWidth={2.5}
                    />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Skip Button */}
            <TouchableOpacity
              onPress={handleSkip}
              disabled={isLoading}
              className="w-full py-4 items-center"
              activeOpacity={0.6}
            >
              <Text
                className="text-base font-semibold opacity-60"
                style={{ color: theme.text }}
              >
                Skip for Now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
