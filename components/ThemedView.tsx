import React from 'react';
import { View, ViewProps } from 'react-native';
import { useColorScheme } from 'react-native';

interface ThemedViewProps extends ViewProps {
  lightColor?: string;
  darkColor?: string;
}

export function ThemedView({
  style,
  lightColor = '#FFFFFF',
  darkColor = '#000000',
  ...props
}: ThemedViewProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? darkColor : lightColor;

  return <View style={[{ backgroundColor }, style]} {...props} />;
}