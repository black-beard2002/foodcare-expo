import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, Mail, Apple, LogIn } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { images } from '@/constants';
const { height } = Dimensions.get('window');

export default function AuthScreen() {
  const { theme, isDark } = useTheme();
  return (
    <LinearGradient
      colors={[theme.primary, isDark ? theme.primaryDark : theme.primaryLight]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Welcome to FoodDeals
          </Text>
          <Image
            source={images.logo}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Discover amazing offers from your favorite restaurants
          </Text>
        </View>

        <View style={styles.authButtons}>
          <TouchableOpacity
            style={[
              styles.authButton,
              { backgroundColor: theme.primary, borderColor: theme.border },
            ]}
            onPress={() => router.push('/auth/phone-login')}
          >
            <Phone color={theme.secondaryDark} size={24} />
            <Text style={[styles.authButtonText, { color: theme.text }]}>
              Continue with Phone
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.authButton,
              { backgroundColor: theme.primary, borderColor: theme.border },
            ]}
            onPress={() => {
              // Handle Google sign in
              console.log('Google sign in');
            }}
          >
            <Mail color={theme.secondaryDark} size={24} />
            <Text style={[styles.authButtonText, { color: theme.text }]}>
              Continue with Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.authButton,
              { backgroundColor: theme.primary, borderColor: theme.border },
            ]}
            onPress={() => {
              // Handle Apple sign in
              console.log('Apple sign in');
            }}
          >
            <Apple color={theme.secondaryDark} size={24} />
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
  logo: {
    width: 200,
    height: 200,
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
