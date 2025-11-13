import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import {
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react-native';
import { useAppStore } from '@/stores/appStore';
import { useTheme } from '@/hooks/useTheme';

import { SafeAreaView } from 'react-native-safe-area-context';
import { CartItem } from '@/types/appTypes';
import { formatPrice, handleImageSrc } from '@/utils/helpers';
import * as images from '@/constants/images';

const CartItemComponent = ({
  item,
  index,
  theme,
  removeFromCart,
  updateCartItem,
}: any) => {
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
    ((item.offer.price - (item.offer.sale_price ?? item.offer.price)) /
      item.offer.price) *
      100
  );

  return (
    <Animated.View
      className="flex-row p-4 rounded-2xl border shadow-lg"
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
        opacity: animatedValue,
        transform: [{ translateY }],
      }}
    >
      <View className="relative mr-4">
        <Image
          source={
            item.offer.main_image
              ? { uri: handleImageSrc(item.offer.main_image) }
              : images.OFFER_PLACEHOLDER_IMAGE
          }
          className="w-[100px] h-[100px] rounded-2xl"
        />
        {discountPercent > 0 && (
          <View
            className="absolute -top-1.5 -right-1.5 px-2 py-1 rounded-lg shadow-md"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="text-white text-[11px] font-bold">
              -{discountPercent}%
            </Text>
          </View>
        )}
      </View>

      <View className="flex-1 justify-between">
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-2">
            <Text
              className="text-[17px] font-bold leading-6 mb-1.5"
              style={{ color: theme.text }}
              numberOfLines={2}
            >
              {item.offer.title}
            </Text>
            <View
              className="self-start px-2.5 py-1 rounded-lg"
              style={{ backgroundColor: `${theme.primary}15` }}
            >
              <Text
                className="text-xs font-medium"
                style={{ color: theme.primary }}
              >
                restaurant_name
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
            {item.offer.sale_price &&
              item.offer.sale_price < item.offer.price && (
                <Text
                  className="text-sm font-medium line-through"
                  style={{ color: theme.textSecondary }}
                >
                  ${formatPrice(item.offer.price)}
                </Text>
              )}
            <Text
              className="text-xl font-bold"
              style={{ color: theme.primary }}
            >
              ${formatPrice(item.offer.sale_price ?? item.offer.price)}
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

            <View
              className="px-4 py-1.5 rounded-lg mx-1"
              style={{ backgroundColor: theme.primary }}
            >
              <Text className="text-[15px] font-bold text-white">
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
            className="text-[32px] font-bold tracking-tight"
            style={{ color: theme.text }}
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
            className="text-2xl w-full text-center font-bold mb-3"
            style={{ color: theme.text }}
          >
            Your cart is empty
          </Text>
          <Text
            className="text-base text-center mb-8 leading-6"
            style={{ color: theme.textSecondary }}
          >
            Add some delicious offers to get started!
          </Text>
          <TouchableOpacity
            className="flex-row items-center gap-2 px-8 py-4 rounded-2xl shadow-lg"
            style={{ backgroundColor: theme.primary }}
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.8}
          >
            <Text className="text-white text-base font-bold">
              Browse Offers
            </Text>
            <ArrowRight color="#FFFFFF" size={20} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const subtotal = getCartTotal();
  const deliveryFee = 5.0;
  const total = subtotal + deliveryFee;

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <View className="flex-row justify-between items-center px-6 pt-5 pb-5">
        <View>
          <Text
            className="text-[32px] font-bold tracking-tight"
            style={{ color: theme.text }}
          >
            My Cart
          </Text>
          <Text
            className="text-[15px] font-medium mt-1"
            style={{ color: theme.textSecondary }}
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
        className="fixed bottom-24 left-0 rounded-2xl right-0 px-6 pt-5 pb-6 border-t shadow-2xl"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
          width: '90%',
          alignSelf: 'center',
        }}
      >
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text
              className="text-[15px]"
              style={{ color: theme.textSecondary }}
            >
              Subtotal
            </Text>
            <Text
              className="text-[15px] font-medium"
              style={{ color: theme.text }}
            >
              ${subtotal.toFixed(2)}
            </Text>
          </View>

          <View
            className="h-[1px] my-3"
            style={{ backgroundColor: theme.border }}
          />

          <View className="flex-row justify-between items-center">
            <Text
              className="text-[17px] font-bold"
              style={{ color: theme.text }}
            >
              Total Amount
            </Text>
            <Text
              className="text-[28px] font-bold"
              style={{ color: theme.primary }}
            >
              ${total.toFixed(2)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="flex-row w-full p-[18px] rounded-2xl items-center justify-center gap-2 shadow-lg"
          style={{ backgroundColor: theme.primary }}
          onPress={() => router.push('/(in_app_screens)/checkout')}
          activeOpacity={0.8}
        >
          <Text className="text-white text-[17px] font-bold">
            Proceed to Checkout
          </Text>
          <ArrowRight color="#FFFFFF" size={20} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
