import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  ColorValue,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, Apple, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { images } from '@/constants';
import { BlurView } from 'expo-blur';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path } from 'react-native-svg';

const { height, width } = Dimensions.get('window');

// Google Logo Component
const GoogleLogo = ({ size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
);

export default function AuthScreen() {
  const { theme, isDark } = useTheme();
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  // Button slide animations
  const button1SlideAnim = React.useRef(new Animated.Value(100)).current;
  const button2SlideAnim = React.useRef(new Animated.Value(100)).current;
  const button3SlideAnim = React.useRef(new Animated.Value(100)).current;
  const button4SlideAnim = React.useRef(new Animated.Value(100)).current;

  const button1OpacityAnim = React.useRef(new Animated.Value(0)).current;
  const button2OpacityAnim = React.useRef(new Animated.Value(0)).current;
  const button3OpacityAnim = React.useRef(new Animated.Value(0)).current;
  const button4OpacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Orb pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Button slide-up animations
    const animateButton = (
      slideAnim: Animated.AnimatedValue | Animated.AnimatedValueXY,
      opacityAnim: Animated.AnimatedValue | Animated.AnimatedValueXY,
      delay: number
    ) => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 600,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    };

    animateButton(button1SlideAnim, button1OpacityAnim, 300);
    animateButton(button2SlideAnim, button2OpacityAnim, 450);
    animateButton(button3SlideAnim, button3OpacityAnim, 600);
    animateButton(button4SlideAnim, button4OpacityAnim, 750);
  }, []);

  const accentGradient: [ColorValue, ColorValue, ColorValue] = isDark
    ? ['#8B5CF6', '#EC4899', '#F59E0B']
    : ['#7C3AED', '#DB2777', '#F59E0B'];
  const gradientColors: [ColorValue, ColorValue] = isDark
    ? ['rgba(15,23,42,1)', 'rgba(33,42,54,1)']
    : ['rgba(250,250,250,1)', 'rgba(226,232,240,1)'];

  return (
    <LinearGradient colors={gradientColors} className="flex-1">
      {/* Animated Background Orbs */}
      <View className="absolute inset-0 overflow-hidden">
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
            backgroundColor: isDark ? '#8B5CF680' : '#7C3AED40',
          }}
          className="absolute w-[300px] h-[300px] rounded-full opacity-60 -top-24 -right-12"
        />
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
            backgroundColor: isDark ? '#EC489980' : '#DB277740',
          }}
          className="absolute w-[250px] h-[250px] rounded-full opacity-60 -bottom-24 -left-20"
        />
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
            backgroundColor: isDark ? '#F59E0B80' : '#F59E0B40',
            top: height * 0.4,
          }}
          className="absolute w-[200px] h-[200px] rounded-full opacity-60 -right-16"
        />
      </View>

      <View
        className="flex-1 justify-between px-6 pb-10"
        style={{ paddingTop: height * 0.12 }}
      >
        {/* Header */}
        <View className="items-center">
          <View className="mb-8 shadow-lg shadow-black/30">
            <LinearGradient
              style={{ borderRadius: 12 }}
              colors={accentGradient}
            >
              <Image
                source={images.logo}
                className="w-32 h-32"
                resizeMode="contain"
              />
            </LinearGradient>
          </View>

          <View className="items-center mb-4">
            <Text
              className="text-4xl font-bold text-center leading-[44px]"
              style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}
            >
              Welcome to{'\n'}
            </Text>
            <MaskedView
              maskElement={
                <Text className="text-4xl font-bold">FoodDeals</Text>
              }
            >
              <LinearGradient
                colors={accentGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text className="text-4xl font-bold opacity-0">FoodDeals</Text>
              </LinearGradient>
            </MaskedView>
          </View>

          <View className="flex-row items-center gap-2">
            <Sparkles color={isDark ? '#A78BFA' : '#7C3AED'} size={16} />
            <Text
              className="text-base font-medium text-center"
              style={{ color: isDark ? '#CBD5E1' : '#475569' }}
            >
              Discover exclusive deals & save big
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View className="gap-3.5">
          {/* Phone Button */}
          <Animated.View
            style={{
              opacity: button1OpacityAnim,
              transform: [{ translateY: button1SlideAnim }],
            }}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/auth/phone-login')}
              className="rounded-lg"
            >
              <LinearGradient
                colors={accentGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex-row items-center justify-center px-6 py-4 gap-3 shadow-lg"
                style={{ borderRadius: 16 }} // Tailwind 'rounded-xl' = 16
              >
                <View className="w-10 h-10 rounded-lg items-center justify-center">
                  <Phone color="#FFFFFF" size={22} strokeWidth={2.5} />
                </View>
                <Text className="text-white text-lg font-semibold text-center flex-1">
                  Continue with Phone
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Google Button */}
          <Animated.View
            style={{
              opacity: button2OpacityAnim,
              transform: [{ translateY: button2SlideAnim }],
            }}
          >
            <TouchableOpacity activeOpacity={0.8}>
              <BlurView
                intensity={isDark ? 30 : 80}
                tint={isDark ? 'dark' : 'light'}
                className="flex-row items-center justify-center px-6 py-4 rounded-xl gap-3 border overflow-hidden"
                style={{
                  backgroundColor: isDark ? '#FFFFFF15' : '#FFFFFF80',
                  borderColor: isDark ? '#FFFFFF20' : '#00000010',
                }}
              >
                <View
                  className="w-10 h-10 rounded-lg items-center justify-center"
                  style={{
                    backgroundColor: isDark ? '#FFFFFF15' : '#FFFFFF',
                  }}
                >
                  <GoogleLogo size={22} />
                </View>
                <Text
                  className="text-lg font-semibold text-center flex-1"
                  style={{ color: isDark ? '#FFFFFF' : '#1F2937' }}
                >
                  Continue with Google
                </Text>
              </BlurView>
            </TouchableOpacity>
          </Animated.View>

          {/* Apple Button */}
          <Animated.View
            style={{
              opacity: button3OpacityAnim,
              transform: [{ translateY: button3SlideAnim }],
            }}
          >
            <TouchableOpacity activeOpacity={0.8}>
              <BlurView
                intensity={isDark ? 30 : 80}
                tint={isDark ? 'dark' : 'light'}
                className="flex-row items-center justify-center px-6 py-4 rounded-xl gap-3 border overflow-hidden"
                style={{
                  backgroundColor: isDark ? '#FFFFFF15' : '#FFFFFF80',
                  borderColor: isDark ? '#FFFFFF20' : '#00000010',
                }}
              >
                <View
                  className="w-10 h-10 rounded-lg items-center justify-center"
                  style={{
                    backgroundColor: isDark ? '#FFFFFF15' : '#FFFFFF',
                  }}
                >
                  <Apple
                    color={isDark ? '#FFFFFF' : '#1F2937'}
                    size={22}
                    strokeWidth={2.5}
                  />
                </View>
                <Text
                  className="text-lg font-semibold text-center flex-1"
                  style={{ color: isDark ? '#FFFFFF' : '#1F2937' }}
                >
                  Continue with Apple
                </Text>
              </BlurView>
            </TouchableOpacity>
          </Animated.View>

          {/* Skip Button */}
          <Animated.View
            style={{
              opacity: button4OpacityAnim,
              transform: [{ translateY: button4SlideAnim }],
            }}
          >
            <TouchableOpacity
              className="items-center justify-center py-4 mt-2"
              onPress={() => router.replace('/(tabs)')}
              activeOpacity={0.7}
            >
              <Text
                className="text-sm font-medium"
                style={{ color: isDark ? '#94A3B8' : '#64748B' }}
              >
                Skip for now
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Footer */}
        <View className="items-center gap-4">
          <View
            className="w-16 h-1 rounded-sm"
            style={{ backgroundColor: isDark ? '#FFFFFF15' : '#00000010' }}
          />
          <Text
            className="text-xs text-center leading-5"
            style={{ color: isDark ? '#64748B' : '#94A3B8' }}
          >
            By continuing, you agree to our{' '}
            <Text
              className="font-semibold"
              style={{ color: isDark ? '#A78BFA' : '#7C3AED' }}
            >
              Terms
            </Text>{' '}
            &{' '}
            <Text
              className="font-semibold"
              style={{ color: isDark ? '#A78BFA' : '#7C3AED' }}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}
