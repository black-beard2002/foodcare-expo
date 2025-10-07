import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
} from 'lucide-react-native';
import { useAppStore } from '@/stores/appStore';
import { dummyOffers } from '@/data/dummyData';
import { Offer } from '@/types/appTypes';
import { useTheme } from '@/hooks/useTheme';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { useAlert } from '@/providers/AlertProvider';
import { BlurView } from 'expo-blur';

export default function OfferDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [offer, setOffer] = useState<Offer | null>(null);
  const { addToRecentlyViewed } = useRecentlyViewedStore();
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
    const foundOffer = dummyOffers.find((o) => o.id === id);
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

  const handleAddToCart = () => addToCart(offer);

  const renderItemCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="flex-row p-4 rounded-2xl border shadow-sm"
      style={{ backgroundColor: theme.card, borderColor: theme.border }}
      onPress={() =>
        router.push(`/(in_app_screens)/item-details?id=${item.id}`)
      }
    >
      <Image source={item.image_url} className="w-20 h-20 rounded-xl" />
      <View className="flex-1 ml-4 justify-between">
        <Text
          numberOfLines={2}
          className="text-base font-inter-bold mb-1 leading-6"
          style={{ color: theme.text }}
        >
          {item.name}
        </Text>
        <Text
          numberOfLines={2}
          className="text-sm font-inter-regular leading-5 mb-2"
          style={{ color: theme.textSecondary }}
        >
          {item.description}
        </Text>
        <View className="flex-row justify-between items-center">
          <Text
            className="text-base font-inter-bold"
            style={{ color: theme.primary }}
          >
            ${item.price.toFixed(2)}
          </Text>
          <Text
            className="text-xs font-inter-regular"
            style={{ color: theme.textSecondary }}
          >
            {item.calories} cal
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      {/* Header */}
      <View className="absolute top-14 left-6 z-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: theme.backgroundSecondary }}
        >
          <ArrowLeft color={theme.textSecondary} size={24} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Offer Image */}
        <View className="relative">
          <Image
            source={offer.image_url}
            className="w-full h-72 rounded-2xl"
            resizeMode="contain"
          />
          <View
            className="absolute top-6 right-6 px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="text-white text-sm font-inter-bold">
              {offer.discount_percentage}% OFF
            </Text>
          </View>
        </View>

        {/* Details */}
        <View
          className="flex-1 mt-[-20px] rounded-t-3xl px-6 pt-6 pb-24"
          style={{ backgroundColor: theme.backgroundSecondary }}
        >
          {/* Favorite */}
          <TouchableOpacity
            onPress={handleFavoritePress}
            className="absolute top-4 right-6 p-2.5 rounded-xl z-10"
            style={{
              backgroundColor: isFavorite(id) ? theme.accent : theme.card,
            }}
          >
            {isLoading ? (
              <ActivityIndicator />
            ) : (
              <Heart fill={isFavorite(id) ? 'white' : 'gray'} strokeWidth={0} />
            )}
          </TouchableOpacity>

          {/* Title + Description */}
          <Text
            className="text-2xl font-inter-bold mb-3 text-center leading-9"
            style={{ color: theme.text }}
          >
            {offer.title}
          </Text>
          <Text
            className="text-sm font-inter-regular leading-6 mb-6 text-center"
            style={{ color: theme.textSecondary }}
          >
            {offer.description}
          </Text>

          {/* Restaurant Info */}
          <View className="flex-row gap-3 items-center justify-between mb-6">
            <View className="items-center flex-1 h-full">
              <ChefHat color={theme.primary} size={20} />
              <Text
                className="text-xs mt-1 text-center"
                style={{ color: theme.text }}
              >
                {offer.restaurant.name}
              </Text>
            </View>
            <View
              className="w-px h-6"
              style={{ backgroundColor: theme.textSecondary }}
            />
            <View className="items-center flex-1 h-full">
              <Star color="#FFD700" size={20} />
              <Text
                className="text-xs mt-1 text-center"
                style={{ color: theme.text }}
              >
                {offer.restaurant.rating}
              </Text>
            </View>
            <View
              className="w-px h-6"
              style={{ backgroundColor: theme.textSecondary }}
            />
            <View className="items-center flex-1 h-full jutify-center">
              <Clock color={theme.primary} size={20} />
              <Text
                className="text-xs mt-1 text-center"
                style={{ color: theme.text }}
              >
                {offer.restaurant.delivery_time} mins
              </Text>
            </View>
            <View
              className="w-px h-6"
              style={{ backgroundColor: theme.textSecondary }}
            />
            <View className="items-center flex-1 h-full jutify-center">
              <MapPin color={theme.primary} size={20} />
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ color: theme.text }}
                className="text-xs mt-1 text-center"
              >
                {offer.restaurant.address}
              </Text>
            </View>
          </View>

          {/* Pricing */}
          <View className="flex-row justify-between items-end mb-6">
            <View>
              <Text
                className="text-sm line-through font-inter-regular mb-1"
                style={{ color: theme.textSecondary }}
              >
                Was ${offer.original_price.toFixed(2)}
              </Text>
              <Text
                className="text-2xl font-inter-bold"
                style={{ color: theme.primary }}
              >
                Now ${offer.discounted_price.toFixed(2)}
              </Text>
            </View>
            <View
              className="flex-row items-center gap-1 px-4 py-2 rounded-xl"
              style={{
                backgroundColor: `${theme.success}20`,
              }}
            >
              <Coins color={theme.success} size={16} />
              <Text
                className="text-base font-inter-medium"
                style={{ color: theme.success }}
              >
                {(offer.original_price - offer.discounted_price).toFixed(2)}$
              </Text>
            </View>
          </View>

          {/* Tags */}
          {offer.tags?.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-8">
              {offer.tags.map((tag, i) => (
                <View
                  key={i}
                  className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: `${theme.primary}20` }}
                >
                  <Text
                    className="text-xs font-inter-medium"
                    style={{ color: theme.text }}
                  >
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Included Items */}
          <View className="mb-24">
            <Text
              className="text-lg font-inter-bold mb-4"
              style={{ color: theme.text }}
            >
              Included Items ({offer.items.length})
            </Text>
            <FlatList
              data={offer.items}
              renderItem={renderItemCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerClassName="gap-3 pb-4"
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <BlurView
        className="absolute bottom-0 left-0 right-0 border-t"
        intensity={50}
        tint={isDark ? 'dark' : 'light'}
        style={{
          backgroundColor: `${theme.card}30`,
          borderColor: theme.border,
        }}
      >
        <View className="flex-row justify-between items-center p-6">
          <View>
            <Text
              className="text-xl font-inter-bold"
              style={{ color: theme.primary }}
            >
              ${offer.discounted_price.toFixed(2)}
            </Text>
            <Text
              className="text-sm font-inter-medium"
              style={{ color: theme.success }}
            >
              Save ${(offer.original_price - offer.discounted_price).toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleAddToCart}
            className="flex-row items-center px-6 py-4 rounded-xl gap-2"
            style={{ backgroundColor: theme.primary }}
          >
            <PlusCircle color="#fff" size={20} />
            <Text className="text-white text-base font-inter-medium">
              Add to Cart
            </Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </SafeAreaView>
  );
}
