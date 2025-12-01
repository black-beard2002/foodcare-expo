import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, RefreshCcw, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { TransactionBase } from '@/types/appTypes';

interface OrderReorderModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  order: TransactionBase | null;
}

export default function OrderReorderModal({
  visible,
  onConfirm,
  onCancel,
  order,
}: OrderReorderModalProps) {
  const { theme, isDark } = useTheme();
  const { width: SCREEN_WIDTH } = Dimensions.get('window');

  if (!order) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <BlurView
        intensity={isDark ? 40 : 60}
        tint={isDark ? 'dark' : 'light'}
        className="flex-1 justify-center items-center px-6"
      >
        <View
          className="w-full max-w-md rounded-3xl p-6 shadow-2xl"
          style={{
            backgroundColor: theme.card,
            maxWidth: Math.min(SCREEN_WIDTH - 48, 400),
          }}
        >
          {/* Close Button */}
          <TouchableOpacity
            onPress={onCancel}
            className="absolute top-4 right-4 w-8 h-8 rounded-full items-center justify-center z-10"
            style={{ backgroundColor: theme.backgroundSecondary }}
          >
            <X color={theme.textSecondary} size={18} />
          </TouchableOpacity>

          {/* Icon */}
          <View className="items-center mb-4">
            <View
              className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
              style={{ backgroundColor: theme.successLight }}
            >
              <RefreshCcw color={theme.success} size={32} />
            </View>
            <Text
              className="text-2xl text-center mb-2"
              style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
            >
              Reorder Confirmation
            </Text>
            <Text
              className="text-sm text-center opacity-70"
              style={{ color: theme.textSecondary, fontFamily: 'PoppinsLight' }}
            >
              Review your order details before confirming
            </Text>
          </View>

          {/* Order Details */}
          <View
            className="rounded-2xl p-4 mb-4"
            style={{ backgroundColor: theme.backgroundSecondary }}
          >
            {/* Order ID */}
            <View
              className="flex-row justify-between items-center mb-3 pb-3 border-b border-opacity-10"
              style={{ borderColor: theme.textSecondary }}
            >
              <Text
                className="text-sm"
                style={{
                  color: theme.textSecondary,
                  fontFamily: 'PoppinsMedium',
                }}
              >
                Order ID
              </Text>
              <Text
                className="text-sm"
                style={{ color: theme.text, fontFamily: 'PoppinsMedium' }}
              >
                #{order.id}
              </Text>
            </View>

            {/* Customer Name */}
            <View
              className="flex-row justify-between items-center mb-3 pb-3 border-b border-opacity-10"
              style={{ borderColor: theme.textSecondary }}
            >
              <Text
                className="text-sm"
                style={{
                  color: theme.textSecondary,
                  fontFamily: 'PoppinsMedium',
                }}
              >
                Customer
              </Text>
              <Text
                className="text-sm"
                style={{ color: theme.text, fontFamily: 'PoppinsMedium' }}
              >
                {order.client_data?.first_name} {order.client_data?.last_name}
              </Text>
            </View>

            {/* Items Count */}
            <View
              className="flex-row justify-between items-center mb-3 pb-3 border-b border-opacity-10"
              style={{ borderColor: theme.textSecondary }}
            >
              <Text
                className="text-sm"
                style={{
                  color: theme.textSecondary,
                  fontFamily: 'PoppinsMedium',
                }}
              >
                Items
              </Text>
              <Text
                className="text-sm"
                style={{ color: theme.text, fontFamily: 'PoppinsMedium' }}
              >
                {order.items?.length || 0}{' '}
                {order.items?.length === 1 ? 'item' : 'items'}
              </Text>
            </View>

            {/* Items List */}
            {order.items && order.items.length > 0 && (
              <View
                className="mb-3 pb-3 border-b border-opacity-10"
                style={{ borderColor: theme.textSecondary }}
              >
                <Text
                  className="text-xs mb-2"
                  style={{
                    color: theme.textSecondary,
                    fontFamily: 'PoppinsMedium',
                  }}
                >
                  Order Items:
                </Text>
                <ScrollView className="max-h-32">
                  {order.items.map((item, index) => (
                    <View
                      key={index}
                      className="flex-row justify-between items-center py-1"
                    >
                      <Text
                        className="text-xs flex-1"
                        style={{
                          color: theme.text,
                          fontFamily: 'PoppinsLight',
                        }}
                        numberOfLines={1}
                      >
                        • {item.item.title}
                      </Text>
                      <Text
                        className="text-xs ml-2"
                        style={{
                          color: theme.textSecondary,
                          fontFamily: 'PoppinsLight',
                        }}
                      >
                        x{item.quantity}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Total */}
            <View className="flex-row justify-between items-center">
              <Text
                className="text-base"
                style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
              >
                Total
              </Text>
              <Text
                className="text-xl"
                style={{ color: theme.primary, fontFamily: 'PoppinsMedium' }}
              >
                ${order.total_price}
              </Text>
            </View>
          </View>

          {/* Info Message */}
          <View
            className="flex-row items-start gap-2 p-3 rounded-xl mb-6"
            style={{ backgroundColor: theme.infoLight }}
          >
            <AlertCircle color={theme.info} size={16} className="mt-0.5" />
            <Text
              className="text-xs flex-1"
              style={{ color: theme.info, fontFamily: 'PoppinsLight' }}
            >
              This will create a new order with the same items and details from
              the previous order.
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 py-3.5 rounded-xl items-center justify-center"
              style={{ backgroundColor: theme.backgroundSecondary }}
            >
              <Text
                className="text-base"
                style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              className="flex-1 py-3.5 rounded-xl items-center justify-center"
              style={{ backgroundColor: theme.success }}
            >
              <Text
                className="text-base"
                style={{ color: '#FFFFFF', fontFamily: 'FredokaMedium' }}
              >
                Confirm Reorder
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}
