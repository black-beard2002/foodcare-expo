import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, Mail, Apple, LogIn } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function AuthScreen() {
  const colorScheme = useColorScheme();

  const colors = {
    light: {
      background: '#FFFFFF',
      primary: '#FF6B35',
      secondary: '#4ECDC4',
      text: '#1A1A1A',
      textSecondary: '#666666',
      card: '#e4e2e2ff',
      border: '#E5E5EA',
    },
    dark: {
      background: '#000000',
      primary: '#FF6B35',
      secondary: '#4ECDC4',
      text: '#FFFFFF',
      textSecondary: '#8E8E93',
      card: '#1C1C1E',
      border: '#2C2C2E',
    },
  };

  const theme = colors[colorScheme ?? 'light'];

  return (
    <LinearGradient
      colors={
        colorScheme === 'dark'
          ? ['#123415ff', '#101010ff']
          : ['#45bc4fff', '#a6c0a8ff']
      }
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Welcome to FoodDeals
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Discover amazing offers from your favorite restaurants
          </Text>
        </View>

        <View style={styles.authButtons}>
          <TouchableOpacity
            style={[
              styles.authButton,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onPress={() => router.push('/auth/phone-login')}
          >
            <Phone color={theme.primary} size={24} />
            <Text style={[styles.authButtonText, { color: theme.text }]}>
              Continue with Phone
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.authButton,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onPress={() => {
              // Handle Google sign in
              console.log('Google sign in');
            }}
          >
            <Mail color={theme.secondary} size={24} />
            <Text style={[styles.authButtonText, { color: theme.text }]}>
              Continue with Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.authButton,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onPress={() => {
              // Handle Apple sign in
              console.log('Apple sign in');
            }}
          >
            <Apple color={theme.text} size={24} />
            <Text style={[styles.authButtonText, { color: theme.text }]}>
              Continue with Apple
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.skipButton]}
            onPress={() => router.replace('/(tabs)')}
          >
            <LogIn color={theme.textSecondary} size={20} />
            <Text
              style={[styles.skipButtonText, { color: theme.textSecondary }]}
            >
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.terms, { color: theme.textSecondary }]}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: height * 0.15,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  authButtons: {
    gap: 16,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  authButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
    marginTop: 24,
  },
  skipButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  terms: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 18,
  },
});
