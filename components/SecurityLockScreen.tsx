import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Fingerprint, Lock, Delete } from 'lucide-react-native';

interface SecurityLockScreenProps {
  pinEnabled: boolean;
  userPin: string;
  biometricEnabled: boolean;
  onSuccess: () => void;
  onBiometricRetry: () => Promise<boolean>;
}

export default function SecurityLockScreen({
  pinEnabled,
  userPin,
  biometricEnabled,
  onSuccess,
  onBiometricRetry,
}: SecurityLockScreenProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const shakeAnimation = new Animated.Value(0);

  const maxAttempts = 5;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNumberPress = (num: string) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      setError('');

      // Auto-verify when PIN is complete
      if (newPin.length === userPin.length) {
        setTimeout(() => verifyPin(newPin), 100);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const verifyPin = (enteredPin: string) => {
    if (enteredPin === userPin) {
      setError('');
      onSuccess();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPin('');
      shake();
      Vibration.vibrate(400);

      if (newAttempts >= maxAttempts) {
        setError('Too many attempts. Please try biometric authentication.');
      } else {
        setError(
          `Incorrect PIN. ${maxAttempts - newAttempts} attempts remaining.`
        );
      }
    }
  };

  const handleBiometricRetry = async () => {
    const success = await onBiometricRetry();
    if (success) {
      onSuccess();
    } else {
      setError('Biometric authentication failed. Please enter your PIN.');
    }
  };

  const renderPinDots = () => {
    const pinLength = userPin.length;
    return (
      <View className="flex-row gap-1 mb-12">
        {Array.from({ length: pinLength }).map((_, index) => (
          <View
            key={index}
            className={`w-4 h-4 rounded-full ${
              index < pin.length ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </View>
    );
  };

  const renderNumberPad = () => {
    const numbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'delete'],
    ];

    return (
      <View className="w-full max-w-sm">
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row justify-center mb-4">
            {row.map((num, index) => {
              if (num === '') {
                return (
                  <View
                    key={`${rowIndex}-${index}`}
                    className="w-20 h-20 mx-2"
                  />
                );
              }

              if (num === 'delete') {
                return (
                  <TouchableOpacity
                    key={`${rowIndex}-${index}`}
                    onPress={handleDelete}
                    className="w-20 h-20 mx-2 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
                    disabled={pin.length === 0}
                  >
                    <Delete
                      size={28}
                      color={pin.length === 0 ? '#ffffff60' : '#ffffff'}
                    />
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={`${rowIndex}-${index}`}
                  onPress={() => handleNumberPress(num)}
                  className="w-20 h-20 mx-2 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
                >
                  <Text className="text-white text-3xl font-semibold">
                    {num}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
      }}
    >
      {/* Lock Icon */}
      <View className="mb-8">
        <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center">
          <Lock size={40} color="#ffffff" />
        </View>
      </View>

      {/* Title */}
      <Text className="text-white text-2xl font-bold mb-2">Enter Your PIN</Text>
      <Text className="text-white/70 text-sm mb-8 text-center">
        {pinEnabled
          ? 'Enter your PIN to unlock the app'
          : 'Security check required'}
      </Text>

      {/* PIN Dots */}
      <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
        {renderPinDots()}
      </Animated.View>

      {/* Error Message */}
      {error && (
        <View className="mb-6 px-6">
          <Text className="text-red-200 text-sm text-center font-medium">
            {error}
          </Text>
        </View>
      )}

      {/* Number Pad */}
      {renderNumberPad()}

      {/* Biometric Option */}
      {biometricEnabled && attempts < maxAttempts && (
        <TouchableOpacity
          onPress={handleBiometricRetry}
          className="mt-8 flex-row items-center gap-2 py-3 px-6 bg-white/10 rounded-full active:bg-white/20"
        >
          <Fingerprint size={24} color="#ffffff" />
          <Text className="text-white font-semibold">Use Biometric</Text>
        </TouchableOpacity>
      )}

      {/* Bottom Text */}
      <View className="absolute bottom-12">
        <Text className="text-white/50 text-xs text-center">
          Your data is protected
        </Text>
      </View>
    </LinearGradient>
  );
}
