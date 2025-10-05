// app/(tabs)/profile/personal-info.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
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
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/hooks/useTheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAlert } from '@/providers/AlertProvider';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';
import { fontSize, spacing } from '@/constants/theme';

export default function PersonalInfoScreen() {
  const { theme, isDark } = useTheme();
  const { user, updateProfile, isLoading } = useAuthStore();
  const { showAlert } = useAlert();
  const colorMode = isDark ? 'dark' : 'light';
  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  const HERO_CARD_WIDTH = SCREEN_WIDTH - 40;
  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phoneNumber: user?.phone_number || '',
    address: user?.address || '',
    dateOfBirth: user?.date_of_birth || '',
  });

  const [isEditing, setIsEditing] = useState(false);

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
      fullName: user?.full_name || '',
      email: user?.email || '',
      phoneNumber: user?.phone_number || '',
      address: user?.address || '',
      dateOfBirth: user?.date_of_birth || '',
    });
    setIsEditing(false);
    Keyboard.dismiss();
  };

  const fields = [
    {
      icon: User,
      label: 'Full Name',
      key: 'fullName',
      placeholder: 'Enter your full name',
      editable: true,
    },
    {
      icon: Mail,
      label: 'Email Address',
      key: 'email',
      placeholder: 'Enter your email',
      editable: true,
      keyboardType: 'email-address',
    },
    {
      icon: Phone,
      label: 'Phone Number',
      key: 'phoneNumber',
      placeholder: 'Enter your phone number',
      editable: true,
      keyboardType: 'phone-pad',
    },
    {
      icon: MapPin,
      label: 'Address',
      key: 'address',
      placeholder: 'Enter your address',
      editable: true,
      multiline: true,
    },
    {
      icon: Calendar,
      label: 'Date of Birth',
      key: 'dateOfBirth',
      placeholder: 'YYYY-MM-DD',
      editable: true,
    },
  ];
  const HeroSkeleton = () => (
    <MotiView style={styles.heroSkeletonContainer}>
      <Skeleton
        colorMode={colorMode}
        radius={24}
        height={200}
        width={HERO_CARD_WIDTH}
      />
      <Skeleton
        colorMode={colorMode}
        radius={24}
        height={400}
        width={HERO_CARD_WIDTH}
      />
    </MotiView>
  );
  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
            padding: 30,
            alignItems: 'center',
          },
        ]}
      >
        <View style={[{ flexDirection: 'row' }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color={theme.text} size={24} />
          </TouchableOpacity>
          <Text
            style={[
              styles.title,
              {
                color: theme.text,
                width: '100%',
                textAlign: 'center',
                marginBottom: 40,
              },
            ]}
          >
            Personal Information
          </Text>
        </View>

        {HeroSkeleton()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Personal Information
        </Text>
        <View style={styles.headerRight}>
          {isEditing ? (
            <TouchableOpacity onPress={handleCancel}>
              <Text style={[styles.cancelText, { color: theme.error }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={[styles.editText, { color: theme.primary }]}>
                Edit
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Profile Summary */}
            <View
              style={[
                styles.profileCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                <User color={theme.text} size={32} />
              </View>
              <Text style={[styles.profileName, { color: theme.text }]}>
                {formData.fullName || 'Your Name'}
              </Text>
              <Text
                style={[styles.profileEmail, { color: theme.textSecondary }]}
              >
                {formData.email || 'your.email@example.com'}
              </Text>
            </View>

            {/* Form Fields */}
            <View
              style={[
                styles.formCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              {fields.map((field, index) => (
                <View
                  key={field.key}
                  style={[
                    styles.fieldContainer,
                    index < fields.length - 1 && [
                      styles.fieldBorder,
                      { borderBottomColor: theme.border },
                    ],
                  ]}
                >
                  <View style={styles.fieldHeader}>
                    <View style={styles.fieldLabelContainer}>
                      <field.icon
                        color={theme.primary}
                        size={20}
                        style={styles.fieldIcon}
                      />
                      <Text style={[styles.fieldLabel, { color: theme.text }]}>
                        {field.label}
                      </Text>
                    </View>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: theme.text,
                        backgroundColor: isEditing
                          ? theme.background
                          : `${theme.background}80`,
                        borderColor: isEditing ? theme.primary : theme.border,
                      },
                      !isEditing && { color: theme.textSecondary },
                      field.multiline && styles.multilineInput,
                    ]}
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
                    numberOfLines={field.multiline ? 3 : 1}
                    textAlignVertical={field.multiline ? 'top' : 'center'}
                    returnKeyType={field.multiline ? 'default' : 'done'}
                    blurOnSubmit={!field.multiline}
                  />
                </View>
              ))}
            </View>

            {/* Save Button */}
            {isEditing && (
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.primary }]}
                onPress={handleSave}
              >
                <Save color={theme.text} size={20} />
                <Text style={[styles.saveButtonText, { color: theme.text }]}>
                  Save Changes
                </Text>
              </TouchableOpacity>
            )}

            {/* Extra padding for keyboard */}
            <View style={styles.keyboardSpacer} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSkeletonContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: 40,
  },
  title: {
    fontSize: fontSize['xl'],
    fontFamily: 'Inter-Bold',
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 60,
    alignItems: 'flex-end',
  },
  editText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  cancelText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 50, // Extra padding for better scroll
  },
  profileCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  formCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  fieldContainer: {
    padding: 16,
  },
  fieldBorder: {
    borderBottomWidth: 1,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldIcon: {
    marginRight: 12,
  },
  fieldLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 48,
  },
  multilineInput: {
    minHeight: 80,
    paddingTop: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    marginBottom: 24,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  keyboardSpacer: {
    height: 100, // Extra space when keyboard is open
  },
});
