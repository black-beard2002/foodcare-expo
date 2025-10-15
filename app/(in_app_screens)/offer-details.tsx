import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as images from '../../constants/images';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  PlusCircle,
  ChefHat,
  Heart,
  Coins,
  Flame,
  Beef,
  Wheat,
  ShoppingCart,
  HeartPulse,
} from 'lucide-react-native';
import { useAppStore } from '@/stores/appStore';
import { Offer } from '@/types/appTypes';
import { useTheme } from '@/hooks/useTheme';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { useAlert } from '@/providers/AlertProvider';
import { BlurView } from 'expo-blur';
import {
  formatPrice,
  getDiscountPercentage,
  handleImageSrc,
} from '@/utils/helpers';

// Nutrition icon mapping
const getNutritionIcon = (key: string) => {
  const lowerKey = key.toLowerCase();
  if (lowerKey.includes('protein') || lowerKey.includes('protien')) {
    return Beef;
  } else if (lowerKey.includes('carb')) {
    return Wheat;
  } else if (lowerKey.includes('chil') || lowerKey.includes('spice')) {
    return Flame;
  }
  return null;
};

// Format nutrition value
const formatNutritionValue = (value: string | number): string => {
  if (typeof value === 'number') {
    return `${value}g`;
  }
  return value;
};

// Get nutrition display name
const getNutritionDisplayName = (key: string): string => {
  const nameMap: { [key: string]: string } = {
    protien: 'Protein',
    protein: 'Protein',
    carbs: 'Carbs',
    carbohydrates: 'Carbohydrates',
    chilly_level: 'Spice Level',
    spice_level: 'Spice Level',
    fat: 'Fat',
    fiber: 'Fiber',
    sugar: 'Sugar',
    calories: 'Calories',
  };
  return (
    nameMap[key.toLowerCase()] ||
    key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
  );
};

