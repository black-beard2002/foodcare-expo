import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { images } from '@/constants';

export default function CustomSplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const dotsAnim = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    // Logo animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Rotating animation for the outer ring
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Loading dots animation
    const animateDots = () => {
      Animated.stagger(
        150,
        dotsAnim.map((anim) =>
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        )
      ).start(() => animateDots());
    };

    animateDots();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Animated background circles */}
      <View className="absolute inset-0 items-center justify-center">
        <Animated.View
          style={{
            transform: [{ rotate: spin }],
            opacity: 0.1,
          }}
          className="w-80 h-80 rounded-full border-4 border-white"
        />
        <Animated.View
          style={{
            transform: [{ rotate: spin }],
            opacity: 0.1,
          }}
          className="absolute w-64 h-64 rounded-full border-4 border-white"
        />
      </View>

      {/* Logo container */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
        className="items-center"
      >
        {/* Icon/Logo */}
        <View className="w-24 h-24 bg-white rounded-3xl items-center justify-center mb-6 shadow-2xl">
          <LinearGradient
            colors={['#a855f7', '#a852c8']}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 12,
              padding: 10,
            }}
          >
            <Image source={images.logo} className="w-full h-full" />
          </LinearGradient>
        </View>

        {/* App name */}
        <Text className="text-white text-3xl font-bold tracking-wide mb-2">
          FoodCare
        </Text>
        <Text className="text-white/80 text-sm tracking-widest">
          ORDER. EAT. ENJOY.
        </Text>
      </Animated.View>

      {/* Loading indicator */}
      <View className="absolute bottom-24 flex-row items-center space-x-2">
        {dotsAnim.map((anim, index) => (
          <Animated.View
            key={index}
            style={{
              opacity: anim,
              transform: [
                {
                  translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -10],
                  }),
                },
              ],
            }}
            className="w-3 h-3 bg-white rounded-full"
          />
        ))}
      </View>

      {/* Loading text */}
      <Animated.View
        style={{ opacity: fadeAnim }}
        className="absolute bottom-12"
      >
        <Text className="text-white/70 text-xs tracking-wider">
          Loading your experience...
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}
