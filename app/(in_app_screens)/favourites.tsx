import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Heart,
  Bell,
  BellOff,
  Star,
  ChefHat,
  Trash2,
  ShoppingCart,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useAppStore } from '@/stores/appStore';
import { useAlert } from '@/providers/AlertProvider';

export default function FavouritesScreen() {
  const { theme } = useTheme();
  const {
    favorites,
    loadFavorites,
    removeFromFavorites,
    togglePriceAlert,
    checkPriceDrops,
    setIsNewFavoritedAdded,
  } = useFavoritesStore();
  const { addToCart } = useAppStore();
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

  const handleAddToCart = async (offer: any) => {
    await addToCart(offer);
    showAlert('Added to Cart', `${offer.title} added to cart`, 'success');
  };

  const handleTogglePriceAlert = async (
    favoriteId: string,
    enabled: boolean
  ) => {
    await togglePriceAlert(favoriteId);
    showAlert(
      enabled ? 'Alert Disabled' : 'Alert Enabled',
      enabled
        ? 'Price alert turned off'
        : 'You will be notified when price drops',
      'success'
    );
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <LinearGradient
        colors={[theme.background, theme.backgroundSecondary]}
        className="flex-1"
      >
        {/* HEADER */}
        <View
          className="flex-row items-center px-6 py-5 border-b"
          style={{
            borderBottomColor: theme.border,
            backgroundColor: theme.backgroundSecondary + '40',
            shadowColor: theme.text,
            shadowOpacity: 0.05,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
            style={{
              backgroundColor: theme.card,
              shadowColor: theme.text,
              shadowOpacity: 0.08,
              shadowRadius: 6,
            }}
          >
            <ArrowLeft color={theme.text} size={22} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text
              className="text-2xl font-extrabold"
              style={{ color: theme.text }}
            >
              Favorites
            </Text>
            <Text
              className="text-sm mt-1 tracking-wide"
              style={{ color: theme.textSecondary }}
            >
              {favorites.length} {favorites.length === 1 ? 'item' : 'items'} you
              love ❤️
            </Text>
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
        >
          {favorites.length === 0 ? (
            <View className="flex-1 items-center justify-center p-10 mt-28">
              <Heart color={theme.textSecondary} size={72} strokeWidth={1.3} />
              <Text
                className="text-2xl font-bold mt-6 text-center"
                style={{ color: theme.text }}
              >
                Your Favorites is Empty
              </Text>
              <Text
                className="text-sm mt-2 text-center leading-5"
                style={{ color: theme.textSecondary }}
              >
                Start saving the meals and offers you love the most
              </Text>
              <TouchableOpacity
                className="px-7 py-3 rounded-2xl mt-8 shadow-md"
                activeOpacity={0.8}
                style={{
                  backgroundColor: theme.primary,
                  shadowColor: theme.primary,
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                }}
                onPress={() => router.push('/(tabs)')}
              >
                <Text className="text-white font-semibold text-base">
                  Browse Offers
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="px-5 py-6 gap-5">
              {favorites.map((favorite) => {
                const hasPriceDrop =
                  favorite.favorited.discounted_price <
                  favorite.favorited.original_price;

                return (
                  <View
                    key={favorite.id}
                    className="rounded-3xl overflow-hidden"
                    style={{
                      backgroundColor: theme.card,
                      borderColor: hasPriceDrop ? theme.success : theme.border,
                      borderWidth: 1,
                      shadowColor: theme.text,
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 5 },
                    }}
                  >
                    {/* Offer Info */}
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() =>
                        router.push(
                          `/(in_app_screens)/offer-details?id=${favorite.favorited.id}`
                        )
                      }
                    >
                      <View className="flex-row">
                        <Image
                          source={favorite.favorited.image_url}
                          className="w-36 h-36 rounded-lt-3xl"
                          resizeMode="cover"
                        />
                        <View className="flex-1 p-4">
                          <View className="flex-row items-start justify-between mb-2">
                            <View className="flex-1 mr-2">
                              <Text
                                className="text-lg font-semibold leading-5"
                                style={{ color: theme.text }}
                                numberOfLines={2}
                              >
                                {favorite.favorited.title}
                              </Text>
                              <View className="flex-row items-center gap-1 mt-1.5">
                                <ChefHat
                                  color={theme.textSecondary}
                                  size={15}
                                />
                                <Text
                                  className="text-xs"
                                  style={{ color: theme.textSecondary }}
                                  numberOfLines={1}
                                >
                                  {favorite.favorited.restaurant.name}
                                </Text>
                              </View>
                            </View>

                            {/* Rating */}
                            <View
                              className="flex-row items-center gap-1 px-2.5 py-1 rounded-full"
                              style={{
                                backgroundColor: theme.warning + '25',
                              }}
                            >
                              <Star
                                color={theme.warning}
                                size={13}
                                fill={theme.warning}
                              />
                              <Text
                                className="text-xs font-semibold"
                                style={{ color: theme.text }}
                              >
                                {favorite.favorited.rating.toFixed(1)}
                              </Text>
                            </View>
                          </View>

                          {/* Prices */}
                          <View className="flex-row items-center gap-2 mb-3 mt-1">
                            {hasPriceDrop && (
                              <View
                                className="px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: theme.success + '25',
                                }}
                              >
                                <Text
                                  className="text-[10px] font-semibold uppercase tracking-wide"
                                  style={{ color: theme.success }}
                                >
                                  Price Drop
                                </Text>
                              </View>
                            )}
                            <Text
                              className="text-xs line-through"
                              style={{ color: theme.textSecondary }}
                            >
                              ${favorite.favorited.original_price.toFixed(2)}
                            </Text>
                            <Text
                              className="text-lg font-extrabold"
                              style={{ color: theme.success }}
                            >
                              ${favorite.favorited.discounted_price.toFixed(2)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Buttons */}
                    <View
                      className="flex-row items-center px-4 py-3 border-t"
                      style={{ borderTopColor: theme.border }}
                    >
                      <TouchableOpacity
                        activeOpacity={0.8}
                        className="flex-row items-center gap-2 px-3 py-2 rounded-xl mr-2"
                        style={{
                          backgroundColor: favorite.price_alert_enabled
                            ? theme.primary
                            : theme.border,
                        }}
                        onPress={() =>
                          handleTogglePriceAlert(
                            favorite.id,
                            favorite.price_alert_enabled
                          )
                        }
                      >
                        {favorite.price_alert_enabled ? (
                          <Bell color="#fff" size={16} />
                        ) : (
                          <BellOff color={theme.textSecondary} size={16} />
                        )}
                        <Text
                          className="text-xs font-semibold"
                          style={{
                            color: favorite.price_alert_enabled
                              ? '#fff'
                              : theme.textSecondary,
                          }}
                        >
                          Alert
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        className="flex-1 flex-row items-center justify-center gap-2 px-3 py-2 rounded-xl mr-2"
                        style={{
                          backgroundColor: theme.primary,
                          shadowColor: theme.primary,
                          shadowOpacity: 0.3,
                          shadowRadius: 6,
                        }}
                        onPress={() => handleAddToCart(favorite.favorited)}
                      >
                        <ShoppingCart color="#fff" size={16} />
                        <Text className="text-xs font-semibold text-white">
                          Add to Cart
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        className="px-3 py-2 rounded-xl"
                        style={{
                          backgroundColor: theme.error + '20',
                        }}
                        onPress={() =>
                          handleRemove(
                            favorite.favorited.id,
                            favorite.favorited.title
                          )
                        }
                      >
                        <Trash2 color={theme.error} size={16} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
