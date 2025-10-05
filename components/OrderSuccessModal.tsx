import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { CheckCircle, Copy } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAlert } from '@/providers/AlertProvider';
import { router } from 'expo-router';

interface OrderSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  orderNumber: string;
  customerInfo: {
    name: string;
    phone: string;
    pickupTime?: string;
    specialInstructions?: string;
  };
}

export default function OrderSuccessModal({
  visible,
  onClose,
  orderNumber,
  customerInfo,
}: OrderSuccessModalProps) {
  const { theme } = useTheme();
  const { showAlert } = useAlert();

  const handleCopyOrderNumber = async () => {
    await Clipboard.setStringAsync(orderNumber);
    showAlert(
      'Copied!',
      `Order ID ${orderNumber} copied to clipboard.`,
      'success'
    );
  };

  const handleClose = () => {
    onClose();
    router.replace('/(tabs)');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-center items-center px-5 bg-black/50">
        <View
          className="w-full max-w-sm rounded-3xl p-6"
          style={{ backgroundColor: theme.card }}
        >
          {/* Success Icon */}
          <View className="items-center mb-4">
            <View
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: theme.successLight }}
            >
              <CheckCircle color={theme.success} size={40} />
            </View>
          </View>

          {/* Title */}
          <Text
            className="text-2xl font-bold text-center mb-1"
            style={{ color: theme.text }}
          >
            Order Reserved!
          </Text>
          <Text
            className="text-sm text-center mb-5"
            style={{ color: theme.textSecondary }}
          >
            Your order has been successfully placed
          </Text>

          {/* Order Number */}
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl mb-4"
            style={{ backgroundColor: theme.card }}
            onPress={handleCopyOrderNumber}
            activeOpacity={0.7}
          >
            <Text
              className="text-lg font-bold tracking-wider"
              style={{ color: theme.primary }}
            >
              {orderNumber}
            </Text>
            <Copy size={18} color={theme.primary} />
          </TouchableOpacity>

          {/* Customer Info */}
          <View
            className="rounded-2xl p-4 mb-4 gap-2.5"
            style={{ backgroundColor: theme.backgroundSecondary }}
          >
            <InfoRow label="Name" value={customerInfo.name} theme={theme} />
            <InfoRow label="Phone" value={customerInfo.phone} theme={theme} />

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
                  style={{ color: theme.textSecondary }}
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

          {/* Note */}
          <View
            className="rounded-xl py-2.5 px-3 mb-4"
            style={{ backgroundColor: theme.warningLight }}
          >
            <Text
              className="text-xs font-semibold text-center"
              style={{ color: theme.warning }}
            >
              📸 Screenshot to show at restaurant
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="gap-2">
            <TouchableOpacity
              className="py-3.5 rounded-xl items-center"
              style={{ backgroundColor: theme.primary }}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text className="text-white text-base font-semibold">Done</Text>
            </TouchableOpacity>

            <TouchableOpacity
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
                className="text-base font-semibold"
                style={{ color: theme.textSecondary }}
              >
                View Order History
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
      <Text className="text-xs" style={{ color: theme.textSecondary }}>
        {label}
      </Text>
      <Text className="text-sm font-semibold" style={{ color: theme.text }}>
        {value}
      </Text>
    </View>
  );
}
