import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Clock,
  MessageSquare,
  User,
  Phone,
  ShoppingBag,
  DollarSign,
  Percent,
  CheckCircle2,
  Package,
} from 'lucide-react-native';
import { useAppStore } from '@/stores/appStore';
import * as images from '@/constants/images';
import { useOrderStore } from '@/stores/orderStore';
import { useTheme } from '@/hooks/useTheme';
import { useAlert } from '@/providers/AlertProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import { useBudgetStore } from '@/stores/budgetStore';
import { useAuthStore } from '@/stores/authStore';
import {
  PaymentMethod,
  PaymentStatus,
  TransactionStatus,
  TransactionType,
} from '@/types/appTypes';
import { handleImageSrc } from '@/utils/helpers';

export default function CheckoutScreen() {
  const { theme } = useTheme();
  const { cart, getCartTotal, clearCart } = useAppStore();
  const { showAlert } = useAlert();
  const { addExpense } = useBudgetStore();
  const { user } = useAuthStore();
  const { createOrder, isLoading } = useOrderStore();
  console.log('user', user);
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.first_name?.concat(` ${user.last_name}`),
    phone: user?.phone_number ?? '',
    pickupTime: '',
    specialInstructions: '',
  });
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [confirmation_code, setConfirmationCode] = useState('');

  const handleReserveOrder = async () => {
    if (!customerInfo.name?.trim() || !customerInfo.phone?.trim()) {
      showAlert(
        'Missing Information',
        'Please fill in your name and phone number.',
        'error'
      );
      return;
    }
    const items = cart.map((cart_item) => ({
      item: cart_item.offer,
      quantity: cart_item.quantity,
      total:
        (cart_item.offer.sale_price ?? cart_item.offer.price) *
        cart_item.quantity,
    }));

    const orderData = {
      transaction_type: 'ORDER' as TransactionType,
      user_id: user?.id,
      status: 'PENDING' as TransactionStatus,
      currency: 'USD',
      total_price: getCartTotal(),
      total_items: cart?.length,
      items,
      payment_status: 'PENDING' as PaymentStatus,
      payment_method: 'CASH' as PaymentMethod,
      client_data: {
        first_name: customerInfo.name.split(' ')[0],
        last_name: customerInfo.name.split(' ')[1] ?? '',
        phone_number: customerInfo.phone ?? '',
        email: user?.email_address ?? '',
        address: user?.address ?? '',
      },
      created_by: user?.id,
      provider_id: items[0]?.item.provider_id || '',
      tenant_id: items[0]?.item.tenant_id || '',
    };

    const result = await createOrder(orderData);

    if (result.success && result.confirmation_code) {
      setConfirmationCode(result.confirmation_code);
      setShowOrderModal(true);
      // Update budget store with the new expense according to each cart item category
      cart.forEach(async (item) => {
        await addExpense(
          item.offer.category_id,
          item.offer.sale_price ?? item.offer.price * item.quantity
        );
      });
      clearCart();
      showAlert(
        'Order Created!',
        `Your order has been placed successfully.`,
        'success'
      );
    } else {
      showAlert(
        'Order Failed',
        result.error || 'Failed to create order. Please try again.',
        'error'
      );
    }
  };

  const deliveryFee = 2.99;
  const subtotal = getCartTotal();
  const total = subtotal + deliveryFee;
  const totalSavings = cart.reduce(
    (sum, item) =>
      sum + (item.offer.price - (item.offer.sale_price ?? 0)) * item.quantity,
    0
  );

  const isReserveDisabled =
    !customerInfo.name?.trim() || !customerInfo.phone?.trim() || isLoading;

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      {/* Header */}
      <View
        className="flex-row justify-between items-center px-6 py-4 border-b"
        style={{ borderBottomColor: theme.border }}
      >
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold" style={{ color: theme.text }}>
          Checkout
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24 }}
      >
        {/* Order Summary Section */}
        <View className="mt-6">
          <View className="flex-row items-center gap-2 mb-4">
            <View
              className="w-10 h-10 rounded-xl justify-center items-center"
              style={{ backgroundColor: `${theme.primary}20` }}
            >
              <ShoppingBag color={theme.primary} size={20} />
            </View>
            <Text
              className="text-lg font-bold flex-1"
              style={{ color: theme.text }}
            >
              Order Summary
            </Text>
            <View
              className="px-3 py-1 rounded-lg"
              style={{ backgroundColor: `${theme.primary}15` }}
            >
              <Text
                className="text-xs font-bold"
                style={{ color: theme.primary }}
              >
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </Text>
            </View>
          </View>

          <View className="gap-3">
            {cart.map((item) => (
              <View
                key={item.id}
                className="flex-row p-4 rounded-2xl border shadow-sm"
                style={{
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                }}
              >
                <View className="relative">
                  <Image
                    source={
                      item.offer.main_image
                        ? { uri: handleImageSrc(item.offer.main_image) }
                        : images.OFFER_PLACEHOLDER_IMAGE
                    }
                    className="w-[70px] h-[70px] rounded-xl"
                  />
                  {item.offer.sale_price &&
                    item.offer.sale_price < item.offer.price && (
                      <View
                        className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-md"
                        style={{ backgroundColor: theme.success }}
                      >
                        <Text className="text-white text-[10px] font-bold">
                          SALE
                        </Text>
                      </View>
                    )}
                </View>

                <View className="flex-1 ml-4 justify-between">
                  <Text
                    className="text-base font-semibold leading-5 mb-2"
                    style={{ color: theme.text }}
                    numberOfLines={2}
                  >
                    {item.offer.title}
                  </Text>

                  <View className="flex-row justify-between items-center">
                    <View
                      className="px-2 py-1 rounded-lg"
                      style={{ backgroundColor: theme.backgroundSecondary }}
                    >
                      <Text
                        className="text-xs font-medium"
                        style={{ color: theme.textSecondary }}
                      >
                        Qty: {item.quantity}
                      </Text>
                    </View>

                    <View className="items-end">
                      {item.offer.sale_price &&
                        item.offer.sale_price < item.offer.price && (
                          <Text
                            className="text-xs line-through"
                            style={{ color: theme.textTertiary }}
                          >
                            ${item.offer.price.toFixed(2)}
                          </Text>
                        )}
                      <Text
                        className="text-lg font-bold"
                        style={{ color: theme.primary }}
                      >
                        $
                        {(
                          (item.offer.sale_price ?? item.offer.price) *
                          item.quantity
                        ).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Customer Info Section */}
        <View className="mt-6">
          <View className="flex-row items-center gap-2 mb-4">
            <View
              className="w-10 h-10 rounded-xl justify-center items-center"
              style={{ backgroundColor: `${theme.info}20` }}
            >
              <User color={theme.info} size={20} />
            </View>
            <Text className="text-lg font-bold" style={{ color: theme.text }}>
              Customer Information
            </Text>
          </View>

          <View className="gap-3">
            <View
              className="flex-row items-center rounded-2xl border px-4 py-3 gap-3 shadow-sm"
              style={{
                backgroundColor: theme.card,
                borderColor: theme.border,
              }}
            >
              <View
                className="w-11 h-11 rounded-xl justify-center items-center"
                style={{ backgroundColor: `${theme.primary}15` }}
              >
                <User color={theme.primary} size={20} />
              </View>
              <TextInput
                className="flex-1 text-base py-2"
                style={{ color: theme.text, fontFamily: 'Inter-Regular' }}
                placeholder="Full Name *"
                placeholderTextColor={theme.inputPlaceholder}
                value={customerInfo.name}
                onChangeText={(text) =>
                  setCustomerInfo({ ...customerInfo, name: text })
                }
              />
            </View>

            <View
              className="flex-row items-center rounded-2xl border px-4 py-3 gap-3 shadow-sm"
              style={{
                backgroundColor: theme.card,
                borderColor: theme.border,
              }}
            >
              <View
                className="w-11 h-11 rounded-xl justify-center items-center"
                style={{ backgroundColor: `${theme.primary}15` }}
              >
                <Phone color={theme.primary} size={20} />
              </View>
              <TextInput
                className="flex-1 text-base py-2"
                style={{ color: theme.text, fontFamily: 'Inter-Regular' }}
                placeholder="Phone Number *"
                placeholderTextColor={theme.inputPlaceholder}
                value={customerInfo.phone}
                onChangeText={(text) =>
                  setCustomerInfo({ ...customerInfo, phone: text })
                }
                keyboardType="phone-pad"
              />
            </View>

            <View
              className="flex-row items-center rounded-2xl border px-4 py-3 gap-3 shadow-sm"
              style={{
                backgroundColor: theme.card,
                borderColor: theme.border,
              }}
            >
              <View
                className="w-11 h-11 rounded-xl justify-center items-center"
                style={{ backgroundColor: `${theme.info}15` }}
              >
                <Clock color={theme.info} size={20} />
              </View>
              <TextInput
                className="flex-1 text-base py-2"
                style={{ color: theme.text, fontFamily: 'Inter-Regular' }}
                placeholder="Preferred Pickup Time (Optional)"
                placeholderTextColor={theme.inputPlaceholder}
                value={customerInfo.pickupTime}
                onChangeText={(text) =>
                  setCustomerInfo({ ...customerInfo, pickupTime: text })
                }
              />
            </View>

            <View
              className="flex-row items-start rounded-2xl border px-4 py-4 gap-3 shadow-sm"
              style={{
                backgroundColor: theme.card,
                borderColor: theme.border,
              }}
            >
              <View
                className="w-11 h-11 rounded-xl justify-center items-center"
                style={{ backgroundColor: `${theme.warning}15` }}
              >
                <MessageSquare color={theme.warning} size={20} />
              </View>
              <TextInput
                className="flex-1 text-base min-h-[80px]"
                style={{ color: theme.text, fontFamily: 'Inter-Regular' }}
                placeholder="Special Instructions (Optional)"
                placeholderTextColor={theme.inputPlaceholder}
                value={customerInfo.specialInstructions}
                onChangeText={(text) =>
                  setCustomerInfo({
                    ...customerInfo,
                    specialInstructions: text,
                  })
                }
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        {/* Price Breakdown Section */}
        <View className="mt-6 mb-6">
          <View className="flex-row items-center gap-2 mb-4">
            <View
              className="w-10 h-10 rounded-xl justify-center items-center"
              style={{ backgroundColor: `${theme.success}20` }}
            >
              <DollarSign color={theme.success} size={20} />
            </View>
            <Text className="text-lg font-bold" style={{ color: theme.text }}>
              Price Breakdown
            </Text>
          </View>

          <View
            className="p-5 rounded-2xl border shadow-md"
            style={{
              backgroundColor: theme.card,
              borderColor: theme.border,
            }}
          >
            <View className="flex-row justify-between items-center mb-3">
              <Text
                className="text-base"
                style={{
                  color: theme.textSecondary,
                  fontFamily: 'Inter-Regular',
                }}
              >
                Subtotal
              </Text>
              <Text
                className="text-base font-semibold"
                style={{ color: theme.text }}
              >
                ${subtotal.toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between items-center mb-3">
              <Text
                className="text-base"
                style={{
                  color: theme.textSecondary,
                  fontFamily: 'Inter-Regular',
                }}
              >
                Service Fee
              </Text>
              <Text
                className="text-base font-semibold"
                style={{ color: theme.text }}
              >
                ${deliveryFee.toFixed(2)}
              </Text>
            </View>

            {totalSavings > 0 && (
              <View
                className="flex-row items-center p-3 rounded-xl gap-2 mb-3"
                style={{ backgroundColor: `${theme.success}15` }}
              >
                <View
                  className="w-8 h-8 rounded-lg justify-center items-center"
                  style={{ backgroundColor: theme.success }}
                >
                  <Percent color="#FFFFFF" size={14} />
                </View>
                <Text
                  className="text-sm font-semibold flex-1"
                  style={{ color: theme.success }}
                >
                  You're saving
                </Text>
                <Text
                  className="text-lg font-bold"
                  style={{ color: theme.success }}
                >
                  ${totalSavings.toFixed(2)}
                </Text>
              </View>
            )}

            <View
              className="border-t pt-4 flex-row justify-between items-center"
              style={{ borderTopColor: theme.border }}
            >
              <Text className="text-lg font-bold" style={{ color: theme.text }}>
                Total Amount
              </Text>
              <Text
                className="text-3xl font-bold"
                style={{ color: theme.primary }}
              >
                ${total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View className="h-32" />
      </ScrollView>

      {/* Footer */}
      <View
        className="px-6 py-4 border-t shadow-2xl"
        style={{
          backgroundColor: theme.background,
          borderTopColor: theme.border,
        }}
      >
        <TouchableOpacity
          className="w-full p-4 rounded-2xl items-center shadow-lg"
          style={{
            backgroundColor: isReserveDisabled ? theme.disabled : theme.primary,
            opacity: isLoading ? 0.7 : 1,
          }}
          onPress={handleReserveOrder}
          disabled={isReserveDisabled}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center gap-2">
            {isLoading ? (
              <Package color="#FFFFFF" size={20} />
            ) : (
              <CheckCircle2 color="#FFFFFF" size={20} />
            )}
            <Text
              className="text-lg font-bold"
              style={{
                color: isReserveDisabled ? theme.textSecondary : '#FFFFFF',
              }}
            >
              {isLoading
                ? 'Creating Order...'
                : `Reserve Order • $${total.toFixed(2)}`}
            </Text>
          </View>
        </TouchableOpacity>
        <Text
          className="text-xs text-center mt-2"
          style={{ color: theme.textSecondary, fontFamily: 'Inter-Regular' }}
        >
          * Required fields must be filled
        </Text>
      </View>

      {/* Order Success Modal */}
      <OrderSuccessModal
        visible={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        confirmation_code={confirmation_code}
        customerInfo={customerInfo}
      />
    </SafeAreaView>
  );
}
