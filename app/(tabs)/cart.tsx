import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Animated,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import {
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  X,
  Check,
  Info,
} from 'lucide-react-native';
import { useAppStore } from '@/stores/appStore';
import { useTheme } from '@/hooks/useTheme';

import { SafeAreaView } from 'react-native-safe-area-context';
import { CartItem, AddOn } from '@/types/appTypes';
import { formatPrice, handleImageSrc } from '@/utils/helpers';
import * as images from '@/constants/images';
import { ColorTheme } from '@/constants/theme';

const CartItemComponent = ({
  item,
  index,
  theme,
  removeFromCart,
  updateCartItem,
}: {
  item: CartItem;
  index: number;
  theme: ColorTheme;
  removeFromCart: (id: string) => void;
  updateCartItem: (id: string, quantity: number) => void;
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: 1,
      delay: index * 50,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, []);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  const discountPercent = Math.round(
    ((item.item.price - (item.item.sale_price ?? item.item.price)) /
      item.item.price) *
      100
  );

  // Calculate item total including addons
  const calculateItemTotal = () => {
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

  // Render selected properties
  const renderSelectedProperties = () => {
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
                  className="flex-row items-center gap-1 px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: theme.error + '15' }}
                >
                  <X size={10} color={theme.error} strokeWidth={3} />
                  <Text
                    className="text-xs capitalize"
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
                  className="flex-row items-center gap-1 px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: theme.success + '15' }}
                >
                  <Plus size={10} color={theme.success} strokeWidth={3} />
                  <Text
                    className="text-xs"
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
                className="flex-row items-center gap-1 px-2 py-0.5 rounded-md"
                style={{ backgroundColor: theme.primary + '15' }}
              >
                <Text
                  className="text-xs"
                  style={{ color: theme.primary, fontFamily: 'PoppinsMedium' }}
                >
                  {property.label}:
                </Text>
                <Text
                  className="text-xs capitalize"
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
        className="mt-2 border-t pt-2"
        style={{ borderTopColor: theme.border + '30' }}
      >
        <View className="flex-row flex-wrap gap-1">{elements}</View>
      </View>
    );
  };

  return (
    <Animated.View
      className="p-4 rounded-2xl border shadow-lg"
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
        opacity: animatedValue,
        transform: [{ translateY }],
      }}
    >
      <View className="flex-row">
        <View className="relative mr-4">
          <Image
            source={
              item.item.main_image
                ? { uri: handleImageSrc(item.item.main_image) }
                : images.OFFER_PLACEHOLDER_IMAGE
            }
            className="w-[100px] h-[100px] rounded-2xl"
          />
          {discountPercent > 0 && (
            <View
              className="absolute -top-1.5 -right-1.5 px-2 py-1 rounded-lg shadow-md"
              style={{ backgroundColor: theme.primary }}
            >
              <Text
                className="text-white text-[11px]"
                style={{ fontFamily: 'fredokaMedium' }}
              >
                -{discountPercent}%
              </Text>
            </View>
          )}
        </View>

        <View className="flex-1 justify-between">
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-2">
              <Text
                className="text-[17px] leading-6 mb-1.5"
                style={{ color: theme.text, fontFamily: 'PoppinsMedium' }}
                numberOfLines={2}
              >
                {item.item.title}
              </Text>
              <View
                className="self-start px-2.5 py-1 rounded-lg"
                style={{
                  backgroundColor: `${theme.primary}15`,
                }}
              >
                <Text
                  className="text-xs"
                  style={{ color: theme.primary, fontFamily: 'PoppinsMedium' }}
                >
                  {item.item.provider?.name}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                removeFromCart(item.id);
              }}
              className="w-9 h-9 rounded-xl justify-center items-center"
              style={{ backgroundColor: `${theme.error}15` }}
              activeOpacity={0.7}
            >
              <Trash2 color={theme.error} size={18} />
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2">
              {item.item.sale_price &&
                item.item.sale_price < item.item.price && (
                  <Text
                    className="text-sm line-through"
                    style={{
                      color: theme.textSecondary,
                      fontFamily: 'PoppinsMedium',
                    }}
                  >
                    ${formatPrice(item.item.price)}
                  </Text>
                )}
              <Text
                className="text-xl"
                style={{ color: theme.primary, fontFamily: 'PoppinsMedium' }}
              >
                ${formatPrice(item.item.sale_price ?? item.item.price)}
              </Text>
            </View>

            <View
              className="flex-row items-center rounded-xl border "
              style={{
                backgroundColor: `${theme.primary}10`,
                borderColor: `${theme.primary}30`,
              }}
            >
              <TouchableOpacity
                onPress={() => updateCartItem(item.id, item.quantity - 1)}
                className="w-9 h-9 justify-center items-center"
                activeOpacity={0.7}
              >
                <Minus color={theme.primary} size={16} strokeWidth={2.5} />
              </TouchableOpacity>

              <View className="px-4 py-1.5 rounded-lg mx-1">
                <Text
                  className="text-base"
                  style={{ fontFamily: 'PoppinsMedium', color: theme.text }}
                >
                  {item.quantity}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => updateCartItem(item.id, item.quantity + 1)}
                className="w-9 h-9 justify-center items-center"
                activeOpacity={0.7}
              >
                <Plus color={theme.primary} size={16} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Selected Properties */}
      {renderSelectedProperties()}

      {/* Item Total (if has addons) */}
      {item.selectedProperties &&
        Object.keys(item.selectedProperties).length > 0 && (
          <View
            className="mt-3 pt-3 flex-row justify-between items-center"
            style={{ borderTopColor: theme.border + '30', borderTopWidth: 1 }}
          >
            <Text
              className="text-sm"
              style={{
                color: theme.textSecondary,
                fontFamily: 'PoppinsMedium',
              }}
            >
              Item Total
            </Text>
            <Text
              className="text-lg"
              style={{ color: theme.text, fontFamily: 'PoppinsMedium' }}
            >
              ${calculateItemTotal().toFixed(2)}
            </Text>
          </View>
        )}
    </Animated.View>
  );
};

