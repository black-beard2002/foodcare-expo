import React from 'react';
import { View, Text, TouchableOpacity, Modal, ColorValue } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { CircleSlash2, Copy, X } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAlert } from '@/providers/AlertProvider';
import { LinearGradient } from 'expo-linear-gradient';

interface OrderCancelModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  orderNumber: string;
}

export default function OrderCancelModal({
  visible,
  onConfirm,
  onCancel,
  orderNumber,
}: OrderCancelModalProps) {
  const { theme, isDark } = useTheme();
  const { showAlert } = useAlert();

  const handleCopyOrderNumber = async () => {
    await Clipboard.setStringAsync(orderNumber);
    showAlert(
      'Copied!',
      `Order ID ${orderNumber} copied to clipboard.`,
      'success'
    );
  };

  const gradientColors: [ColorValue, ColorValue] = isDark
    ? ['rgba(45, 45, 45, 0.95)', 'rgba(30, 30, 30, 0.98)']
    : ['rgba(255, 255, 255, 0.95)', 'rgba(250, 250, 250, 0.98)'];

  const warningGradient: [ColorValue, ColorValue] = isDark
    ? ['rgba(245, 158, 11, 0.9)', 'rgba(217, 119, 6, 0.95)']
    : ['rgba(251, 191, 36, 0.9)', 'rgba(245, 158, 11, 0.95)'];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/60 justify-center items-center p-6 md:p-8">
        <LinearGradient
          colors={gradientColors}
          className="w-full max-w-md rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
        >
          {/* Header with Close Button */}
          <View className="flex-row justify-between items-center p-6 border-b border-white/10">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-warning/20 items-center justify-center">
                <CircleSlash2 color={theme.warning} size={20} />
              </View>
              <Text
                className="text-lg font-inter-bold"
                style={{ color: theme.text }}
              >
                Cancel Order
              </Text>
            </View>
            <TouchableOpacity
              onPress={onCancel}
              className="w-8 h-8 rounded-full bg-white/5 items-center justify-center"
            >
              <X color={theme.textSecondary} size={18} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View className="p-6">
            {/* Warning Icon */}
            <View className="items-center mb-6">
              <LinearGradient
                colors={warningGradient}
                style={{ borderRadius: 15 }}
                className="w-20 h-20 items-center justify-center shadow-lg"
              >
                <CircleSlash2 color="#FFFFFF" size={36} />
              </LinearGradient>
            </View>

            {/* Title & Description */}
            <View className="items-center mb-6">
              <Text
                className="text-2xl font-inter-bold text-center mb-2"
                style={{ color: theme.text }}
              >
                Cancel This Order?
              </Text>
              <Text
                className="text-base font-inter-regular text-center leading-6"
                style={{ color: theme.textSecondary }}
              >
                This action cannot be undone. The order will be permanently
                cancelled.
              </Text>
            </View>

            {/* Order ID Card */}
            <View className="mb-6">
              <Text
                className="text-sm font-inter-medium mb-2"
                style={{ color: theme.textSecondary }}
              >
                Order Reference
              </Text>
              <TouchableOpacity
                onPress={handleCopyOrderNumber}
                className="flex-row justify-between items-center p-4 rounded-xl border-2 border-dashed active:scale-95 transition-all"
                style={{
                  borderColor: theme.primary + '40',
                  backgroundColor: theme.card + '08',
                }}
              >
                <Text
                  className="text-lg font-inter-bold tracking-wide"
                  style={{ color: theme.primary }}
                >
                  #{orderNumber}
                </Text>
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 rounded-lg bg-primary/20 items-center justify-center">
                    <Copy color={theme.primary} size={16} />
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Warning Note */}
            <View
              className="p-3 rounded-lg mb-6"
              style={{ backgroundColor: theme.card + '15' }}
            >
              <Text
                className="text-sm font-inter-medium text-center"
                style={{ color: theme.warning }}
              >
                ⚠️ Cancelled orders cannot be restored
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="gap-3">
              <TouchableOpacity
                onPress={onConfirm}
                className="w-full py-4 rounded-xl "
              >
                <LinearGradient
                  colors={warningGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 16 }}
                  className="w-full py-4  items-center"
                >
                  <Text className="text-base font-inter-semibold text-white">
                    Yes, Cancel Order
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onCancel}
                className="w-full py-4 rounded-xl border-2 active:scale-95 transition-all"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.card,
                }}
              >
                <Text
                  className="text-base font-inter-semibold text-center"
                  style={{ color: theme.text }}
                >
                  No, Keep Order
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}
