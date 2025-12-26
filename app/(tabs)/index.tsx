import React, {
  JSX,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import {
  Search,
  Sparkles,
  UtensilsCrossed,
  MapPin,
  ShoppingCart,
  Sun,
  Moon,
  Route,
  Heart,
  CalendarDays,
  CalendarPlus,
  ArrowRight,
  Zap,
  TrendingUp,
} from 'lucide-react-native';

import { useAppStore } from '@/stores/appStore';
import { useTheme } from '@/hooks/useTheme';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterOptions, Provider } from '@/types/appTypes';
import FilterModal from '@/components/HomeScreenFilter';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useAuthStore } from '@/stores/authStore';
import * as Haptics from 'expo-haptics';

import Carousel from 'react-native-reanimated-carousel';

import HomeHeroMessage from '@/components/HomeHeroMessage';
import NetworkStatusBanner from '@/components/NetworkStatusBanner';
import AnimatedBadge from '@/components/AnimatedBadge';
import FeaturedCardSkeleton from '@/components/skeletons/FeaturedCardSkeleton';
import ModernFeaturedCard from '@/components/ModernFeaturedCard';
import CategoryChipSkeleton from '@/components/skeletons/CategoryChipSkeleton';
import ModernCategoryChip from '@/components/ModernCategoryChip';
import OfferCardSkeleton from '@/components/skeletons/OfferCardSkeleton';
import NearYouCard from '@/components/NearYouCard';
import DefaultOfferCard from '@/components/DefaultOfferCard';
import { LatLng, Region } from 'react-native-maps';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NEAR_ME_RADIUS_KM = 3;

