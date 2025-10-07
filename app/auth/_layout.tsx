import { useTheme } from '@/hooks/useTheme';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
export default function AuthLayout() {
  const { isDark } = useTheme();
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="phone-login" />
        <Stack.Screen name="otp-verification" />
        <Stack.Screen name="setup-security" />
        <Stack.Screen name="onboarding-step-1" />
        <Stack.Screen name="onboarding-step-2" />
        <Stack.Screen name="onboarding-step-3" />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}
