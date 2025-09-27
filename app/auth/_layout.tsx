import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="phone-login" />
      <Stack.Screen name="otp-verification" />
      <Stack.Screen name="setup-security" />
    </Stack>
  );
}
