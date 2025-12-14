import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import logo from '@/assets/images/logo.png';

type SplashProps = { isAnimating: boolean };

function PulseCircleSplash({ isAnimating }: SplashProps) {
  const { theme } = useTheme();

  // Create multiple pulse animations for layered effect
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const pulse3 = useRef(new Animated.Value(0)).current;
  const pulse4 = useRef(new Animated.Value(0)).current;

  // Fade in animation for logo and text
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start all pulse animations with delays for staggered effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse1, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse1, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(pulse2, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse2, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(1000),
        Animated.timing(pulse3, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse3, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(1500),
        Animated.timing(pulse4, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse4, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Interpolation for each pulse circle
  const createPulseInterpolation = (pulse: Animated.Value) => ({
    scale: pulse.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 3],
    }),
    opacity: pulse.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.8, 0.4, 0],
    }),
  });

  const pulse1Style = createPulseInterpolation(pulse1);
  const pulse2Style = createPulseInterpolation(pulse2);
  const pulse3Style = createPulseInterpolation(pulse3);
  const pulse4Style = createPulseInterpolation(pulse4);

  return (
    <View style={[styles.full, { backgroundColor: theme.background }]}>
      {/* Multiple pulsing circles */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            transform: [{ scale: pulse1Style.scale }],
            opacity: pulse1Style.opacity,
            borderColor: theme.primary,
            backgroundColor: theme.primary + '20', // Adding opacity
          },
        ]}
      />

      <Animated.View
        style={[
          styles.pulseRing,
          {
            transform: [{ scale: pulse2Style.scale }],
            opacity: pulse2Style.opacity,
            borderColor: theme.secondary,
            backgroundColor: theme.secondary + '20',
          },
        ]}
      />

      <Animated.View
        style={[
          styles.pulseRing,
          {
            transform: [{ scale: pulse3Style.scale }],
            opacity: pulse3Style.opacity,
            borderColor: theme.accent,
            backgroundColor: theme.accent + '20',
          },
        ]}
      />

      <Animated.View
        style={[
          styles.pulseRing,
          {
            transform: [{ scale: pulse4Style.scale }],
            opacity: pulse4Style.opacity,
            borderColor: theme.primary,
            backgroundColor: theme.primary + '20',
          },
        ]}
      />

      {/* Center content with fade animation */}
      <Animated.View
        style={[
          styles.centerContent,
          { opacity: fadeAnim, transform: [{ scale: fadeAnim }] },
        ]}
      >
        <View
          style={[styles.logoContainer, { backgroundColor: theme.primary }]}
        >
          <Image source={logo} style={{ width: '100%', height: '100%' }} />
        </View>

        <Text
          style={[
            styles.title,
            { color: theme.text, fontFamily: 'FredokaBold' },
          ]}
        >
          Food For Less
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: theme.textSecondary, fontFamily: 'FredokaMedium' },
          ]}
        >
          Find amazing deals near you
        </Text>
      </Animated.View>
    </View>
  );
}

export default function CustomSplashScreen() {
  const [isAnimating] = React.useState(true);

  return (
    <View style={styles.container}>
      <PulseCircleSplash isAnimating={isAnimating} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  full: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 42,
    letterSpacing: 1,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 8,
    letterSpacing: 0.5,
  },
});
