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
import { useBudgetStore } from '@/stores/budgetStore';
import { useSearchHistoryStore } from '@/stores/searchHistoryStore';
import { useAuthStore } from '@/stores/authStore';
import CustomSplashScreen from '@/components/CustomSplashScreen';
import { useSettingsStore } from '@/stores/settingsStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const { isDark } = useTheme();
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const hasNavigated = useRef(false);

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  // Load app data
  useEffect(() => {
    const prepareApp = async () => {
      try {
        await Promise.all(
          [
            useAuthStore.getState().loadUserFromStorage(),
            useSettingsStore.getState().loadSettings(),
            useFavoritesStore.getState().loadFavorites?.(),
            useRecentlyViewedStore.getState().loadRecentlyViewed?.(),
            useSearchHistoryStore.getState().loadSearchHistory?.(),
            useNotificationsStore.getState().loadNotifications?.(),
            usePromoCodesStore.getState().loadPromoCodes?.(),
            useLoyaltyStore.getState().loadLoyaltyData?.(),
            useReviewsStore.getState().loadReviews?.(),
            useBudgetStore.getState().loadBudgetData?.(),
          ].filter(Boolean)
        );
      } catch (error) {
        console.error('Error loading app data:', error);
      } finally {
        setIsReady(true);
        setShowSplash(false);
        SplashScreen.hideAsync();
      }
    };
    prepareApp();
  }, []);

  // Handle navigation
  useEffect(() => {
    const handleNavigation = async () => {
      if (hasNavigated.current) return;
      if (!isReady || (!fontsLoaded && !fontError)) return;

      try {
        const authState = useAuthStore.getState();
        const user = authState.user;

        // Simple navigation logic: if user exists, go to tabs, else go to auth
        if (user) {
          router.replace('/(tabs)');
        } else {
          router.replace('/auth');
        }

        hasNavigated.current = true;
      } catch (error) {
        console.error('Error during navigation:', error);
      }
    };

    handleNavigation();
  }, [isReady, fontsLoaded, fontError]);

  // SPLASH SCREEN
  if (showSplash) {
    return <CustomSplashScreen />;
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
