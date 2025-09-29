import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import {
  User,
  Settings,
  Bell,
  Shield,
  CreditCard,
  MapPin,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTheme } from '@/hooks/useTheme';

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme, setTheme: setAppTheme, currentTheme } = useTheme();
  const { user, signOut } = useAuthStore();
  const { biometricEnabled, setBiometricEnabled, pinEnabled, setPinEnabled } =
    useSettingsStore();

  const profileSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Personal Information',
          action: () => {
            // Navigate to personal info screen
            console.log('Personal Info');
          },
        },
        {
          icon: MapPin,
          label: 'Addresses',
          action: () => {
            // Navigate to addresses screen
            console.log('Addresses');
          },
        },
        {
          icon: CreditCard,
          label: 'Payment Methods',
          action: () => {
            // Navigate to payment methods screen
            console.log('Payment');
          },
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          label: 'Notifications',
          action: () => {
            // Navigate to notifications settings
            console.log('Notifications');
          },
        },
        {
          icon: Moon,
          label: 'Dark Mode',
          hasSwitch: true,
          value: isDark,
          onValueChange: toggleTheme,
        },
        {
          icon: Settings,
          label: 'Theme Settings',
          action: () => {
            // Show theme picker (Light/Dark/System)
            console.log('Theme Settings');
          },
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          icon: Shield,
          label: 'Biometric Authentication',
          hasSwitch: true,
          value: biometricEnabled,
          onValueChange: setBiometricEnabled,
        },
        {
          icon: Shield,
          label: 'PIN Protection',
          hasSwitch: true,
          value: pinEnabled,
          onValueChange: setPinEnabled,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help Center',
          action: () => {
            // Navigate to help center
            console.log('Help');
          },
        },
        {
          icon: Settings,
          label: 'Settings',
          action: () => {
            // Navigate to general settings
            console.log('Settings');
          },
        },
      ],
    },
  ];

  const handleSignOut = () => {
    signOut();
    router.replace('/auth');
  };

  const renderSection = (section: any, sectionIndex: number) => (
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
        {section.items.map((item: any, itemIndex: number) => (
          <TouchableOpacity
            key={itemIndex}
            style={[
              styles.menuItem,
              itemIndex < section.items.length - 1 && [
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
                  { backgroundColor: `${theme.primary}20` },
                ]}
              >
                <item.icon color={theme.primary} size={20} />
              </View>
              <Text style={[styles.menuItemText, { color: theme.text }]}>
                {item.label}
              </Text>
            </View>
            {item.hasSwitch ? (
              <Switch
                value={item.value}
                onValueChange={item.onValueChange}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            ) : (
              <ChevronRight color={theme.textSecondary} size={20} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
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
              <User color="#FFFFFF" size={32} />
            </View>
          </View>
          <Text style={[styles.profileName, { color: theme.text }]}>
            {user?.full_name || 'Guest User'}
          </Text>
          <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>
            {user?.email || user?.phone_number || 'Not signed in'}
          </Text>
        </View>

        {profileSections.map(renderSection)}

        <TouchableOpacity
          style={[
            styles.signOutButton,
            { backgroundColor: `${theme.danger}20` },
          ]}
          onPress={handleSignOut}
        >
          <LogOut color={theme.danger} size={20} />
          <Text style={[styles.signOutText, { color: theme.danger }]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
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
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  section: {
    marginBottom: 24,
  },
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
  menuItemBorder: {
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginVertical: 24,
    gap: 12,
  },
  signOutText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
});
