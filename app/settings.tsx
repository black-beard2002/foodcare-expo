import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Palette, Moon, Sun, Smartphone } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme, setTheme, currentTheme } = useTheme();

  const themeOptions = [
    {
      key: 'light',
      label: 'Light',
      icon: Sun,
      description: 'Always use light theme',
    },
    {
      key: 'dark',
      label: 'Dark',
      icon: Moon,
      description: 'Always use dark theme',
    },
    {
      key: 'system',
      label: 'System',
      icon: Smartphone,
      description: 'Follow system settings',
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.backButton,
            { backgroundColor: theme.inputBackground },
          ]}
        >
          <ArrowLeft color={theme.text} size={20} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Palette color={theme.primary} size={24} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Appearance
            </Text>
          </View>

          <View
            style={[
              styles.sectionContent,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={styles.quickToggle}>
              <Text style={[styles.quickToggleLabel, { color: theme.text }]}>
                Dark Mode
              </Text>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            <Text
              style={[styles.subsectionTitle, { color: theme.textSecondary }]}
            >
              Theme Options
            </Text>

            {themeOptions.map((option, index) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor:
                      currentTheme === option.key
                        ? theme.primaryLight
                        : 'transparent',
                    borderColor:
                      currentTheme === option.key
                        ? theme.primary
                        : theme.border,
                  },
                  index < themeOptions.length - 1 && styles.themeOptionBorder,
                ]}
                onPress={() => setTheme(option.key as any)}
              >
                <View style={styles.themeOptionLeft}>
                  <View
                    style={[
                      styles.themeIconContainer,
                      {
                        backgroundColor:
                          currentTheme === option.key
                            ? theme.primary
                            : theme.inputBackground,
                      },
                    ]}
                  >
                    <option.icon
                      color={
                        currentTheme === option.key
                          ? '#FFFFFF'
                          : theme.textSecondary
                      }
                      size={20}
                    />
                  </View>
                  <View style={styles.themeOptionText}>
                    <Text
                      style={[
                        styles.themeOptionLabel,
                        {
                          color:
                            currentTheme === option.key
                              ? theme.primaryDark
                              : theme.text,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text
                      style={[
                        styles.themeOptionDescription,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {option.description}
                    </Text>
                  </View>
                </View>
                {currentTheme === option.key && (
                  <View
                    style={[
                      styles.selectedIndicator,
                      { backgroundColor: theme.primary },
                    ]}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            About Theme
          </Text>
          <View
            style={[
              styles.infoCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              The app uses a green-based color scheme that adapts to your
              selected theme preference. System theme automatically switches
              between light and dark modes based on your device settings.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  sectionContent: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  quickToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  quickToggleLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  themeOptionBorder: {
    marginBottom: 12,
  },
  themeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  themeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  themeOptionText: {
    flex: 1,
  },
  themeOptionLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  themeOptionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
});
