import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Heart,
  Star,
  ChefHat,
  MapPin,
  TrendingDown,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import * as images from '@/constants/images';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useAppStore } from '@/stores/appStore';
import { useAlert } from '@/providers/AlertProvider';
import {
  formatPrice,
  handleImageSrc,
  getDiscountPercentage,
} from '@/utils/helpers';

export default function FavouritesScreen() {
  const { theme } = useTheme();
  const {
    favorites,
    loadFavorites,
    removeFromFavorites,
    checkPriceDrops,
    setIsNewFavoritedAdded,
  } = useFavoritesStore();
  const { offers } = useAppStore();
  const { showAlert } = useAlert();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFavorites();
    setIsNewFavoritedAdded(false);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    const priceDrops = checkPriceDrops();
    if (priceDrops.length > 0) {
      showAlert(
        'Price Drops!',
        `${priceDrops.length} items in your favorites have price drops`,
        'success'
      );
    }
    setRefreshing(false);
  };

  const handleRemove = async (offerId: string, offerTitle: string) => {
    await removeFromFavorites(offerId);
    showAlert('Removed', `${offerTitle} removed from favorites`, 'success');
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      {/* HEADER */}
      <View
        className="px-6 py-5"
        style={{
          backgroundColor: theme.card,
          shadowColor: theme.text,
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 2 },
          elevation: 4,
        }}
      >
        <View className="flex-row items-center mb-3">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="w-11 h-11 rounded-2xl items-center justify-center mr-4"
            style={{
              backgroundColor: theme.background,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <ArrowLeft color={theme.text} size={22} strokeWidth={2.5} />
          </TouchableOpacity>

          <View className="flex-1">
            <Text
              className="text-3xl font-inter-bold"
              style={{ color: theme.text }}
            >
              My Favorites
            </Text>
          </View>

          <View
            className="w-12 h-12 rounded-2xl items-center justify-center"
            style={{
              backgroundColor: theme.error + '15',
            }}
          >
            <Heart
              color={theme.error}
              size={24}
              fill={theme.error}
              strokeWidth={0}
            />
          </View>
        </View>

        {/* Stats Bar */}
        <View className="flex-row items-center gap-3 mt-2">
          <View
            className="flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl"
            style={{
              backgroundColor: theme.background,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <ShoppingBag color={theme.primary} size={18} />
            <Text
              className="text-base font-inter-bold ml-2"
              style={{ color: theme.text }}
            >
              {favorites.length}
            </Text>
            <Text
              className="text-sm font-inter-medium ml-1"
              style={{ color: theme.textSecondary }}
            >
              {favorites.length === 1 ? 'Item' : 'Items'}
            </Text>
          </View>

          {checkPriceDrops().length > 0 && (
            <View
              className="flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl"
              style={{
                backgroundColor: theme.success + '15',
                borderWidth: 1,
                borderColor: theme.success + '40',
              }}
            >
              <TrendingDown color={theme.success} size={18} />
              <Text
                className="text-base font-inter-bold ml-2"
                style={{ color: theme.success }}
              >
                {checkPriceDrops().length}
              </Text>
              <Text
                className="text-sm font-inter-medium ml-1"
                style={{ color: theme.success }}
              >
                Deals
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* BODY */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {favorites.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8 py-20">
            <View
              className="w-32 h-32 rounded-full items-center justify-center mb-6"
              style={{
                backgroundColor: theme.card,
                borderWidth: 3,
                borderColor: theme.border,
                borderStyle: 'dashed',
              }}
            >
              <Heart color={theme.textSecondary} size={64} strokeWidth={1.5} />
            </View>

            <Text
              className="text-2xl font-inter-bold text-center mb-3"
              style={{ color: theme.text }}
            >
              No Favorites Yet
            </Text>

            <Text
              className="text-base text-center leading-6 mb-8"
              style={{ color: theme.textSecondary }}
            >
              Start building your collection of favorite meals and offers
            </Text>

            <TouchableOpacity
              className="px-8 py-4 rounded-2xl shadow-lg flex-row items-center gap-2"
              activeOpacity={0.8}
              style={{
                backgroundColor: theme.primary,
                shadowColor: theme.primary,
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
              onPress={() => router.push('/(tabs)')}
            >
              <ShoppingBag color="white" size={20} />
              <Text className="text-white font-inter-bold text-base">
                Explore Offers
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-5 py-6">
            {favorites.map((favorite, index) => {
              const hasPriceDrop =
                favorite.favorited.sale_price &&
                favorite.favorited.sale_price < favorite.favorited.price;

              const isAvailable = offers.some(
                (off) =>
                  off.id === favorite?.favorited?.id && off.status !== 'hidden'
              );

              const discountPercent = favorite.favorited.sale_price
                ? getDiscountPercentage(
                    favorite.favorited.price,
                    favorite.favorited.sale_price
                  )
                : 0;

              return (
                <TouchableOpacity
                  key={favorite.id}
                  activeOpacity={0.9}
                  disabled={!isAvailable}
                  onPress={() =>
                    router.push(
                      `/(in_app_screens)/offer-details?id=${favorite.favorited.id}`
                    )
                  }
                  className="mb-4 rounded-3xl overflow-hidden"
                  style={{
                    backgroundColor: theme.card,
                    borderWidth: 1,
                    borderColor: theme.border,
                    shadowColor: theme.text,
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 5,
                    opacity: !isAvailable ? 0.6 : 1,
                  }}
                >
                  {/* Image Section */}
                  <View className="relative">
                    <Image
                      source={
                        favorite.favorited.main_image
                          ? {
                              uri: handleImageSrc(
                                favorite.favorited.main_image
                              ),
                            }
                          : images.OFFER_PLACEHOLDER_IMAGE
                      }
                      style={{ width: '100%', height: 180 }}
                      resizeMode="cover"
                    />

                    {/* Gradient Overlay */}
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.7)']}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 100,
                      }}
                    />

                    {/* Unavailable Badge */}
                    {!isAvailable && (
                      <View
                        className="absolute top-4 left-4 flex-row items-center gap-2 px-4 py-2 rounded-xl"
                        style={{
                          backgroundColor: 'rgba(0,0,0,1)',
                          zIndex: 30,
                        }}
                      >
                        <AlertCircle color="white" size={16} />
                        <Text className="text-white text-sm font-inter-bold">
                          Unavailable
                        </Text>
                      </View>
                    )}

                    {/* Discount Badge */}
                    {isAvailable && discountPercent > 0 && (
                      <View
                        className="absolute top-4 left-4 px-4 py-2 rounded-xl"
                        style={{
                          backgroundColor: theme.error,
                        }}
                      >
                        <Text className="text-white text-sm font-inter-bold">
                          {discountPercent}% OFF
                        </Text>
                      </View>
                    )}

                    {/* Price Drop Badge */}
                    {isAvailable && hasPriceDrop && (
                      <View
                        className="absolute top-4 right-4 flex-row items-center gap-1 px-3 py-2 rounded-xl"
                        style={{
                          backgroundColor: theme.success,
                        }}
                      >
                        <TrendingDown
                          color="white"
                          size={16}
                          strokeWidth={2.5}
                        />
                        <Text className="text-white text-xs font-inter-bold">
                          Price Drop
                        </Text>
                      </View>
                    )}

                    {/* Remove Heart Button */}
                    <TouchableOpacity
                      onPress={() =>
                        handleRemove(
                          favorite.favorited.id,
                          favorite.favorited.title
                        )
                      }
                      className="absolute bottom-4 right-4 w-12 h-12 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        shadowColor: '#000',
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 4,
                      }}
                    >
                      <Heart
                        color={theme.error}
                        size={22}
                        fill={theme.error}
                        strokeWidth={0}
                      />
                    </TouchableOpacity>

                    {/* Provider Logo */}
                    {favorite.favorited.provider?.logo_path && (
                      <View
                        className="absolute bottom-4 left-4 rounded-xl overflow-hidden"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.95)',

                          shadowColor: '#000',
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                        }}
                      >
                        <Image
                          source={{
                            uri: handleImageSrc(
                              favorite.favorited.provider.logo_path
                            ),
                          }}
                          style={{ width: 48, height: 48, borderRadius: 10 }}
                          resizeMode="cover"
                        />
                      </View>
                    )}
                  </View>

                  {/* Content Section */}
                  <View className="p-5">
                    {/* Title */}
                    <Text
                      className="text-xl font-inter-bold mb-2 leading-6"
                      style={{ color: theme.text }}
                      numberOfLines={2}
                    >
                      {favorite.favorited.title}
                    </Text>

                    {/* Provider Info */}
                    {favorite.favorited.provider && (
                      <View className="flex-row items-center gap-2 mb-4">
                        <View
                          className="w-8 h-8 rounded-full items-center justify-center"
                          style={{ backgroundColor: theme.primary + '15' }}
                        >
                          <ChefHat color={theme.primary} size={16} />
                        </View>
                        <Text
                          className="text-sm font-inter-medium flex-1"
                          style={{ color: theme.textSecondary }}
                          numberOfLines={1}
                        >
                          {favorite.favorited.provider.name}
                        </Text>

                        {/* Rating */}
                        <View className="flex-row items-center gap-1">
                          <Star
                            color={theme.warning}
                            fill={theme.warning}
                            size={16}
                          />
                          <Text
                            className="text-sm font-inter-bold"
                            style={{ color: theme.text }}
                          >
                            {favorite.favorited.rating || '5.0'}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Location */}
                    {favorite.favorited.provider?.addresses?.[0] && (
                      <View className="flex-row items-center gap-2 mb-4">
                        <MapPin color={theme.textSecondary} size={16} />
                        <Text
                          className="text-sm font-inter-regular flex-1"
                          style={{ color: theme.textSecondary }}
                          numberOfLines={1}
                        >
                          {favorite.favorited.provider.addresses[0].street},{' '}
                          {favorite.favorited.provider.addresses[0].city}
                        </Text>
                      </View>
                    )}

                    {/* Price Section */}
                    <View
                      className="flex-row items-center justify-between pt-4"
                      style={{
                        borderTopWidth: 1,
                        borderTopColor: theme.border + '40',
                      }}
                    >
                      <View>
                        {favorite.favorited.sale_price && (
                          <Text
                            className="text-sm line-through mb-1"
                            style={{ color: theme.textSecondary }}
                          >
                            ${formatPrice(favorite.favorited.price)}
                          </Text>
                        )}
                        <View className="flex-row items-center gap-2">
                          <Text
                            className="text-3xl font-inter-bold"
                            style={{ color: theme.primary }}
                          >
                            $
                            {formatPrice(
                              favorite.favorited.sale_price ??
                                favorite.favorited.price
                            )}
                          </Text>
                          {favorite.favorited.sale_price && (
                            <View
                              className="px-2 py-1 rounded-lg"
                              style={{
                                backgroundColor: theme.success + '20',
                              }}
                            >
                              <Text
                                className="text-xs font-inter-bold"
                                style={{ color: theme.success }}
                              >
                                Save $
                                {formatPrice(
                                  favorite.favorited.price -
                                    favorite.favorited.sale_price
                                )}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {isAvailable && (
                        <TouchableOpacity
                          onPress={() =>
                            router.push(
                              `/(in_app_screens)/offer-details?id=${favorite.favorited.id}`
                            )
                          }
                          disabled={!isAvailable}
                          className="px-6 py-3 rounded-2xl"
                          style={{
                            backgroundColor: theme.primary,
                            shadowColor: theme.primary,
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 4,
                          }}
                        >
                          <Text className="text-white text-sm font-inter-bold">
                            View Details
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
