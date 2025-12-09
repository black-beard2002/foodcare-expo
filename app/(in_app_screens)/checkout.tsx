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
  MessageSquare,
  User,
  Phone,
  ShoppingBag,
  DollarSign,
  Percent,
  CheckCircle2,
  Package,
  X,
  Plus,
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
  CartItem,
  AddOn,
} from '@/types/appTypes';
import { formatPrice, handleImageSrc } from '@/utils/helpers';

export default function CheckoutScreen() {
  const { theme } = useTheme();
  const { cart, getCartTotal, clearCart, categories } = useAppStore();
  const { showAlert } = useAlert();
  const { addExpense } = useBudgetStore();
  const { user } = useAuthStore();
  const { createOrder, isLoading } = useOrderStore();
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.first_name?.concat(` ${user.last_name}`),
    phone: user?.phone_number ?? '',
    pickupTime: '',
    specialInstructions: '',
  });
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Calculate item total including addons
  const calculateItemTotal = (item: CartItem) => {
    const basePrice = item.item.sale_price ?? item.item.price;
    let addonTotal = 0;

    if (item.selectedProperties) {
      Object.values(item.selectedProperties).forEach((value) => {
        if (Array.isArray(value)) {
          value.forEach((v) => {
            if (typeof v === 'object' && v !== null && 'price' in v) {
              addonTotal += (v as AddOn).price;
            }
          });
        }
      });
    }

    return (basePrice + addonTotal) * item.quantity;
  };

  // Render selected properties for an item
  const renderSelectedProperties = (item: CartItem) => {
    if (
      !item.selectedProperties ||
      Object.keys(item.selectedProperties).length === 0
    ) {
      return null;
    }

    const properties = item.item.custom_properties;
    if (!properties) return null;

    const elements: React.ReactNode[] = [];

    Object.entries(item.selectedProperties).forEach(([key, value]) => {
      const property = properties[key];
      if (!property) return;

      // Handle different property types
      if (property.type === 'exclude' || property.type === 'multiexclude') {
        // Show excluded items
        if (Array.isArray(value) && value.length > 0) {
          elements.push(
            <View
              key={key}
              className="flex-row flex-wrap items-center gap-1 mt-2"
            >
              <Text
                className="text-xs"
                style={{
                  color: theme.textSecondary,
                  fontFamily: 'PoppinsMedium',
                }}
              >
                No:
              </Text>
              {(value as string[]).map((excluded, idx) => (
                <View
                  key={idx}
                  className="flex-row items-center gap-0.5 px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: theme.error + '15' }}
                >
                  <X size={8} color={theme.error} strokeWidth={3} />
                  <Text
                    className="text-[10px] capitalize"
                    style={{ color: theme.error, fontFamily: 'PoppinsMedium' }}
                  >
                    {excluded}
                  </Text>
                </View>
              ))}
            </View>
          );
        }
      } else if (property.type === 'addon') {
        // Show addons
        if (Array.isArray(value) && value.length > 0) {
          elements.push(
            <View
              key={key}
              className="flex-row flex-wrap items-center gap-1 mt-2"
            >
              <Text
                className="text-xs"
                style={{
                  color: theme.textSecondary,
                  fontFamily: 'PoppinsMedium',
                }}
              >
                Add-ons:
              </Text>
              {(value as AddOn[]).map((addon, idx) => (
                <View
                  key={idx}
                  className="flex-row items-center gap-0.5 px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: theme.success + '15' }}
                >
                  <Plus size={8} color={theme.success} strokeWidth={3} />
                  <Text
                    className="text-[10px]"
                    style={{
                      color: theme.success,
                      fontFamily: 'PoppinsMedium',
                    }}
                  >
                    {addon.name} (+${addon.price.toFixed(2)})
                  </Text>
                </View>
              ))}
            </View>
          );
        }
      } else if (
        property.type === 'select' ||
        property.type === 'multiselect'
      ) {
        // Show selected options
        const displayValue = Array.isArray(value)
          ? (value as string[]).join(', ')
          : String(value);

        if (displayValue) {
          elements.push(
            <View key={key} className="flex-row items-center gap-1 mt-2">
              <View
                className="flex-row items-center gap-1 px-1.5 py-0.5 rounded"
                style={{ backgroundColor: theme.primary + '15' }}
              >
                <Text
                  className="text-[10px]"
                  style={{ color: theme.primary, fontFamily: 'PoppinsMedium' }}
                >
                  {property.label}:
                </Text>
                <Text
                  className="text-[10px] capitalize"
                  style={{ color: theme.primary, fontFamily: 'PoppinsMedium' }}
                >
                  {displayValue}
                </Text>
              </View>
            </View>
          );
        }
      }
    });

    if (elements.length === 0) return null;

    return (
      <View
        className="mt-2 pt-2 border-t"
        style={{ borderTopColor: theme.border + '20' }}
      >
        <View className="flex-row flex-wrap gap-1">{elements}</View>
      </View>
    );
  };

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
      item: cart_item.item,
      quantity: cart_item.quantity,
      selectedProperties: cart_item.selectedProperties,
      total: calculateItemTotal(cart_item),
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
      special_instructions:
        customerInfo.specialInstructions || 'no instructions',
    };

    const result = await createOrder(orderData);

    if (result.success && result.confirmation_code) {
      setShowOrderModal(true);
      // Update budget store with the new expense according to each cart item category
      cart.forEach(async (item) => {
        await addExpense(
          categories.find((cat) => cat.id === item.item.category_id)?.name ||
            'Uncategorized',
          calculateItemTotal(item)
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

  const deliveryFee = 0.0;
  const subtotal = getCartTotal();
  const total = subtotal + deliveryFee;
  const totalSavings = cart.reduce((sum, item) => {
    const baseDiscount =
      (item.item.price - (item.item.sale_price ?? item.item.price)) *
      item.quantity;
    return sum + baseDiscount;
  }, 0);

  const isReserveDisabled =
    !customerInfo.name?.trim() ||
    !customerInfo.phone?.trim() ||
    isLoading ||
    cart.length === 0;

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
        <Text
          className="text-2xl"
          style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
        >
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
              className="text-lg flex-1"
              style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
            >
              Order Summary
            </Text>
            <View
              className="px-3 py-1 rounded-lg"
              style={{ backgroundColor: `${theme.primary}15` }}
            >
              <Text
                className="text-xs"
                style={{ color: theme.primary, fontFamily: 'PoppinsLight' }}
              >
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </Text>
            </View>
          </View>

          <View className="gap-3">
            {cart.map((item) => {
              const itemTotal = calculateItemTotal(item);
              const hasCustomizations =
                item.selectedProperties &&
                Object.keys(item.selectedProperties).length > 0;

              return (
                <View
                  key={item.id}
                  className="p-4 rounded-2xl border shadow-sm"
                  style={{
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  }}
                >
                  <View className="flex-row">
                    <View className="relative">
                      <Image
                        source={
                          item.item.main_image
                            ? { uri: handleImageSrc(item.item.main_image) }
                            : images.OFFER_PLACEHOLDER_IMAGE
                        }
                        className="w-[70px] h-[70px] rounded-xl"
                      />
                      {item.item.sale_price &&
                        item.item.sale_price < item.item.price && (
                          <View
                            className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-md"
                            style={{ backgroundColor: theme.success }}
                          >
                            <Text
                              className="text-white text-[10px]"
                              style={{ fontFamily: 'FredokaMedium' }}
                            >
                              SALE
                            </Text>
                          </View>
                        )}
                    </View>

                    <View className="flex-1 ml-4 justify-between">
                      <View>
                        <Text
                          className="text-base leading-5 mb-2"
                          style={{
                            color: theme.text,
                            fontFamily: 'PoppinsMedium',
                          }}
                          numberOfLines={2}
                        >
                          {item.item.title}
                        </Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          {item.item.sale_price && (
                            <Text
                              style={{
                                fontSize: 11,
                                color: theme.textSecondary,
                                textDecorationLine: 'line-through',
                                fontFamily: 'PoppinsMedium',
                              }}
                            >
                              ${item.item.price}
                            </Text>
                          )}
                          <Text
                            style={{
                              fontSize: 15,
                              fontFamily: 'PoppinsMedium',
                              color: theme.primary,
                              letterSpacing: -0.5,
                            }}
                          >
                            $
                            {formatPrice(
                              item.item.sale_price ?? item.item.price
                            )}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row justify-between items-center">
                        <View
                          className="px-2 py-1 rounded-lg"
                          style={{ backgroundColor: theme.backgroundSecondary }}
                        >
                          <Text
                            className="text-xs"
                            style={{
                              color: theme.textSecondary,
                              fontFamily: 'PoppinsMedium',
                            }}
                          >
                            Qty: {item.quantity}
                          </Text>
                        </View>

                        <View className="items-end">
                          {!hasCustomizations &&
                            item.item.sale_price &&
                            item.item.sale_price < item.item.price && (
                              <Text
                                className="text-xs line-through"
                                style={{
                                  color: theme.textTertiary,
                                  fontFamily: 'PoppinsMedium',
                                }}
                              >
                                ${(item.item.price * item.quantity).toFixed(2)}
                              </Text>
                            )}
                          <Text
                            className="text-lg"
                            style={{
                              color: theme.primary,
                              fontFamily: 'PoppinsMedium',
                            }}
                          >
                            ${itemTotal.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Selected Properties */}
                  {renderSelectedProperties(item)}
                </View>
              );
            })}
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
            <Text
              className="text-lg"
              style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
            >
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
                style={{ color: theme.text, fontFamily: 'PoppinsMedium' }}
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
                style={{ color: theme.text, fontFamily: 'PoppinsMedium' }}
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
                style={{ color: theme.text, fontFamily: 'PoppinsMedium' }}
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
            <Text
              className="text-lg"
              style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
            >
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
                  fontFamily: 'FredokaMedium',
                }}
              >
                Subtotal
              </Text>
              <Text
                className="text-base"
                style={{ color: theme.text, fontFamily: 'PoppinsMedium' }}
              >
                ${subtotal.toFixed(2)}
              </Text>
            </View>

            {deliveryFee > 0 && (
              <View className="flex-row justify-between items-center mb-3">
                <Text
                  className="text-base"
                  style={{
                    color: theme.textSecondary,
                    fontFamily: 'FredokaMedium',
                  }}
                >
                  Service Fee
                </Text>
                <Text
                  className="text-base"
                  style={{ color: theme.text, fontFamily: 'PoppinsMedium' }}
                >
                  ${deliveryFee.toFixed(2)}
                </Text>
              </View>
            )}

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
                  className="text-sm flex-1"
                  style={{ color: theme.success, fontFamily: 'FredokaMedium' }}
                >
                  You're saving
                </Text>
                <Text
                  className="text-lg"
                  style={{ color: theme.success, fontFamily: 'PoppinsMedium' }}
                >
                  ${totalSavings.toFixed(2)}
                </Text>
              </View>
            )}

            <View
              className="border-t pt-4 flex-row justify-between items-center"
              style={{ borderTopColor: theme.border }}
            >
              <Text
                className="text-lg"
                style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
              >
                Total Amount
              </Text>
              <Text
                className="text-3xl"
                style={{ color: theme.primary, fontFamily: 'PoppinsMedium' }}
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
              className="text-lg"
              style={{
                color: isReserveDisabled ? theme.textSecondary : '#FFFFFF',
                fontFamily: 'FredokaMedium',
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
          style={{ color: theme.textSecondary, fontFamily: 'FredokaMedium' }}
        >
          * Required fields must be filled
        </Text>
      </View>

      {/* Order Success Modal */}
      <OrderSuccessModal
        visible={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        customerInfo={customerInfo}
      />
    </SafeAreaView>
  );
}