export default function CartScreen() {
  const { theme } = useTheme();

  const {
    cart,
    updateCartItem,
    removeFromCart,
    getCartTotal,
    getCartItemCount,
  } = useAppStore();

  const renderCartItem = ({
    item,
    index,
  }: {
    item: CartItem;
    index: number;
  }) => (
    <CartItemComponent
      item={item}
      index={index}
      theme={theme}
      removeFromCart={removeFromCart}
      updateCartItem={updateCartItem}
    />
  );

  if (cart.length === 0) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: theme.background }}
      >
        <View className="px-6 pt-5 pb-5">
          <Text
            className="text-[32px] tracking-tight"
            style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
          >
            My Cart
          </Text>
        </View>

        <View className="flex-1 justify-center items-center px-6">
          <View
            className="w-[140px] h-[140px] rounded-full justify-center items-center mb-6"
            style={{ backgroundColor: `${theme.primary}15` }}
          >
            <ShoppingBag color={theme.primary} size={64} strokeWidth={1.5} />
          </View>
          <Text
            className="text-2xl w-full text-center mb-3"
            style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
          >
            Your cart is empty
          </Text>
          <Text
            className="text-base text-center mb-8 leading-6"
            style={{ color: theme.textSecondary, fontFamily: 'PoppinsMedium' }}
          >
            Add some delicious offers to get started!
          </Text>
          <TouchableOpacity
            className="flex-row items-center gap-2 px-8 py-4 rounded-2xl shadow-lg"
            style={{ backgroundColor: theme.primary }}
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.8}
          >
            <Text
              className="text-white text-base"
              style={{ fontFamily: 'FredokaMedium' }}
            >
              Browse Offers
            </Text>
            <ArrowRight color="#FFFFFF" size={20} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <View className="flex-row justify-between items-center px-6 pt-5 pb-5">
        <View>
          <Text
            className="text-[32px] tracking-tight"
            style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
          >
            My Cart
          </Text>
          <Text
            className="text-[15px] font-medium mt-1"
            style={{ color: theme.textSecondary, fontFamily: 'PoppinsLight' }}
          >
            {getCartItemCount()} {getCartItemCount() === 1 ? 'item' : 'items'}
          </Text>
        </View>
        <View
          className="w-14 h-14 rounded-2xl justify-center items-center shadow-lg"
          style={{ backgroundColor: theme.primary }}
        >
          <ShoppingBag color="#FFFFFF" size={24} />
        </View>
      </View>

      <FlatList
        data={cart}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 240,
          paddingTop: 15,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
      />

      <View
        className="fixed bottom-24 left-0 rounded-2xl right-0 px-6 pt-5 pb-6 shadow-2xl"
        style={{
          backgroundColor: theme.card,
          width: '90%',
          alignSelf: 'center',
        }}
      >
        <View className="mb-4">
          <View className="flex-row justify-between items-center">
            <Text
              className="text-[17px]"
              style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
            >
              Total Amount
            </Text>
            <Text
              className="text-[28px]"
              style={{ color: theme.primary, fontFamily: 'PoppinsMedium' }}
            >
              ${getCartTotal().toFixed(2)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="flex-row w-full p-[18px] rounded-2xl items-center justify-center gap-2 shadow-lg"
          style={{ backgroundColor: theme.primary }}
          onPress={() => router.push('/(in_app_screens)/checkout')}
          activeOpacity={0.8}
        >
          <Text
            className="text-white text-[17px]"
            style={{ fontFamily: 'FredokaMedium' }}
          >
            Proceed to Checkout
          </Text>
          <ArrowRight color="#FFFFFF" size={20} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
