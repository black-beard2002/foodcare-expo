import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as images from '../../constants/images';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Heart,
  Coins,
  Minus,
  Plus,
  Info,
  Sparkles,
} from 'lucide-react-native';
import { useAppStore } from '@/stores/appStore';
import { Offer } from '@/types/appTypes';
import { useTheme } from '@/hooks/useTheme';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { useAlert } from '@/providers/AlertProvider';

import {
  formatPrice,
  getDiscountPercentage,
  handleImageSrc,
} from '@/utils/helpers';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function OfferDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [offer, setOffer] = useState<Offer | null>(null);
  const { addToCart, updateCartItem, cart } = useAppStore();
  const item = useMemo(
    () =>
      cart.find((cartItem) => cartItem.offer.id === id) || {
        id: `${offer?.id}-${Date.now()}`,
        offer: offer!,
        quantity: 0,
      },
    [cart, id, offer]
  );
  const { addToRecentlyViewed } = useRecentlyViewedStore();
  const { offers } = useAppStore();
  const { showAlert } = useAlert();
  const {
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    isLoading,
    setIsNewFavoritedAdded,
  } = useFavoritesStore();
  const { theme } = useTheme();

  // Animation values
  const imageScale = useRef(new Animated.Value(0.8)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(50)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const foundOffer = offers.find((o) => o.id === id);
    console.log('Found Offer:', foundOffer);
    if (foundOffer) addToRecentlyViewed(foundOffer);
    setOffer(foundOffer || null);

    // Trigger animations when offer is found
    if (foundOffer) {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(imageOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(imageScale, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
        // Header fade in
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 500,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Content slides up and fades in
      Animated.parallel([
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 600,
          delay: 300,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 500,
          delay: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [id]);

  useEffect(() => {
    setIsNewFavoritedAdded(false);
  }, []);

  if (!offer) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.background }}
      >
        <Text
          className="text-lg font-inter-regular"
          style={{ color: theme.text }}
        >
          Offer not found
        </Text>
      </View>
    );
  }

  const handleFavoritePress = () => {
    if (isFavorite(id)) {
      removeFromFavorites(id);
    } else {
      addToFavorites(offer);
    }
  };

  const handleAddToCart = () => {
    addToCart(offer);
    showAlert(
      'Added to cart',
      `${offer.title} is added to your cart`,
      'success'
    );
    router.replace('/(tabs)');
  };

  const renderCustomProperties = () => {
    if (
      !offer.custom_properties ||
      Object.keys(offer.custom_properties).length === 0
    ) {
      return null;
    }

    const renderPropertyValue = (value: any, key: string) => {
      if (Array.isArray(value)) {
        return (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
          >
            <View className="flex-row gap-2 pr-4">
              {value.map((v, i) => (
                <View
                  key={i}
                  className="px-4 py-2.5 rounded-xl"
                  style={{
                    backgroundColor: `${theme.primary}10`,
                    borderWidth: 1,
                    borderColor: `${theme.primary}30`,
                  }}
                >
                  <Text
                    className="text-sm font-inter-semibold"
                    style={{ color: theme.primary }}
                  >
                    {String(v)}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        );
      }

      if (typeof value === 'object' && value !== null) {
        return (
          <View className="mt-3 space-y-2">
            {Object.entries(value).map(([subKey, subValue], subIndex) => (
              <View
                key={subIndex}
                className="flex-row justify-between items-center py-3 px-4 rounded-xl"
                style={{
                  backgroundColor: theme.inputBackground,
                  borderLeftWidth: 3,
                  borderLeftColor: theme.primary,
                }}
              >
                <Text
                  className="text-sm font-inter-medium flex-1"
                  style={{ color: theme.textSecondary }}
                >
                  {subKey.charAt(0).toUpperCase() +
                    subKey.slice(1).replace(/_/g, ' ')}
                </Text>
                <Text
                  className="text-sm font-inter-bold"
                  style={{ color: theme.text }}
                >
                  {String(subValue)}
                </Text>
              </View>
            ))}
          </View>
        );
      }

      return (
        <Text
          className="text-base font-inter-semibold mt-2"
          style={{ color: theme.text }}
        >
          {String(value)}
        </Text>
      );
    };

    return (
      <View className="mb-6">
        <View className="flex-row items-center gap-2 mb-4">
          <View
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{ backgroundColor: `${theme.primary}15` }}
          >
            <Sparkles color={theme.primary} size={18} />
          </View>
          <Text
            className="text-xl font-inter-bold"
            style={{ color: theme.text }}
          >
            Additional Details
          </Text>
        </View>

        <View className="gap-4">
          {Object.entries(offer.custom_properties).map(
            ([key, value], index) => {
              if (
                value === null ||
                value === undefined ||
                (typeof value === 'object' &&
                  !Array.isArray(value) &&
                  Object.keys(value).length === 0)
              ) {
                return null;
              }

              const propertyTitle =
                key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');

              return (
                <View
                  key={index}
                  className="rounded-2xl p-5 overflow-hidden"
                  style={{
                    backgroundColor: theme.card,
                    borderWidth: 1,
                    borderColor: theme.border,
                    shadowColor: theme.text,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-1">
                    <Text
                      className="text-sm font-inter-medium tracking-wide uppercase"
                      style={{ color: theme.textSecondary }}
                    >
                      {propertyTitle}
                    </Text>
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center"
                      style={{ backgroundColor: `${theme.primary}10` }}
                    >
                      <Info color={theme.primary} size={14} />
                    </View>
                  </View>
                  {renderPropertyValue(value, key)}
                </View>
              );
            }
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <Animated.View
        className="absolute top-14 left-0 right-0 z-10 flex-row justify-between items-center px-6"
        style={{ opacity: headerOpacity }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 rounded-2xl items-center justify-center shadow-lg"
          style={{
            backgroundColor: `${theme.card}F0`,
            borderWidth: 1,
            borderColor: `${theme.border}60`,
          }}
        >
          <ArrowLeft color={theme.text} size={22} strokeWidth={2.5} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleFavoritePress}
          className="w-11 h-11 rounded-2xl items-center justify-center shadow-lg"
          style={{
            backgroundColor: isFavorite(id) ? theme.error : `${theme.card}F0`,
            borderWidth: 1,
            borderColor: isFavorite(id) ? theme.error : `${theme.border}60`,
          }}
        >
          {isLoading ? (
            <ActivityIndicator
              color={isFavorite(id) ? 'white' : theme.primary}
              size="small"
            />
          ) : (
            <Heart
              fill={isFavorite(id) ? 'white' : 'none'}
              color={isFavorite(id) ? 'white' : theme.text}
              strokeWidth={2.5}
              size={22}
            />
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Offer Image */}
        <Animated.View
          style={{
            opacity: imageOpacity,
            transform: [{ scale: imageScale }],
          }}
        >
          <Image
            source={
              offer.main_image
                ? { uri: handleImageSrc(offer.main_image) }
                : images.OFFER_PLACEHOLDER_IMAGE
            }
            className="w-full"
            style={{ height: SCREEN_HEIGHT * 0.42 }}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Details Container */}
        <Animated.View
          className="flex-1 relative mt-[-24px] rounded-t-3xl px-6 pt-6 pb-32"
          style={{
            backgroundColor: theme.card,
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }],
          }}
        >
          {/* Discount Badge */}
          <View
            className="absolute -top-5 right-6 px-5 py-3 rounded-2xl shadow-xl"
            style={{
              backgroundColor: theme.error,
              borderWidth: 2,
              borderColor: 'white',
            }}
          >
            <Text className="text-white text-base font-inter-bold">
              {getDiscountPercentage(offer.price, offer.sale_price ?? 0)}% OFF
            </Text>
          </View>
          {/* Title */}
          <Text
            className="text-3xl font-inter-bold leading-tight mb-2"
            style={{ color: theme.text }}
          >
            {offer.title}
          </Text>

          {/* Rating Row */}
          <View className="flex-row items-center gap-4 mb-4">
            <View className="flex-row items-center gap-1">
              <Star color={theme.warning} fill={theme.warning} size={18} />
              <Text
                className="text-base font-inter-bold"
                style={{ color: theme.text }}
              >
                5.0
              </Text>
            </View>
            <View
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: theme.textSecondary }}
            />
            <Text
              className="text-sm font-inter-medium"
              style={{ color: theme.textSecondary }}
            >
              Food Place
            </Text>
          </View>

          {/* Description */}
          <Text
            className="text-base font-inter-regular leading-6 mb-6"
            style={{ color: theme.textSecondary }}
          >
            {offer.description}
          </Text>

          {/* Quick Info Cards - Grid Layout */}
          <View className="flex-row flex-wrap gap-3 mb-6">
            <View
              className="flex-1 min-w-[45%] rounded-2xl p-4 items-center"
              style={{
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center mb-2"
                style={{ backgroundColor: `${theme.primary}15` }}
              >
                <Clock color={theme.primary} size={22} />
              </View>
              <Text
                className="text-xs font-inter-medium mb-1"
                style={{ color: theme.textSecondary }}
              >
                Cook Time
              </Text>
              <Text
                className="text-base font-inter-bold"
                style={{ color: theme.text }}
              >
                {offer.custom_properties?.cooking_time
                  ? `${String(offer.custom_properties.cooking_time)} min`
                  : 'N/A'}
              </Text>
            </View>

            <View
              className="flex-1 min-w-[45%] rounded-2xl p-4 items-center"
              style={{
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center mb-2"
                style={{ backgroundColor: `${theme.primary}15` }}
              >
                <MapPin color={theme.primary} size={22} />
              </View>
              <Text
                className="text-xs font-inter-medium mb-1"
                style={{ color: theme.textSecondary }}
              >
                Distance
              </Text>
              <Text
                className="text-base font-inter-bold"
                style={{ color: theme.text }}
              >
                N/A
              </Text>
            </View>
          </View>

          <View
            className="rounded-2xl p-6 mb-6 overflow-hidden"
            style={{
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text
                  className="text-xs font-inter-medium mb-1 uppercase tracking-wider"
                  style={{ color: theme.textSecondary }}
                >
                  Original Price
                </Text>
                <Text
                  className="text-2xl line-through font-inter-regular"
                  style={{ color: theme.textSecondary }}
                >
                  ${formatPrice(offer.price)}
                </Text>
              </View>

              {offer.sale_price && (
                <View className="items-end">
                  <Text
                    className="text-xs font-inter-medium mb-1 uppercase tracking-wider"
                    style={{ color: theme.success }}
                  >
                    You Save
                  </Text>
                  <View className="flex-row items-center gap-1">
                    <Coins color={theme.success} size={20} />
                    <Text
                      className="text-xl font-inter-bold"
                      style={{ color: theme.success }}
                    >
                      ${(offer.price - offer.sale_price).toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {offer.sale_price && (
              <View
                className="rounded-xl p-4"
                style={{ backgroundColor: `${theme.primary}10` }}
              >
                <Text
                  className="text-xs font-inter-medium mb-1 uppercase tracking-wider"
                  style={{ color: theme.primary }}
                >
                  Special Price
                </Text>
                <Text
                  className="text-4xl font-inter-bold"
                  style={{ color: theme.primary }}
                >
                  ${formatPrice(offer.sale_price)}
                </Text>
              </View>
            )}
          </View>

          {/* Tags */}
          {offer.tags && offer.tags.length > 0 && (
            <View className="mb-6">
              <Text
                className="text-lg font-inter-bold mb-3"
                style={{ color: theme.text }}
              >
                Features
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {offer.tags.map((tag, i) => (
                  <View
                    key={i}
                    className="px-4 py-2.5 rounded-xl"
                    style={{
                      backgroundColor: `${theme.success}15`,
                      borderWidth: 1,
                      borderColor: `${theme.success}30`,
                    }}
                  >
                    <Text
                      className="text-sm font-inter-semibold"
                      style={{ color: theme.success }}
                    >
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {renderCustomProperties()}
        </Animated.View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0"
        style={{
          backgroundColor: theme.card,
          borderTopWidth: 1,
          borderColor: theme.border,
          shadowColor: theme.text,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <View className="flex-row items-center gap-3 px-6 py-4">
          {item.quantity > 0 && (
            <View
              className="flex-row items-center rounded-2xl p-1"
              style={{
                backgroundColor: theme.inputBackground,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <TouchableOpacity
                onPress={() => updateCartItem(item.id, item.quantity - 1)}
                className="w-10 h-10 justify-center items-center rounded-xl"
                activeOpacity={0.7}
                style={{ backgroundColor: theme.card }}
              >
                <Minus color={theme.primary} size={18} strokeWidth={2.5} />
              </TouchableOpacity>

              <View className="px-4">
                <Text
                  className="text-base font-inter-bold"
                  style={{ color: theme.text }}
                >
                  {item.quantity}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => updateCartItem(item.id, item.quantity + 1)}
                className="w-10 h-10 justify-center items-center rounded-xl"
                activeOpacity={0.7}
                style={{ backgroundColor: theme.card }}
              >
                <Plus color={theme.primary} size={18} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            onPress={handleAddToCart}
            className="flex-1 flex-row items-center justify-center px-6 py-4 rounded-2xl gap-2"
            style={{
              backgroundColor: theme.primary,
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
            activeOpacity={0.8}
          >
            <Text className="text-white text-base font-inter-bold">
              Add to Cart
            </Text>
            {offer.sale_price && (
              <Text className="text-white text-sm font-inter-regular">
                • ${formatPrice(offer.sale_price)}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
