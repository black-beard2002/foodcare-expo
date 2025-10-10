import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Fingerprint, Lock, Delete, KeyRound } from 'lucide-react-native';

interface SecurityLockScreenProps {
  pinEnabled: boolean;
  userPin: string;
  biometricEnabled: boolean;
  onSuccess: () => void;
  onBiometricAuth: () => Promise<boolean>;
}

export default function SecurityLockScreen({
  pinEnabled,
  userPin,
  biometricEnabled,
  onSuccess,
  onBiometricAuth,
}: SecurityLockScreenProps) {
  const [showPinPad, setShowPinPad] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [isBiometricAuthenticating, setIsBiometricAuthenticating] =
    useState(false);
  const shakeAnimation = new Animated.Value(0);

  const maxAttempts = 5;
  const lockoutDuration = 30; // seconds

  // Try biometric auth on mount if enabled
  useEffect(() => {
    if (biometricEnabled && !showPinPad && !isBiometricAuthenticating) {
      attemptBiometricAuth();
    }
  }, [biometricEnabled]);

  // Handle lockout timer
  useEffect(() => {
    if (lockoutTimer > 0) {
      const timer = setTimeout(() => {
        setLockoutTimer(lockoutTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (lockoutTimer === 0 && isLocked) {
      setIsLocked(false);
      setAttempts(0);
      setError('');
    }
  }, [lockoutTimer, isLocked]);

  const attemptBiometricAuth = async () => {
    if (isLocked) {
      setError('Account is locked. Please wait for the timer to expire.');
      return;
    }

    setIsBiometricAuthenticating(true);
    setError('');

    try {
      const success = await onBiometricAuth();

      if (success) {
        console.log('Biometric authentication successful');
        onSuccess();
      } else {
        // User canceled or failed biometric
        console.log('Biometric authentication failed or canceled');
        setShowPinPad(true);
        setError('');
      }
    } catch (error) {
      console.error('Biometric error:', error);
      setShowPinPad(true);
      setError('');
    } finally {
      setIsBiometricAuthenticating(false);
    }
  };

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
    if (isLocked) return;

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
    if (isLocked) return;
    setPin(pin.slice(0, -1));
    setError('');
  };

  const verifyPin = (enteredPin: string) => {
    console.log('Verifying PIN...');
    console.log('Entered:', enteredPin, 'Expected:', userPin);

    if (enteredPin === userPin) {
      // SUCCESS
      console.log('PIN verification successful');
      setError('');
      setAttempts(0);
      setPin('');
      onSuccess();
    } else {
      // FAILURE
      console.log('PIN verification failed');
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPin('');
      shake();
      Vibration.vibrate(400);

      if (newAttempts >= maxAttempts) {
        // Too many attempts - lockout
        setIsLocked(true);
        setLockoutTimer(lockoutDuration);
        setError(`Too many attempts. Try again in ${lockoutDuration} seconds.`);
      } else {
        setError(
          `Incorrect PIN. ${maxAttempts - newAttempts} attempt${
            maxAttempts - newAttempts !== 1 ? 's' : ''
          } remaining.`
        );
      }
    }
  };

  const handleUsePinInstead = () => {
    setShowPinPad(true);
    setError('');
  };

  const handleRetryBiometric = () => {
    setShowPinPad(false);
    setError('');
    attemptBiometricAuth();
  };

  const renderPinDots = () => {
    const pinLength = userPin.length || 4; // Default to 4 if not set
    return (
      <View className="flex-row gap-3 mb-12">
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
                    className={`w-20 h-20 mx-2 items-center justify-center rounded-full ${
                      isLocked ? 'bg-white/5' : 'bg-white/10 active:bg-white/20'
                    }`}
                    disabled={pin.length === 0 || isLocked}
                  >
                    <Delete
                      size={28}
                      color={
                        pin.length === 0 || isLocked ? '#ffffff40' : '#ffffff'
                      }
                    />
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={`${rowIndex}-${index}`}
                  onPress={() => handleNumberPress(num)}
                  className={`w-20 h-20 mx-2 items-center justify-center rounded-full ${
                    isLocked ? 'bg-white/5' : 'bg-white/10 active:bg-white/20'
                  }`}
                  disabled={isLocked}
                >
                  <Text
                    className={`text-3xl font-semibold ${
                      isLocked ? 'text-white/40' : 'text-white'
                    }`}
                  >
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

  // Show biometric prompt screen
  if (!showPinPad && biometricEnabled) {
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
        {/* Fingerprint Icon */}
        <View className="mb-8">
          <View className="w-24 h-24 bg-white/20 rounded-full items-center justify-center">
            <Fingerprint size={48} color="#ffffff" />
          </View>
        </View>

        {/* Title */}
        <Text className="text-white text-2xl font-bold mb-2">
          Biometric Authentication
        </Text>
        <Text className="text-white/70 text-base mb-12 text-center px-6">
          {isBiometricAuthenticating
            ? 'Authenticating...'
            : 'Use your fingerprint or face to unlock'}
        </Text>

        {/* Error Message */}
        {error && (
          <View className="mb-6 px-6">
            <Text className="text-red-200 text-sm text-center font-medium">
              {error}
            </Text>
          </View>
        )}

        {/* Retry Biometric Button */}
        {!isBiometricAuthenticating && (
          <TouchableOpacity
            onPress={attemptBiometricAuth}
            className="mb-4 flex-row items-center gap-2 py-4 px-8 bg-white/10 rounded-full active:bg-white/20"
            disabled={isLocked}
          >
            <Fingerprint size={24} color="#ffffff" />
            <Text className="text-white font-semibold text-base">
              Try Biometric Again
            </Text>
          </TouchableOpacity>
        )}

        {/* Use PIN Instead Button */}
        {pinEnabled && !isLocked && (
          <TouchableOpacity
            onPress={handleUsePinInstead}
            className="mt-4 flex-row items-center gap-2 py-4 px-8 bg-white/5 rounded-full active:bg-white/10"
          >
            <KeyRound size={24} color="#ffffff" />
            <Text className="text-white font-semibold text-base">
              Use PIN Instead
            </Text>
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

  // Show PIN pad screen
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
      <Text className="text-white text-2xl font-bold mb-2">
        {isLocked ? 'Account Locked' : 'Enter Your PIN'}
      </Text>
      <Text className="text-white/70 text-sm mb-8 text-center px-6">
        {isLocked
          ? `Please wait ${lockoutTimer} seconds before trying again`
          : 'Enter your PIN to unlock the app'}
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

      {/* Back to Biometric Button */}
      {biometricEnabled && !isLocked && (
        <TouchableOpacity
          onPress={handleRetryBiometric}
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
