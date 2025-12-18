import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  Edit3,
  X,
  AlertCircle,
  Navigation,
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/hooks/useTheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAlert } from '@/providers/AlertProvider';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';

export default function PersonalInfoScreen() {
  const { theme, isDark } = useTheme();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const { user, updateProfile, isLoading, loadUserFromStorage } =
    useAuthStore();
  const { showAlert } = useAlert();
  const colorMode = isDark ? 'dark' : 'light';
  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  const HERO_CARD_WIDTH = SCREEN_WIDTH - 48;

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email_address: user?.email_address || '',
    phone_number: user?.phone_number || '',
    address: user?.address || '',
    birthdate: user?.birthdate || '',
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadUserFromStorage();
    if (user?.birthdate) {
      setDateOfBirth(new Date(user.birthdate));
    }
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email_address: user?.email_address || '',
        phone_number: user?.phone_number || '',
        address: user?.address || '',
        birthdate: user?.birthdate || '',
      });
      if (user?.birthdate) {
        setDateOfBirth(new Date(user.birthdate));
      }
    }
  }, [user]);

  // Check for missing information
  const missingFields = useMemo(() => {
    const missing: string[] = [];
    if (!formData.first_name?.trim()) missing.push('First Name');
    if (!formData.last_name?.trim()) missing.push('Last Name');
    if (!formData.email_address?.trim()) missing.push('Email Address');
    if (!formData.phone_number?.trim()) missing.push('Phone Number');
    if (!formData.address?.trim()) missing.push('Address');
    if (!formData.birthdate || !dateOfBirth) missing.push('Date of Birth');
    return missing;
  }, [formData, dateOfBirth]);

  const hasMissingInfo = missingFields.length > 0;

  const handleMissingInfoPress = () => {
    const fieldsText = missingFields.join(', ');
    showAlert(
      'Incomplete Profile',
      `Please complete the following fields: ${fieldsText}`,
      'warning'
    );
    setIsEditing(true);
  };

  const validateForm = () => {
    if (!formData.first_name?.trim()) {
      showAlert('Validation Error', 'First name is required', 'error');
      return false;
    }
    if (!formData.last_name?.trim()) {
      showAlert('Validation Error', 'Last name is required', 'error');
      return false;
    }
    if (!formData.email_address?.trim()) {
      showAlert('Validation Error', 'Email address is required', 'error');
      return false;
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email_address)) {
      showAlert(
        'Validation Error',
        'Please enter a valid email address',
        'error'
      );
      return false;
    }
    if (!formData.phone_number?.trim()) {
      showAlert('Validation Error', 'Phone number is required', 'error');
      return false;
    }
    if (!formData.address?.trim()) {
      showAlert('Validation Error', 'Address is required', 'error');
      return false;
    }
    if (!dateOfBirth) {
      showAlert('Validation Error', 'Date of birth is required', 'error');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const year = dateOfBirth?.getFullYear();
      const month =
        dateOfBirth && String(dateOfBirth.getMonth() + 1).padStart(2, '0');
      const day = dateOfBirth && String(dateOfBirth.getDate()).padStart(2, '0');
      const isoDate = `${year}-${month}-${day}`;
      const finalData = { ...formData, birthdate: isoDate };
      const res = await updateProfile(finalData);
      setIsEditing(false);
      if (res.success) {
        showAlert('Profile Updated', 'Profile updated successfully', 'success');
      } else {
        showAlert('Error', 'Failed to update profile', 'error');
      }
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to update profile', 'error');
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email_address: user?.email_address || '',
      phone_number: user?.phone_number || '',
      address: user?.address || '',
      birthdate: user?.birthdate || '',
    });
    if (user?.birthdate) {
      setDateOfBirth(new Date(user.birthdate));
    }
    setIsEditing(false);
    Keyboard.dismiss();
  };

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
          'Location access is required to detect your address. Would you like to open settings?',
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
        setFormData((prev) => ({ ...prev, address: addressString }));
        showAlert(
          'Location Found',
          'Your current location has been detected successfully',
          'success'
        );
      } else {
        setFormData((prev) => ({
          ...prev,
          address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        }));
        showAlert(
          'Location Found',
          'Coordinates detected. Please refine your address manually.',
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

  const fields = [
    {
      icon: User,
      label: 'First Name',
      key: 'first_name',
      placeholder: 'Enter your first name',
      editable: true,
      color: '#3B82F6',
    },
    {
      icon: User,
      label: 'Last Name',
      key: 'last_name',
      placeholder: 'Enter your last name',
      editable: true,
      color: '#3B82F6',
    },
    {
      icon: Mail,
      label: 'Email Address',
      key: 'email_address',
      placeholder: 'Enter your email',
      editable: true,
      keyboardType: 'email-address' as const,
      color: '#8B5CF6',
    },
    {
      icon: Phone,
      label: 'Phone Number',
      key: 'phone_number',
      placeholder: 'Enter your phone number',
      editable: true,
      keyboardType: 'phone-pad' as const,
      color: '#10B981',
    },
    {
      icon: MapPin,
      label: 'Address',
      key: 'address',
      placeholder: 'Enter your address',
      editable: true,
      multiline: true,
      color: '#F59E0B',
      hasLocationButton: true,
    },
  ];

  const HeroSkeleton = () => (
    <View className="px-6 mb-6 gap-6">
      <Skeleton
        colorMode={colorMode}
        radius={24}
        height={180}
        width={HERO_CARD_WIDTH}
      />
      <Skeleton
        colorMode={colorMode}
        radius={24}
        height={500}
        width={HERO_CARD_WIDTH}
      />
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 pt-4"
        style={{ backgroundColor: theme.background }}
      >
        <View className="flex-row items-center px-6 py-4 mb-6">
          <TouchableOpacity
            className="p-1"
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft color={theme.text} size={24} />
          </TouchableOpacity>
          <Text
            className="text-xl flex-1 text-center"
            style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
          >
            Personal Information
          </Text>
          <View className="w-12" />
        </View>
        {HeroSkeleton()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-6 py-8 border-b"
        style={{ borderBottomColor: theme.border }}
      >
        <TouchableOpacity
          className="p-1"
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft color={theme.text} size={24} strokeWidth={2} />
        </TouchableOpacity>
        <Text
          className="text-2xl flex-1 text-center"
          style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
        >
          Personal Information
        </Text>
        <View className="w-16 items-end">
          {isEditing ? (
            <TouchableOpacity onPress={handleCancel} activeOpacity={0.7}>
              <View className="flex-row items-center gap-1">
                <X color={theme.error} size={18} strokeWidth={2} />
                <Text
                  className="text-base"
                  style={{ color: theme.error, fontFamily: 'FredokaMedium' }}
                >
                  Cancel
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-1">
                <Edit3 color={theme.primary} size={18} strokeWidth={2} />
                <Text
                  className="text-base"
                  style={{ color: theme.primary, fontFamily: 'FredokaMedium' }}
                >
                  Edit
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="p-6">
              {/* Missing Info Alert */}
              {hasMissingInfo && !isEditing && (
                <MotiView
                  from={{ opacity: 0, translateY: -20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: 'timing', duration: 400 }}
                  className="rounded-2xl p-4 mb-6 border"
                  style={{
                    backgroundColor: `${theme.warning}10`,
                    borderColor: `${theme.warning}30`,
                  }}
                >
                  <TouchableOpacity
                    onPress={handleMissingInfoPress}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-start gap-3">
                      <View
                        className="w-10 h-10 rounded-full justify-center items-center"
                        style={{ backgroundColor: `${theme.warning}20` }}
                      >
                        <AlertCircle
                          color={theme.warning}
                          size={20}
                          strokeWidth={2.5}
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-base mb-1"
                          style={{
                            color: theme.text,
                            fontFamily: 'FredokaMedium',
                          }}
                        >
                          {missingFields.length === 1
                            ? '1 Field Missing'
                            : `${missingFields.length} Fields Missing`}
                        </Text>
                        <Text
                          className="text-sm leading-5 mb-2"
                          style={{
                            color: theme.textSecondary,
                            fontFamily: 'PoppinsMedium',
                          }}
                        >
                          Complete your profile to get the best experience
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                          {missingFields.slice(0, 3).map((field, idx) => (
                            <View
                              key={idx}
                              className="px-2 py-1 rounded-lg"
                              style={{
                                backgroundColor: `${theme.warning}15`,
                              }}
                            >
                              <Text
                                className="text-xs"
                                style={{
                                  color: theme.warning,
                                  fontFamily: 'PoppinsMedium',
                                }}
                              >
                                {field}
                              </Text>
                            </View>
                          ))}
                          {missingFields.length > 3 && (
                            <View
                              className="px-2 py-1 rounded-lg"
                              style={{
                                backgroundColor: `${theme.warning}15`,
                              }}
                            >
                              <Text
                                className="text-xs"
                                style={{
                                  color: theme.warning,
                                  fontFamily: 'PoppinsMedium',
                                }}
                              >
                                +{missingFields.length - 3} more
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </MotiView>
              )}

              {/* Profile Card */}
              <View
                className="items-center p-6 rounded-3xl mb-6 shadow-sm overflow-hidden"
                style={{
                  backgroundColor: theme.card,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <View className="mb-5">
                  <View className="w-24 h-24 rounded-full overflow-hidden shadow-lg">
                    <LinearGradient
                      colors={[theme.primary, `${theme.primary}CC`]}
                      style={{
                        width: '100%',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      className="w-full h-full justify-center items-center"
                    >
                      <User color="#fff" size={40} strokeWidth={2} />
                    </LinearGradient>
                  </View>
                </View>
                <Text
                  className="text-2xl mb-1"
                  style={{ color: theme.text, fontFamily: 'PoppinsMedium' }}
                >
                  {formData.first_name || formData.last_name
                    ? `${formData.first_name} ${formData.last_name}`.trim()
                    : 'Your Name'}
                </Text>
                <Text
                  className="text-sm"
                  style={{
                    color: theme.textSecondary,
                    fontFamily: 'PoppinsMedium',
                  }}
                >
                  {formData.email_address || 'your.email@example.com'}
                </Text>
              </View>

              {/* Form Fields */}
              <View className="gap-4 mb-6">
                {fields.map((field, index) => (
                  <View key={field.key}>
                    <View className="flex-row items-center gap-2 mb-2 px-1">
                      <View
                        className="w-8 h-8 rounded-lg justify-center items-center"
                        style={{ backgroundColor: `${field.color}15` }}
                      >
                        <field.icon
                          color={field.color}
                          size={16}
                          strokeWidth={2.5}
                        />
                      </View>
                      <Text
                        className="text-sm flex-1"
                        style={{
                          color: theme.text,
                          fontFamily: 'FredokaMedium',
                        }}
                      >
                        {field.label}
                      </Text>
                      {field.hasLocationButton && isEditing && (
                        <TouchableOpacity
                          onPress={handleGetCurrentLocation}
                          disabled={isGettingLocation}
                          activeOpacity={0.7}
                          className="flex-row items-center gap-1 px-3 py-1.5 rounded-lg"
                          style={{
                            backgroundColor: `${theme.primary}15`,
                          }}
                        >
                          {isGettingLocation ? (
                            <ActivityIndicator
                              size="small"
                              color={theme.primary}
                            />
                          ) : (
                            <Navigation
                              color={theme.primary}
                              size={14}
                              strokeWidth={2.5}
                            />
                          )}
                          <Text
                            className="text-xs"
                            style={{
                              color: theme.primary,
                              fontFamily: 'PoppinsMedium',
                            }}
                          >
                            {isGettingLocation ? 'Getting...' : 'Detect'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View
                      className="rounded-2xl overflow-hidden border"
                      style={{
                        backgroundColor: isEditing
                          ? theme.card
                          : `${theme.card}80`,
                        borderColor: isEditing ? field.color : theme.border,
                        borderWidth: isEditing ? 2 : 1,
                      }}
                    >
                      <TextInput
                        className={`px-4 text-base ${
                          field.multiline ? 'py-4 min-h-[100px]' : 'py-3.5'
                        }`}
                        style={{
                          color: isEditing ? theme.text : theme.textSecondary,
                          fontFamily: 'PoppinsMedium',
                        }}
                        value={formData[field.key as keyof typeof formData]}
                        onChangeText={(text) =>
                          setFormData((prev) => ({
                            ...prev,
                            [field.key]: text,
                          }))
                        }
                        placeholder={field.placeholder}
                        placeholderTextColor={theme.textTertiary}
                        editable={isEditing}
                        keyboardType={field.keyboardType}
                        multiline={field.multiline}
                        numberOfLines={field.multiline ? 4 : 1}
                        textAlignVertical={field.multiline ? 'top' : 'center'}
                        returnKeyType={field.multiline ? 'default' : 'done'}
                        blurOnSubmit={!field.multiline}
                      />
                    </View>
                  </View>
                ))}

                {/* Date of Birth Field */}
                <View>
                  <View className="flex-row items-center gap-2 mb-2 px-1">
                    <View
                      className="w-8 h-8 rounded-lg justify-center items-center"
                      style={{ backgroundColor: '#EC489915' }}
                    >
                      <Calendar color="#EC4899" size={16} strokeWidth={2.5} />
                    </View>
                    <Text
                      className="text-sm"
                      style={{
                        color: theme.text,
                        fontFamily: 'FredokaMedium',
                      }}
                    >
                      Date of Birth
                    </Text>
                  </View>

                  <TouchableOpacity
                    className="rounded-2xl border overflow-hidden"
                    disabled={!isEditing}
                    style={{
                      borderColor: isEditing ? '#EC4899' : theme.border,
                      borderWidth: isEditing ? 2 : 1,
                      backgroundColor: isEditing
                        ? theme.card
                        : `${theme.card}80`,
                    }}
                    onPress={() => isEditing && setShowDatePicker(true)}
                  >
                    <View className="px-4 py-3.5">
                      <Text
                        style={{
                          color: isEditing ? theme.text : theme.textSecondary,
                          fontFamily: 'PoppinsMedium',
                        }}
                      >
                        {dateOfBirth
                          ? dateOfBirth.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'Select your date of birth'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      value={dateOfBirth || new Date()}
                      mode="date"
                      style={{ backgroundColor: theme.text }}
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selected) => {
                        setShowDatePicker(Platform.OS === 'ios');
                        if (selected) {
                          setDateOfBirth(selected);
                        }
                      }}
                      maximumDate={new Date()}
                    />
                  )}
                </View>
              </View>

              {/* Save Button */}
              {isEditing && (
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: 'timing', duration: 300 }}
                >
                  <TouchableOpacity
                    className="flex-row items-center justify-center p-5 rounded-2xl gap-3 shadow-lg"
                    style={{ backgroundColor: theme.primary }}
                    onPress={handleSave}
                    activeOpacity={0.8}
                  >
                    <Save color="#fff" size={22} strokeWidth={2} />
                    <Text
                      className="text-lg text-white"
                      style={{ fontFamily: 'FredokaBold' }}
                    >
                      Save Changes
                    </Text>
                  </TouchableOpacity>
                </MotiView>
              )}

              {/* Info Card */}
              {!isEditing && !hasMissingInfo && (
                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: 'timing', duration: 300, delay: 200 }}
                  className="rounded-2xl p-4 border"
                  style={{
                    backgroundColor: `${theme.primary}10`,
                    borderColor: `${theme.primary}30`,
                  }}
                >
                  <View className="flex-row items-start gap-3">
                    <View
                      className="w-8 h-8 rounded-full justify-center items-center mt-0.5"
                      style={{ backgroundColor: `${theme.primary}20` }}
                    >
                      <Edit3
                        color={theme.primary}
                        size={14}
                        strokeWidth={2.5}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-base mb-1"
                        style={{
                          color: theme.text,
                          fontFamily: 'FredokaMedium',
                        }}
                      >
                        Keep Your Info Updated
                      </Text>
                      <Text
                        className="text-xs leading-5"
                        style={{
                          color: theme.textSecondary,
                          fontFamily: 'PoppinsMedium',
                        }}
                      >
                        Tap Edit to update your personal information. Your data
                        is secure and private.
                      </Text>
                    </View>
                  </View>
                </MotiView>
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
