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
    isLoading,
  } = useFavoritesStore();
  const { addToCart } = useAppStore();
  const { showAlert } = useAlert();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFavorites();
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
        <View
          className="flex-row items-center px-6 py-4 border-b"
          style={{ borderBottomColor: theme.border }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: theme.card }}
          >
            <ArrowLeft color={theme.text} size={24} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold" style={{ color: theme.text }}>
              Favorites
            </Text>
            <Text
              className="text-sm mt-0.5"
              style={{ color: theme.textSecondary }}
            >
              {favorites.length} {favorites.length === 1 ? 'item' : 'items'}{' '}
              saved
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
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
            <View className="flex-1 items-center justify-center p-10 mt-20">
              <Heart color={theme.textSecondary} size={64} />
              <Text
                className="text-xl font-bold mt-4 text-center"
                style={{ color: theme.text }}
              >
                No Favorites Yet
              </Text>
              <Text
                className="text-sm mt-2 text-center"
                style={{ color: theme.textSecondary }}
              >
                Start adding items to your favorites to see them here
              </Text>
              <TouchableOpacity
                className="px-6 py-3 rounded-xl mt-6"
                style={{ backgroundColor: theme.primary }}
                onPress={() => router.push('/(tabs)')}
              >
                <Text className="text-white font-semibold">Browse Offers</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="px-6 py-6 gap-4">
              {favorites.map((favorite) => {
                const hasPriceDrop =
                  'discounted_price' in favorite.favorited
                    ? favorite.favorited.discounted_price
                    : 0 < favorite.original_price_tracked;

                return (
                  <View
                    key={favorite.id}
                    className="rounded-2xl overflow-hidden border"
                    style={{
                      backgroundColor: theme.card,
                      borderColor: hasPriceDrop ? theme.success : theme.border,
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        router.push(
                          `/(in_app_screens)/offer-details?id=${favorite.favorited.id}`
                        )
                      }
                    >
                      <View className="flex-row">
                        <Image
                          source={favorite.favorited.image_url}
                          className="w-28 h-32"
                          resizeMode="cover"
                        />
                        <View className="flex-1 p-4">
                          <View className="flex-row items-start justify-between mb-2">
                            <View className="flex-1 mr-2">
                              <Text
                                className="text-base font-bold"
                                style={{ color: theme.text }}
                                numberOfLines={2}
                              >
                                {'title' in favorite.favorited
                                  ? favorite.favorited.title
                                  : favorite.favorited.name}
                              </Text>
                              <View className="flex-row items-center gap-1 mt-1">
                                <ChefHat
                                  color={theme.textSecondary}
                                  size={14}
                                />
                                <Text
                                  className="text-xs"
                                  style={{ color: theme.textSecondary }}
                                  numberOfLines={1}
                                >
                                  {'restaurant' in favorite.favorited
                                    ? favorite.favorited.restaurant.name
                                    : 'n/a'}
                                </Text>
                              </View>
                            </View>
                            <View
                              className="flex-row items-center gap-1 px-2 py-1 rounded-lg"
                              style={{ backgroundColor: theme.warning + '20' }}
                            >
                              <Star
                                color={theme.warning}
                                size={12}
                                fill={theme.text}
                              />
                              <Text
                                className="text-xs font-semibold"
                                style={{ color: theme.text }}
                              >
                                {'rating' in favorite.favorited
                                  ? favorite.favorited.rating.toFixed(1)
                                  : 'n/a'}
                              </Text>
                            </View>
                          </View>

                          <View className="flex-row items-center gap-2 mb-2">
                            {hasPriceDrop && (
                              <View
                                className="px-2 py-1 rounded-lg"
                                style={{
                                  backgroundColor: theme.success + '20',
                                }}
                              >
                                <Text
                                  className="text-xs font-semibold"
                                  style={{ color: theme.textInverse }}
                                >
                                  Price Drop!
                                </Text>
                              </View>
                            )}
                            <Text
                              className="text-xs line-through"
                              style={{ color: theme.textSecondary }}
                            >
                              {'original_price' in favorite.favorited
                                ? '$'.concat(
                                    favorite.favorited.original_price.toFixed(2)
                                  )
                                : 'n/a'}
                            </Text>
                            <Text
                              className="text-lg font-bold"
                              style={{ color: theme.success }}
                            >
                              {'discounted_price' in favorite.favorited
                                ? '$'.concat(
                                    favorite.favorited.discounted_price.toFixed(
                                      2
                                    )
                                  )
                                : 'n/a'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>

                    <View
                      className="flex-row items-center px-4 py-3 border-t"
                      style={{ borderTopColor: theme.border }}
                    >
                      <TouchableOpacity
                        className="flex-row items-center gap-2 px-3 py-2 rounded-lg mr-2"
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
                        className="flex-1 flex-row items-center justify-center gap-2 px-3 py-2 rounded-lg mr-2"
                        style={{ backgroundColor: theme.primary }}
                        onPress={() => handleAddToCart(favorite.favorited)}
                      >
                        <ShoppingCart color="#fff" size={16} />
                        <Text className="text-xs font-semibold text-white">
                          Add to Cart
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="px-3 py-2 rounded-lg"
                        style={{ backgroundColor: theme.error + '20' }}
                        onPress={() =>
                          handleRemove(
                            favorite.favorited.id,
                            'title' in favorite.favorited
                              ? favorite.favorited.title
                              : favorite.favorited.name
                          )
                        }
                      >
                        <Trash2 color={theme.textInverse} size={16} />
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
