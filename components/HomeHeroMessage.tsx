import { ColorTheme } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, View, Text } from 'moti';
import React, { useEffect } from 'react';
import { Dimensions } from 'react-native';
import ReanimatedAnimated from 'react-native-reanimated';
import {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
// Luxurious Hero Message Component
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HomeHeroMessage = ({ theme }: { theme: ColorTheme }) => {
  const shimmer = useSharedValue(0);
  const float = useSharedValue(0);

  useEffect(() => {
    // Shimmer animation
    shimmer.value = withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.linear }),
      -1,
      false
    );

    // Floating animation
    float.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            shimmer.value,
            [0, 1],
            [-SCREEN_WIDTH, SCREEN_WIDTH]
          ),
        },
      ],
    };
  });

  const floatStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: float.value }],
    };
  });

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        delay: 200,
        damping: 15,
      }}
      style={{
        paddingHorizontal: 30,
        paddingVertical: 24,
        marginBottom: 20,
        overflow: 'hidden',
      }}
    >
      <ReanimatedAnimated.View style={[floatStyle]}>
        <View
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 24,
            backgroundColor: theme.card,
            padding: 24,
            shadowColor: theme.shadow,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 20,
            elevation: 8,
          }}
        >
          {/* Shimmer overlay */}
          <ReanimatedAnimated.View
            style={[
              shimmerStyle,
              {
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: SCREEN_WIDTH,
                backgroundColor: 'transparent',
              },
            ]}
          >
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.15)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          </ReanimatedAnimated.View>

          {/* Decorative corner elements */}
          <View
            style={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: theme.primary + '17',
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: theme.primary + '10',
            }}
          />

          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              delay: 400,
              damping: 12,
            }}
          >
            <Text
              style={{
                fontSize: 33,
                fontFamily: 'CherryBombOneRegular',
                color: theme.text,
                textAlign: 'center',
                lineHeight: 36,
                letterSpacing: 0.3,
              }}
            >
              Too good to waste,{'\n'}
              <Text
                style={{
                  color: theme.primary,
                  fontSize: 20,
                }}
              >
                too delicious to miss
              </Text>
            </Text>
          </MotiView>
        </View>
      </ReanimatedAnimated.View>
    </MotiView>
  );
};

export default HomeHeroMessage;
