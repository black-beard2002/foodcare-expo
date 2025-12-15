import { useEffect, useState, useRef } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import './global.css';
import { useFonts } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { AlertProvider } from '@/providers/AlertProvider';
import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useSearchHistoryStore } from '@/stores/searchHistoryStore';
import { useAuthStore } from '@/stores/authStore';
import CustomSplashScreen from '@/components/CustomSplashScreen';
import { useSettingsStore } from '@/stores/settingsStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const { isDark } = useTheme();
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const hasNavigated = useRef(false);

  const [fontsLoaded, fontError] = useFonts({
    PoppinsLight: require('../assets/fonts/Poppins-Light.ttf'),
    PoppinsMedium: require('../assets/fonts/Poppins-Medium.ttf'),
    FredokaRegular: require('../assets/fonts/Fredoka-Regular.ttf'),
    FredokaMedium: require('../assets/fonts/Fredoka-Medium.ttf'),
    FredokaBold: require('../assets/fonts/Fredoka-Bold.ttf'),
    CherryBombOneRegular: require('../assets/fonts/CherryBombOne-Regular.ttf'),
    RougeScript: require('../assets/fonts/RougeScript-Regular.ttf'),
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
            useBudgetStore.getState().loadBudgetData?.(),
          ].filter(Boolean)
        );
        if (hasNavigated.current) return;
        if (!isReady || (!fontsLoaded && !fontError)) return;
        const { user, access_token, getUser } = useAuthStore.getState();

        const res = await getUser(user?.id!);

        // Simple navigation logic: if user exists, go to tabs, else go to auth
        if (res.success && access_token) {
          router.replace('/(tabs)');
        } else {
          await AsyncStorage.multiRemove([
            'user',
            'access_token',
            'refresh_token',
          ]).catch((error) =>
            console.error('Error clearing AsyncStorage:', error)
          );
          router.replace('/auth');
        }
        hasNavigated.current = true;
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
