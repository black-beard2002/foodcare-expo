import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { CheckCircle, Copy, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAlert } from '@/providers/AlertProvider';
import { router } from 'expo-router';

interface OrderSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  customerInfo: {
    name?: string;
    email: string;
    pickupTime?: string;
    specialInstructions?: string;
  };
}

export default function OrderSuccessModal({
  visible,
  onClose,
  customerInfo,
}: OrderSuccessModalProps) {
  const { theme } = useTheme();
  const { showAlert } = useAlert();

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(30)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const sparkle1 = useRef(new Animated.Value(0)).current;
  const sparkle2 = useRef(new Animated.Value(0)).current;
  const sparkle3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset all animations
      scaleAnim.setValue(0.3);
      fadeAnim.setValue(0);
      iconScale.setValue(0);
      iconRotate.setValue(0);
      contentSlide.setValue(30);
      contentOpacity.setValue(0);
      sparkle1.setValue(0);
      sparkle2.setValue(0);
      sparkle3.setValue(0);

      // Start animation sequence
      Animated.sequence([
        // 1. Modal appears with scale and fade
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        // 2. Success icon bounces in with rotation
        Animated.parallel([
          Animated.spring(iconScale, {
            toValue: 1,
            friction: 6,
            tension: 50,
            useNativeDriver: true,
          }),
          Animated.spring(iconRotate, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
        // 3. Sparkles animate
        Animated.parallel([
          Animated.timing(sparkle1, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(sparkle2, {
            toValue: 1,
            duration: 600,
            delay: 100,
            useNativeDriver: true,
          }),
          Animated.timing(sparkle3, {
            toValue: 1,
            duration: 600,
            delay: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Content slides up independently
      Animated.parallel([
        Animated.timing(contentSlide, {
          toValue: 0,
          duration: 500,
          delay: 400,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          delay: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    onClose();
    router.replace('/(tabs)');
  };

  const rotation = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Sparkle positions
  const sparkle1Translate = sparkle1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -40],
  });
  const sparkle2Translate = sparkle2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -35],
  });
  const sparkle3Translate = sparkle3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-center items-center px-5 bg-black/50">
        <Animated.View
          className="w-full max-w-sm rounded-3xl p-6 overflow-visible"
          style={{
            backgroundColor: theme.card,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          {/* Success Icon with Sparkles */}
          <View className="items-center mb-4 relative">
            {/* Sparkle 1 - Top Left */}
            <Animated.View
              className="absolute"
              style={{
                top: 0,
                left: '25%',
                opacity: sparkle1,
                transform: [{ translateY: sparkle1Translate }],
              }}
            >
              <Sparkles color={theme.warning} size={20} fill={theme.warning} />
            </Animated.View>

            {/* Sparkle 2 - Top Right */}
            <Animated.View
              className="absolute"
              style={{
                top: 5,
                right: '25%',
                opacity: sparkle2,
                transform: [{ translateY: sparkle2Translate }],
              }}
            >
              <Sparkles color={theme.primary} size={16} fill={theme.primary} />
            </Animated.View>

            {/* Sparkle 3 - Top Center */}
            <Animated.View
              className="absolute"
              style={{
                top: -5,
                left: '48%',
                opacity: sparkle3,
                transform: [{ translateY: sparkle3Translate }],
              }}
            >
              <Sparkles color={theme.success} size={18} fill={theme.success} />
            </Animated.View>

            {/* Main Success Icon */}
            <Animated.View
              className="w-20 h-20 rounded-full items-center justify-center"
              style={{
                backgroundColor: theme.successLight,
                transform: [{ scale: iconScale }, { rotate: rotation }],
              }}
            >
              <CheckCircle color={theme.success} size={48} strokeWidth={2.5} />
            </Animated.View>
          </View>

          {/* Animated Content */}
          <Animated.View
            style={{
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
            }}
          >
            {/* Title */}
            <Text
              className="text-2xl  text-center mb-1"
              style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
            >
              Order Reserved!
            </Text>
            <Text
              className="text-sm text-center mb-5"
              style={{ color: theme.textSecondary, fontFamily: 'PoppinsLight' }}
            >
              Your order has been successfully placed
            </Text>

            {/* Customer Info */}
            <View
              className="rounded-2xl p-4 mb-4 gap-2.5"
              style={{ backgroundColor: theme.backgroundSecondary }}
            >
              <InfoRow
                label="Name"
                value={customerInfo.name ?? ''}
                theme={theme}
              />
              <InfoRow label="Email" value={customerInfo.email} theme={theme} />

              {customerInfo.pickupTime && (
                <InfoRow
                  label="Pickup"
                  value={customerInfo.pickupTime}
                  theme={theme}
                />
              )}

              {customerInfo.specialInstructions && (
                <View className="gap-1 pt-1">
                  <Text
                    className="text-xs"
                    style={{
                      color: theme.textSecondary,
                      fontFamily: 'PoppinsMedium',
                    }}
                  >
                    Instructions
                  </Text>
                  <Text
                    className="text-sm leading-5"
                    style={{ color: theme.text }}
                  >
                    {customerInfo.specialInstructions}
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View className="gap-2">
              <TouchableOpacity
                className="py-3.5 rounded-xl items-center"
                style={{
                  backgroundColor: theme.primary,
                  shadowColor: theme.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
                onPress={handleClose}
                activeOpacity={0.8}
              >
                <Text
                  className="text-white text-base"
                  style={{ fontFamily: 'FredokaMedium' }}
                >
                  Done
                </Text>
              </TouchableOpacity>

              {/* <TouchableOpacity
                className="py-3.5 rounded-xl items-center border"
                style={{
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                }}
                onPress={() => {
                  onClose();
                  router.push('/(tabs)/order_history');
                }}
                activeOpacity={0.7}
              >
                <Text
                  className="text-base"
                  style={{
                    color: theme.textSecondary,
                    fontFamily: 'FredokaMedium',
                  }}
                >
                  Track Order
                </Text>
              </TouchableOpacity> */}
            </View>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Helper component for info rows
function InfoRow({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: any;
}) {
  return (
    <View className="flex-row justify-between items-center">
      <Text
        className="text-xs"
        style={{ color: theme.textSecondary, fontFamily: 'PoppinsMedium' }}
      >
        {label}
      </Text>
      <Text
        className="text-sm"
        style={{ color: theme.text, fontFamily: 'PoppinsMedium' }}
      >
        {value}
      </Text>
    </View>
  );
}
