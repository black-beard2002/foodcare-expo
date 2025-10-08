import { useEffect, useState, useRef } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import './global.css';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { AlertProvider } from '@/providers/AlertProvider';
import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { usePromoCodesStore } from '@/stores/promoCodesStore';
import { useLoyaltyStore } from '@/stores/loyaltyStore';
import { useReviewsStore } from '@/stores/reviewsStore';
import * as LocalAuthentication from 'expo-local-authentication';
import { useBudgetStore } from '@/stores/budgetStore';
import { useSearchHistoryStore } from '@/stores/searchHistoryStore';
import { useAuthStore } from '@/stores/authStore';
import CustomSplashScreen from '@/components/CustomSplashScreen';
import { useSettingsStore } from '@/stores/settingsStore';
import SecurityLockScreen from '@/components/SecurityLockScreen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const { isDark } = useTheme();
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showLockScreen, setShowLockScreen] = useState(false);
  const hasNavigated = useRef(false);

  // stores
  const loadUserFromStorage = useAuthStore(
    (state) => state.loadUserFromStorage
  );
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const onSecuritySuccess = () => {
    setShowLockScreen(false);
    setIsReady(true);
  };

  const handleBiometricRetry = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Fingerprint authentication',
      fallbackLabel: 'Use PIN instead',
    });
    return result.success;
  };

  // Load app data
  useEffect(() => {
    const prepareApp = async () => {
      try {
        await Promise.all([
          loadUserFromStorage(),
          loadSettings(),
          // ... other loads if needed
        ]);
      } catch (error) {
        console.error('Error loading app data:', error);
      } finally {
        setIsReady(true);
      }
    };
    prepareApp();
  }, []);

  // Handle navigation and lock screen
  useEffect(() => {
    const handleNavigation = async () => {
      if (hasNavigated.current) return;
      if (!isReady || (!fontsLoaded && !fontError)) return;

      try {
        await SplashScreen.hideAsync();
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const user = useAuthStore.getState().user;
        const hasCompletedOnboarding =
          useAuthStore.getState().hasCompletedOnboarding;
        const { biometricEnabled, pinEnabled, userPin } =
          useSettingsStore.getState();

        setShowSplash(false);

        if (biometricEnabled || pinEnabled) {
          console.log('biometric or pin enabled, showing lock screen');
          setShowLockScreen(true);
          return;
        }

        if (user && (hasCompletedOnboarding || user.has_completed_onboarding)) {
          router.replace('/(tabs)');
        } else {
          router.replace('/auth');
        }

        hasNavigated.current = true;
      } catch (error) {
        console.error('Error during navigation:', error);
        setShowSplash(false);
      }
    };

    handleNavigation();
  }, [isReady, fontsLoaded, fontError]);

  // SPLASH
  if (showSplash) {
    return <CustomSplashScreen />;
  }

  // LOCK SCREEN
  if (showLockScreen) {
    const { biometricEnabled, pinEnabled, userPin } =
      useSettingsStore.getState();
    return (
      <SecurityLockScreen
        pinEnabled={pinEnabled}
        userPin={userPin}
        biometricEnabled={biometricEnabled}
        onSuccess={onSecuritySuccess}
        onBiometricRetry={handleBiometricRetry}
      />
    );
  }

  // MAIN APP
  return (
    <>
      <AlertProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AlertProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}
