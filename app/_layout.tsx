import { useEffect, useState } from 'react';
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

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const { isDark } = useTheme();
  const [isReady, setIsReady] = useState(false);

  const loadFavorites = useFavoritesStore((state) => state.loadFavorites);
  const loadUserFromStorage = useAuthStore(
    (state) => state.loadUserFromStorage
  );
  const loadRecentlyViewed = useRecentlyViewedStore(
    (state) => state.loadRecentlyViewed
  );
  const loadNotifications = useNotificationsStore(
    (state) => state.loadNotifications
  );
  const loadPreferences = useNotificationsStore(
    (state) => state.loadPreferences
  );
  const loadPromoCodes = usePromoCodesStore((state) => state.loadPromoCodes);
  const loadLoyaltyData = useLoyaltyStore((state) => state.loadLoyaltyData);
  const loadReviews = useReviewsStore((state) => state.loadReviews);
  const loadBudgetData = useBudgetStore((state) => state.loadBudgetData);
  const loadSearchHistory = useSearchHistoryStore(
    (state) => state.loadSearchHistory
  );
  const loadTrendingSearches = useSearchHistoryStore(
    (state) => state.loadTrendingSearches
  );
  const user = useAuthStore((state) => state.user);
  const hasCompletedOnboarding = useAuthStore(
    (state) => state.hasCompletedOnboarding
  );

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  // Wait for all loads and navigate accordingly
  useEffect(() => {
    const prepareApp = async () => {
      try {
        await Promise.all([
          loadFavorites(),
          loadRecentlyViewed(),
          loadNotifications(),
          loadPreferences(),
          loadPromoCodes(),
          loadLoyaltyData(),
          loadReviews(),
          loadBudgetData(),
          loadSearchHistory(),
          loadTrendingSearches(),
          loadUserFromStorage(),
        ]);
      } catch (error) {
        console.error('Error loading app data:', error);
      } finally {
        setIsReady(true);
      }
    };

    prepareApp();
  }, []);

  // Handle splash screen and navigation
  useEffect(() => {
    const handleNavigation = async () => {
      if (isReady && (fontsLoaded || fontError)) {
        await SplashScreen.hideAsync();
        // if (user) {
        //   if (hasCompletedOnboarding || user.has_completed_onboarding) {
        //     router.replace('/(tabs)');
        //   } else {
        //     router.replace('/auth');
        //   }
        // } else {
        //   router.replace('/auth');
        // }
      }
    };

    handleNavigation();
  }, [isReady, fontsLoaded, fontError, user, hasCompletedOnboarding]);

  if (!isReady || (!fontsLoaded && !fontError)) {
    return null;
  }

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
