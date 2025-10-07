import React, { useEffect, useState } from 'react';
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
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/hooks/useTheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAlert } from '@/providers/AlertProvider';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';
import { LinearGradient } from 'expo-linear-gradient';

export default function PersonalInfoScreen() {
  const { theme, isDark } = useTheme();
  const { user, updateProfile, isLoading, loadUserFromStorage } =
    useAuthStore();
  const { showAlert } = useAlert();
  const colorMode = isDark ? 'dark' : 'light';
  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  const HERO_CARD_WIDTH = SCREEN_WIDTH - 48;

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    address: user?.address || '',
    date_of_birth: user?.date_of_birth || '',
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      showAlert('Success', 'Profile updated successfully', 'success');
    } catch (error) {
      showAlert('Error', 'Failed to update profile', 'error');
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone_number: user?.phone_number || '',
      address: user?.address || '',
      date_of_birth: user?.date_of_birth || '',
    });
    setIsEditing(false);
    Keyboard.dismiss();
  };

  const fields = [
    {
      icon: User,
      label: 'Full Name',
      key: 'full_name',
      placeholder: 'Enter your full name',
      editable: true,
      color: '#3B82F6',
    },
    {
      icon: Mail,
      label: 'Email Address',
      key: 'email',
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
    },
    {
      icon: Calendar,
      label: 'Date of Birth',
      key: 'date_of_birth',
      placeholder: 'YYYY-MM-DD',
      editable: true,
      color: '#EC4899',
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
            className="text-xl font-bold flex-1 text-center"
            style={{ color: theme.text }}
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
        className="flex-row items-center justify-between px-6 py-4 border-b"
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
          className="text-xl font-bold flex-1 text-center"
          style={{ color: theme.text }}
        >
          Personal Information
        </Text>
        <View className="w-16 items-end">
          {isEditing ? (
            <TouchableOpacity onPress={handleCancel} activeOpacity={0.7}>
              <View className="flex-row items-center gap-1">
                <X color={theme.error} size={18} strokeWidth={2} />
                <Text
                  className="text-base font-semibold"
                  style={{ color: theme.error }}
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
                  className="text-base font-semibold"
                  style={{ color: theme.primary }}
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
                      className="w-full h-full justify-center items-center"
                    >
                      <User color="#fff" size={40} strokeWidth={2} />
                    </LinearGradient>
                  </View>
                  {isEditing && (
                    <View
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full justify-center items-center border-2"
                      style={{
                        backgroundColor: theme.primary,
                        borderColor: theme.card,
                      }}
                    >
                      <Edit3 color="#fff" size={14} strokeWidth={2.5} />
                    </View>
                  )}
                </View>
                <Text
                  className="text-2xl font-bold mb-1"
                  style={{ color: theme.text }}
                >
                  {formData.full_name || 'Your Name'}
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: theme.textSecondary }}
                >
                  {formData.email || 'your.email@example.com'}
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
                        className="text-sm font-semibold"
                        style={{ color: theme.text }}
                      >
                        {field.label}
                      </Text>
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
                    <Text className="text-lg font-bold text-white">
                      Save Changes
                    </Text>
                  </TouchableOpacity>
                </MotiView>
              )}

              {/* Info Card */}
              {!isEditing && (
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
                        className="text-sm font-semibold mb-1"
                        style={{ color: theme.text }}
                      >
                        Keep Your Info Updated
                      </Text>
                      <Text
                        className="text-xs leading-5"
                        style={{ color: theme.textSecondary }}
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
