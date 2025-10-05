import { useEffect } from 'react';
import { Stack } from 'expo-router';
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
import { useAppStore } from '@/stores/appStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { usePromoCodesStore } from '@/stores/promoCodesStore';
import { useLoyaltyStore } from '@/stores/loyaltyStore';
import { useReviewsStore } from '@/stores/reviewsStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useSearchHistoryStore } from '@/stores/searchHistoryStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const { isDark } = useTheme();

  const loadCart = useAppStore((state) => state.loadCart);
  const loadFavorites = useFavoritesStore((state) => state.loadFavorites);
  const loadRecentlyViewed = useRecentlyViewedStore((state) => state.loadRecentlyViewed);
  const loadNotifications = useNotificationsStore((state) => state.loadNotifications);
  const loadPreferences = useNotificationsStore((state) => state.loadPreferences);
  const loadPromoCodes = usePromoCodesStore((state) => state.loadPromoCodes);
  const loadLoyaltyData = useLoyaltyStore((state) => state.loadLoyaltyData);
  const loadReviews = useReviewsStore((state) => state.loadReviews);
  const loadBudgetData = useBudgetStore((state) => state.loadBudgetData);
  const loadSearchHistory = useSearchHistoryStore((state) => state.loadSearchHistory);
  const loadTrendingSearches = useSearchHistoryStore((state) => state.loadTrendingSearches);

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    loadCart();
    loadFavorites();
    loadRecentlyViewed();
    loadNotifications();
    loadPreferences();
    loadPromoCodes();
    loadLoyaltyData();
    loadReviews();
    loadBudgetData();
    loadSearchHistory();
    loadTrendingSearches();
  }, []);

  if (!fontsLoaded && !fontError) {
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
      {/* 👇 Configure status bar manually */}
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}