export default function HomeScreen(): JSX.Element {
  const { theme, isDark, toggleTheme } = useTheme();
  const {
    offers,
    categories,
    isLoading,
    refreshData,
    addToCart,
    isOffline,
    syncStatus,
    loadCachedData,
    initNetworkListener,
    getCartItemCount,
  } = useAppStore();
  const { isNewFavoritedAdded } = useFavoritesStore();
  const { user } = useAuthStore();
  const { addToFavorites, removeFromFavorites, isFavorite } =
    useFavoritesStore();
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const hasFetched = useRef(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions | null>(
    null
  );
  const [filteredOffers, setFilteredOffers] = useState(offers);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      await loadCachedData();
      initNetworkListener();
    };
    if (hasFetched.current) return;
    hasFetched.current = true;
    init();
  }, []);

  useEffect(() => {
    setFilteredOffers(offers);
  }, [offers]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refreshData(true);
    setRefreshing(false);
  }, []);

  const handleGetCurrentLocation = useCallback(
    async (showAlertMessage: boolean = true) => {
      setIsGettingLocation(true);

      try {
        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          setIsGettingLocation(false);
          return;
        }

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Location access is required to show nearby restaurants.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  } else {
                    Linking.openSettings();
                  }
                },
              },
            ]
          );
          setIsGettingLocation(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = location.coords;

        setUserLocation({ latitude, longitude });
      } catch (error: any) {
        console.error('Error getting location:', error);
      } finally {
        setIsGettingLocation(false);
      }
    },
    []
  );

  // Initial location load
  useEffect(() => {
    handleGetCurrentLocation(false);
  }, []);

  const featuredOffers = useMemo(
    () => offers.filter((offer) => offer.is_featured),
    [offers]
  );

  const nearYouOffers = useMemo(
    () => filteredOffers.filter((offer) => offer.title !== '').slice(0, 10),
    [filteredOffers]
  );

  const todaysOffers = useMemo(() => {
    const today = new Date();
    return filteredOffers.filter((offer) => {
      if (!offer.pickup_start_time) return false;
      const pickupDate = new Date(offer.pickup_start_time);
      return (
        pickupDate.getFullYear() === today.getFullYear() &&
        pickupDate.getMonth() === today.getMonth() &&
        pickupDate.getDate() === today.getDate()
      );
    });
  }, [filteredOffers]);

  const tomorrowsOffers = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return filteredOffers.filter((offer) => {
      if (!offer.pickup_start_time) return false;
      const pickupDate = new Date(offer.pickup_start_time);
      return (
        pickupDate.getFullYear() === tomorrow.getFullYear() &&
        pickupDate.getMonth() === tomorrow.getMonth() &&
        pickupDate.getDate() === tomorrow.getDate()
      );
    });
  }, [filteredOffers]);

  const cartCount = getCartItemCount();

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getAllRestaurants = useCallback((): Provider[] => {
    const restaurantMap: { [key: string]: Provider } = {};
    offers.forEach((offer) => {
      if (offer.provider && !restaurantMap[offer.provider.id]) {
        restaurantMap[offer.provider.id] = offer.provider;
      }
    });
    return Object.values(restaurantMap);
  }, [offers]);

  // Fixed: Check ALL provider addresses instead of just the first one
  const getNearMeRestaurants = useCallback(
    (userLat: number, userLon: number): Provider[] => {
      return getAllRestaurants().filter((restaurant) => {
        // Check if ANY of the restaurant's addresses are within range
        return restaurant.addresses.some((address) => {
          const distance = calculateDistance(
            userLat,
            userLon,
            address.latitude,
            address.longitude
          );
          return distance <= NEAR_ME_RADIUS_KM;
        });
      });
    },
    [getAllRestaurants]
  );

  const nearMeRestaurants = useMemo(() => {
    if (!userLocation) return [];
    return getNearMeRestaurants(userLocation.latitude, userLocation.longitude);
  }, [userLocation, getNearMeRestaurants]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.backgroundSecondary }}
    >
      <NetworkStatusBanner
        isOffline={isOffline}
        syncStatus={syncStatus}
        theme={theme}
      />

      {/* Modern Header with Gradient Effect */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 20,
          backgroundColor: theme.card,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: theme.textSecondary,
                  fontFamily: 'PoppinsLight',
                }}
              >
                👋 Welcome back
              </Text>
            </View>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <View
                style={{
                  backgroundColor: theme.primary + '20',
                  padding: 6,
                  borderRadius: 8,
                }}
              >
                <MapPin size={16} color={theme.primary} />
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: 'FredokaMedium',
                  color: theme.text,
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {user?.address?.split(',')[0] || 'Food Lover'}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              style={{
                width: 38,
                height: 38,
                borderRadius: 16,
                backgroundColor: theme.backgroundSecondary,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              {isDark ? (
                <Sun color={theme.primary} size={17} strokeWidth={2.5} />
              ) : (
                <Moon color={theme.primary} size={17} strokeWidth={2.5} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 38,
                height: 38,
                borderRadius: 16,
                backgroundColor: theme.backgroundSecondary,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={() => router.push('/(tabs)/cart')}
              activeOpacity={0.7}
            >
              <ShoppingCart color={theme.primary} size={17} strokeWidth={2.5} />
              <AnimatedBadge count={cartCount} color={theme.error} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 38,
                height: 38,
                borderRadius: 16,
                backgroundColor: theme.backgroundSecondary,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={() => router.push('/(in_app_screens)/favourites')}
              activeOpacity={0.7}
            >
              <Heart
                color={isNewFavoritedAdded ? theme.error : theme.primary}
                fill={isNewFavoritedAdded ? theme.error : 'transparent'}
                size={17}
                strokeWidth={isNewFavoritedAdded ? 0 : 2.5}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={{
            marginTop: 16,
            backgroundColor: theme.backgroundSecondary,
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 2,
          }}
          onPress={() => router.push('/(in_app_screens)/search')}
          activeOpacity={0.8}
        >
          <Search color={theme.textSecondary} size={20} strokeWidth={2.5} />
          <Text
            style={{
              flex: 1,
              fontSize: 15,
              color: theme.textSecondary,
              fontFamily: 'PoppinsLight',
            }}
          >
            Search for food, restaurants...
          </Text>
          <View
            style={{
              backgroundColor: theme.primary + '20',
              padding: 6,
              borderRadius: 8,
            }}
          >
            <Sparkles size={16} color={theme.primary} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        <HomeHeroMessage theme={theme} />

        {/* Featured Offers Carousel */}
        {isLoading ? (
          <View style={{ marginBottom: 24, paddingHorizontal: 20 }}>
            <FeaturedCardSkeleton isDark={isDark} theme={theme} />
          </View>
        ) : featuredOffers.length > 0 ? (
          <View style={{ marginBottom: 28 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                marginBottom: 16,
              }}
            >
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
              >
                <View
                  style={{
                    backgroundColor: theme.primary + '20',
                    padding: 8,
                    borderRadius: 12,
                  }}
                >
                  <Sparkles color={theme.primary} size={20} />
                </View>
                <Text
                  style={{
                    fontSize: 22,
                    fontFamily: 'FredokaMedium',
                    color: theme.text,
                  }}
                >
                  Featured Offers
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: theme.primary + '15',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: 'PoppinsMedium',
                    color: theme.primary,
                  }}
                >
                  Hot 🔥
                </Text>
              </View>
            </View>
            <Carousel
              width={SCREEN_WIDTH * 0.88}
              height={205}
              autoPlay={!isLoading && featuredOffers.length > 1}
              data={featuredOffers}
              loop
              autoPlayInterval={3000}
              scrollAnimationDuration={800}
              mode="parallax"
              style={{ alignSelf: 'center' }}
              renderItem={({ item, index, animationValue }) => (
                <ModernFeaturedCard
                  item={item}
                  theme={theme}
                  animationValue={animationValue}
                />
              )}
            />
          </View>
        ) : null}

        {/* Categories */}
        {isLoading ? (
          <View style={{ marginBottom: 24 }}>
            <FlatList
              data={[1, 2, 3, 4]}
              keyExtractor={(item) => item.toString()}
              renderItem={() => (
                <CategoryChipSkeleton isDark={isDark} theme={theme} />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            />
          </View>
        ) : categories.length > 0 ? (
          <View style={{ marginBottom: 28 }}>
            <View
              style={{
                paddingHorizontal: 20,
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <View
                  style={{
                    backgroundColor: theme.primary + '20',
                    padding: 8,
                    borderRadius: 12,
                  }}
                >
                  <UtensilsCrossed color={theme.primary} size={20} />
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.text,
                      fontFamily: 'PoppinsLight',
                    }}
                  >
                    What are you craving today?
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      color: theme.textSecondary,
                      fontFamily: 'FredokaMedium',
                    }}
                  >
                    Choose Your Favourite Category
                  </Text>
                </View>
              </View>
            </View>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ModernCategoryChip
                  item={item}
                  theme={theme}
                  isSelected={selectedCategory === item.id}
                />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            />
          </View>
        ) : null}

        {/* Near You Offers */}
        {isLoading ? (
          <View style={{ paddingBottom: todaysOffers.length > 0 ? 20 : 100 }}>
            <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 22,
                  fontFamily: 'FredokaMedium',
                  color: theme.text,
                }}
              >
                Near You
              </Text>
            </View>
            <FlatList
              data={[1, 2]}
              keyExtractor={(item) => item.toString()}
              renderItem={() => (
                <OfferCardSkeleton isDark={isDark} theme={theme} />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            />
          </View>
        ) : nearYouOffers.length > 0 ? (
          <View style={{ paddingBottom: todaysOffers.length > 0 ? 20 : 100 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <View
                  style={{
                    backgroundColor: theme.primary + '20',
                    padding: 8,
                    borderRadius: 12,
                  }}
                >
                  <Route color={theme.primary} size={20} />
                </View>
                <Text
                  style={{
                    fontSize: 22,
                    fontFamily: 'FredokaMedium',
                    color: theme.text,
                  }}
                >
                  Near You
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/nearme')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: theme.card,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    color: theme.primary,
                    fontFamily: 'PoppinsMedium',
                    fontSize: 13,
                  }}
                >
                  See All
                </Text>
                <ArrowRight color={theme.primary} size={16} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={nearYouOffers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <NearYouCard
                  item={item}
                  theme={theme}
                  onAdd={addToCart}
                  onAddToFavourite={addToFavorites}
                  onRemoveFromFavourite={removeFromFavorites}
                  isFavourite={isFavorite}
                />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
            />
          </View>
        ) : null}

        {/* Today's Offers */}
        {todaysOffers.length > 0 && (
          <View
            style={{
              paddingHorizontal: 20,
              paddingBottom: tomorrowsOffers.length > 0 ? 20 : 100,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  backgroundColor: theme.primary + '20',
                  padding: 8,
                  borderRadius: 12,
                }}
              >
                <CalendarDays color={theme.primary} size={20} />
              </View>
              <Text
                style={{
                  fontSize: 22,
                  fontFamily: 'FredokaMedium',
                  color: theme.text,
                }}
              >
                Available Today
              </Text>
              <View
                style={{
                  backgroundColor: theme.success + '20',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: 'PoppinsMedium',
                    color: theme.success,
                  }}
                >
                  {todaysOffers.length} offers
                </Text>
              </View>
            </View>
            <FlatList
              data={todaysOffers}
              keyExtractor={(offer) => offer.id}
              renderItem={({ item }) => (
                <DefaultOfferCard
                  item={item}
                  theme={theme}
                  onAdd={addToCart}
                  onAddToFavourite={addToFavorites}
                  onRemoveFromFavourite={removeFromFavorites}
                  isFavourite={isFavorite}
                />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 16 }}
            />
          </View>
        )}

        {/* Tomorrow's Offers */}
        {tomorrowsOffers.length > 0 && (
          <View style={{ paddingHorizontal: 20, paddingBottom: 100 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  backgroundColor: theme.primary + '20',
                  padding: 8,
                  borderRadius: 12,
                }}
              >
                <CalendarPlus color={theme.primary} size={20} />
              </View>
              <Text
                style={{
                  fontSize: 22,
                  fontFamily: 'FredokaMedium',
                  color: theme.text,
                }}
              >
                Coming Tomorrow
              </Text>
              <View
                style={{
                  backgroundColor: theme.warning + '20',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: 'PoppinsMedium',
                    color: theme.warning,
                  }}
                >
                  {tomorrowsOffers.length} offers
                </Text>
              </View>
            </View>
            <FlatList
              data={tomorrowsOffers}
              keyExtractor={(offer) => offer.id}
              renderItem={({ item }) => (
                <DefaultOfferCard
                  item={item}
                  theme={theme}
                  onAdd={addToCart}
                  onAddToFavourite={addToFavorites}
                  onRemoveFromFavourite={removeFromFavorites}
                  isFavourite={isFavorite}
                />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 16 }}
            />
          </View>
        )}

        {/* Modern Empty State */}
        {!isLoading && offers.length === 0 && (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 80,
              paddingHorizontal: 32,
            }}
          >
            <View
              style={{
                width: 140,
                height: 140,
                borderRadius: 70,
                backgroundColor: theme.primary + '15',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 24,
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <UtensilsCrossed
                color={theme.primary}
                size={70}
                strokeWidth={1.5}
              />
            </View>
            <Text
              style={{
                fontSize: 26,
                fontFamily: 'FredokaMedium',
                color: theme.text,
                marginBottom: 10,
                textAlign: 'center',
              }}
            >
              No Offers Yet
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: theme.textSecondary,
                textAlign: 'center',
                marginBottom: 32,
                lineHeight: 22,
                fontFamily: 'PoppinsLight',
              }}
            >
              {isOffline
                ? 'You appear to be offline.\nPlease check your connection.'
                : 'Check back soon for amazing\nfood deals and discounts!'}
            </Text>
            <TouchableOpacity
              onPress={onRefresh}
              style={{
                backgroundColor: theme.primary,
                paddingHorizontal: 40,
                paddingVertical: 16,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
              activeOpacity={0.8}
            >
              <Zap color="#fff" size={20} fill="#fff" />
              <Text
                style={{
                  color: '#fff',
                  fontFamily: 'PoppinsMedium',
                  fontSize: 16,
                }}
              >
                Refresh
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={(filters) => {
          setFilterVisible(false);
        }}
      />
    </SafeAreaView>
  );
}