export default function OfferDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [offer, setOffer] = useState<Offer | null>(null);
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
  const { theme, isDark } = useTheme();
  const { addToCart } = useAppStore();

  useEffect(() => {
    const foundOffer = offers.find((o) => o.id === id);
    if (foundOffer) addToRecentlyViewed(foundOffer);
    setOffer(foundOffer || null);
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
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      {/* Header */}
      <View className="absolute top-14 left-6 z-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center shadow-lg"
          style={{ backgroundColor: `${theme.backgroundSecondary}E6` }}
        >
          <ArrowLeft color={theme.text} size={24} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Offer Image */}
        <View className="relative">
          <Image
            source={
              offer.main_image
                ? { uri: handleImageSrc(offer.main_image) }
                : images.OFFER_PLACEHOLDER_IMAGE
            }
            className="w-full h-96"
            resizeMode="cover"
          />
          {/* Gradient Overlay */}
          <View
            className="absolute inset-0"
            style={{
              backgroundColor: 'transparent',
            }}
          />
          <View
            className="absolute top-6 right-6 px-4 py-2 rounded-full shadow-lg"
            style={{ backgroundColor: theme.error }}
          >
            <Text className="text-white text-sm font-inter-bold">
              {getDiscountPercentage(offer.price, offer.sale_price ?? 0)}% OFF
            </Text>
          </View>
        </View>

        {/* Details */}
        <View
          className="flex-1 mt-[-32px] rounded-t-[32px] px-6 pt-6 pb-32"
          style={{ backgroundColor: theme.background }}
        >
          {/* Favorite Button */}
          <TouchableOpacity
            onPress={handleFavoritePress}
            className="absolute top-[-20px] right-6 p-3 rounded-full z-10 shadow-xl"
            style={{
              backgroundColor: isFavorite(id) ? theme.error : theme.card,
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
                color={isFavorite(id) ? 'white' : theme.textSecondary}
                strokeWidth={2}
                size={24}
              />
            )}
          </TouchableOpacity>

          {/* Title + Description */}
          <Text
            className="text-3xl font-inter-bold mb-3 leading-10"
            style={{ color: theme.text }}
          >
            {offer.title}
          </Text>
          <Text
            className="text-base font-inter-regular leading-6 mb-6"
            style={{ color: theme.textSecondary }}
          >
            {offer.description}
          </Text>

          {/* Restaurant Info Card */}
          <View
            className="rounded-2xl p-4 mb-6 border"
            style={{
              backgroundColor: theme.card,
              borderColor: theme.border,
            }}
          >
            <View className="flex-row justify-between items-center">
              <View className="items-center flex-1">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: `${theme.primary}15` }}
                >
                  <ChefHat color={theme.primary} size={24} />
                </View>
                <Text
                  className="text-xs font-inter-medium"
                  style={{ color: theme.textSecondary }}
                >
                  Restaurant
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-sm font-inter-bold mt-0.5"
                  style={{ color: theme.text }}
                >
                  {'Food Place'}
                </Text>
              </View>

              <View className="items-center flex-1">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: '#FFD70015' }}
                >
                  <Star color="#FFD700" fill="#FFD700" size={24} />
                </View>
                <Text
                  className="text-xs font-inter-medium"
                  style={{ color: theme.textSecondary }}
                >
                  Rating
                </Text>
                <Text
                  className="text-sm font-inter-bold mt-0.5"
                  style={{ color: theme.text }}
                >
                  5.0
                </Text>
              </View>

              <View className="items-center flex-1">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: `${theme.primary}15` }}
                >
                  <Clock color={theme.primary} size={24} />
                </View>
                <Text
                  className="text-xs font-inter-medium"
                  style={{ color: theme.textSecondary }}
                >
                  Time
                </Text>
                <Text
                  className="text-sm font-inter-bold mt-0.5"
                  style={{ color: theme.text }}
                >
                  15-20m
                </Text>
              </View>

              <View className="items-center flex-1">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: `${theme.primary}15` }}
                >
                  <MapPin color={theme.primary} size={24} />
                </View>
                <Text
                  className="text-xs font-inter-medium"
                  style={{ color: theme.textSecondary }}
                >
                  Distance
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-sm font-inter-bold mt-0.5"
                  style={{ color: theme.text }}
                >
                  2.5 km
                </Text>
              </View>
            </View>
          </View>

          {/* Pricing Card */}
          <View
            className="rounded-2xl p-5 mb-6 border"
            style={{
              backgroundColor: theme.card,
              borderColor: theme.border,
            }}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text
                  className="text-sm font-inter-medium mb-1"
                  style={{ color: theme.textSecondary }}
                >
                  Original Price
                </Text>
                <Text
                  className="text-lg line-through font-inter-regular mb-3"
                  style={{ color: theme.textSecondary }}
                >
                  ${formatPrice(offer.price)}
                </Text>
                {offer.sale_price && (
                  <>
                    <Text
                      className="text-sm font-inter-medium mb-1"
                      style={{ color: theme.primary }}
                    >
                      Special Price
                    </Text>
                    <Text
                      className="text-3xl font-inter-bold"
                      style={{ color: theme.primary }}
                    >
                      ${formatPrice(offer.sale_price)}
                    </Text>
                  </>
                )}
              </View>

              <View className="items-end">
                <View
                  className="flex-row items-center gap-2 px-4 py-3 rounded-2xl"
                  style={{
                    backgroundColor: `${theme.success}20`,
                  }}
                >
                  <Coins color={theme.success} size={24} />
                  <View>
                    <Text
                      className="text-xs font-inter-medium"
                      style={{ color: theme.success }}
                    >
                      You Save
                    </Text>
                    <Text
                      className="text-xl font-inter-bold"
                      style={{ color: theme.success }}
                    >
                      ${(offer.price - (offer.sale_price ?? 0)).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Tags */}
          {offer.tags && offer.tags?.length > 0 && (
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
                    className="px-4 py-2 rounded-full border"
                    style={{
                      backgroundColor: theme.card,
                      borderColor: theme.primary,
                    }}
                  >
                    <Text
                      className="text-sm font-inter-medium"
                      style={{ color: theme.primary }}
                    >
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Nutrition Facts */}
          {offer.custom_properties &&
            Object.keys(offer.custom_properties || {}).length > 0 && (
              <View className="mb-6">
                <View className="flex-row gap-1 items-center mb-3">
                  <HeartPulse size={30} color={theme.primary} />
                  <Text
                    className="text-3xl font-inter-bold"
                    style={{ color: theme.text }}
                  >
                    Nutrition Facts
                  </Text>
                  <Text
                    className="text-base font-inter-bold"
                    style={{ color: theme.text }}
                  >
                    ({Object.keys(offer.custom_properties || {}).length})
                  </Text>
                </View>

                <View
                  className="rounded-2xl p-5 border"
                  style={{
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  }}
                >
                  <View className="flex-row flex-wrap gap-3">
                    {Object.entries(offer.custom_properties).map(
                      ([key, value], index) => {
                        const Icon = getNutritionIcon(key);

                        return (
                          <View
                            key={index}
                            className="flex-1 min-w-[30%] rounded-xl p-4 border"
                            style={{
                              backgroundColor: theme.background,
                              borderColor: theme.border,
                            }}
                          >
                            <View className="flex-row items-center gap-2 mb-2">
                              {Icon && (
                                <View
                                  className="w-8 h-8 rounded-full items-center justify-center"
                                  style={{
                                    backgroundColor: `${theme.primary}15`,
                                  }}
                                >
                                  <Icon color={theme.primary} size={16} />
                                </View>
                              )}
                              <Text
                                className="text-xs font-inter-medium flex-1"
                                style={{ color: theme.textSecondary }}
                              >
                                {getNutritionDisplayName(key)}
                              </Text>
                            </View>

                            <Text
                              className="text-xl font-inter-bold"
                              style={{ color: theme.text }}
                            >
                              {formatNutritionValue(value)}
                            </Text>
                          </View>
                        );
                      }
                    )}
                  </View>
                </View>
              </View>
            )}
        </View>
      </ScrollView>

      {/* Footer */}
      <BlurView
        className="absolute bottom-0 left-0 right-0 border-t"
        intensity={50}
        tint={isDark ? 'dark' : 'light'}
        style={{
          backgroundColor: `${theme.card}95`,
          borderColor: theme.border,
        }}
      >
        <View className="flex-row gap-3 items-center px-6 py-4">
          <TouchableOpacity
            onPress={handleAddToCart}
            className="flex-row flex-1 items-center px-6 py-4 rounded-2xl gap-2 shadow-lg"
            style={{ backgroundColor: theme.primary }}
            activeOpacity={0.8}
          >
            <PlusCircle color="#fff" size={22} />
            <Text className="text-white text-base font-inter-bold">
              Add to Cart
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/cart')}
            className="flex-row items-center px-6 py-4 rounded-2xl gap-2 shadow-lg"
            style={{ backgroundColor: '#1055C9' }}
            activeOpacity={0.8}
          >
            <ShoppingCart color="#fff" size={22} />
            <Text className="text-white text-base font-inter-bold">
              Go to Cart
            </Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </SafeAreaView>
  );
}
