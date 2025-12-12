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
} from 'react-native';
import { router } from 'expo-router';

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
  Filter,
  ArrowRight,
} from 'lucide-react-native';

import { useAppStore } from '@/stores/appStore';
import { useTheme } from '@/hooks/useTheme';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterOptions } from '@/types/appTypes';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_CARD_WIDTH = SCREEN_WIDTH - 60;

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
      await refreshData(true);
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

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.backgroundSecondary }}
    >
      <NetworkStatusBanner
        isOffline={isOffline}
        syncStatus={syncStatus}
        theme={theme}
      />

      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 13,
                color: theme.textSecondary,
                fontFamily: 'PoppinsLight',
              }}
            >
              Welcome back
            </Text>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <MapPin size={14} color={theme.textSecondary} />
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: 'FredokaMedium',
                  color: theme.text,
                }}
              >
                {user?.address?.split(',')[0] || 'Food Lover'}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={{
                width: 45,
                height: 45,
                borderRadius: 24,
                backgroundColor: theme.card,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={toggleTheme}
            >
              {isDark ? (
                <Sun color={theme.textSecondary} size={20} />
              ) : (
                <Moon color={theme.textSecondary} size={20} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 45,
                height: 45,
                borderRadius: 24,
                backgroundColor: theme.card,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => router.push('/(tabs)/cart')}
            >
              <ShoppingCart color={theme.textSecondary} size={20} />
              <AnimatedBadge count={cartCount} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 45,
                height: 45,
                borderRadius: 24,
                backgroundColor: theme.card,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => router.push('/(in_app_screens)/favourites')}
            >
              <Heart
                color={theme.textSecondary}
                fill={isNewFavoritedAdded ? theme.error : 'transparent'}
                size={20}
                strokeWidth={isNewFavoritedAdded ? 0 : 2}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 45,
                height: 45,
                borderRadius: 24,
                backgroundColor: theme.card,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => router.push('/(in_app_screens)/search')}
            >
              <Search color={theme.textSecondary} size={20} />
            </TouchableOpacity>
          </View>
        </View>
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
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 20,
                marginBottom: 5,
              }}
            >
              <Sparkles color={theme.primary} size={20} />
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: 'FredokaMedium',
                  color: theme.text,
                }}
              >
                Featured Offers
              </Text>
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
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                paddingHorizontal: 20,
                marginBottom: 16,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.textSecondary,
                    marginBottom: 4,
                    fontFamily: 'PoppinsLight',
                  }}
                >
                  What do you want to eat today?
                </Text>
                <Text
                  style={{
                    fontSize: 24,
                    color: theme.text,
                    fontFamily: 'FredokaMedium',
                  }}
                >
                  Choose Your Favorite Food
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/categories')}
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: theme.card,
                  padding: 12,
                  borderRadius: 24,
                }}
              >
                <ArrowRight color={theme.text} size={15} />
                <Text
                  style={{
                    color: theme.text,
                    fontFamily: 'FredokaMedium',
                    fontSize: 10,
                  }}
                >
                  see all
                </Text>
              </TouchableOpacity>
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
              contentContainerStyle={{ paddingHorizontal: 20 }}
            />
          </View>
        ) : null}

        {/* Near You Offers */}
        {isLoading ? (
          <View
            style={{ paddingBottom: tomorrowsOffers.length > 0 ? 20 : 100 }}
          >
            <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: 'FredokaMedium',
                  color: theme.text,
                }}
              >
                Near You Offers
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
          <View style={{ paddingBottom: 20 }}>
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
                  gap: 8,
                }}
              >
                <Route color={theme.primary} size={20} />
                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: 'FredokaMedium',
                    color: theme.text,
                  }}
                >
                  Near You Offers
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/nearme')}
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: theme.card,
                  padding: 12,
                  borderRadius: 24,
                }}
              >
                <ArrowRight color={theme.text} size={15} />
                <Text
                  style={{
                    color: theme.text,
                    fontFamily: 'FredokaMedium',
                    fontSize: 10,
                  }}
                >
                  see all
                </Text>
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
              contentContainerStyle={{ paddingHorizontal: 20 }}
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
                gap: 8,
                marginBottom: 16,
              }}
            >
              <CalendarDays color={theme.primary} size={20} />
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: 'FredokaMedium',
                  color: theme.text,
                }}
              >
                Pickup Today
              </Text>
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
              contentContainerStyle={{ paddingHorizontal: 10, gap: 15 }}
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
                gap: 8,
                marginBottom: 16,
              }}
            >
              <CalendarPlus color={theme.primary} size={20} />
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: 'FredokaMedium',
                  color: theme.text,
                }}
              >
                Pickup Tomorrow
              </Text>
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
              contentContainerStyle={{ paddingHorizontal: 20, gap: 15 }}
            />
          </View>
        )}

        {/* Empty State */}
        {!isLoading && offers.length === 0 && (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 60,
              paddingHorizontal: 20,
            }}
          >
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: theme.primary + '15',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <UtensilsCrossed color={theme.primary} size={60} />
            </View>
            <Text
              style={{
                fontSize: 22,
                fontFamily: 'FredokaMedium',
                color: theme.text,
                marginBottom: 8,
              }}
            >
              No Offers Available
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: theme.textSecondary,
                textAlign: 'center',
                marginBottom: 24,
              }}
            >
              {isOffline
                ? 'You appear to be offline. Please check your connection.'
                : 'Check back later for amazing deals!'}
            </Text>
            <TouchableOpacity
              onPress={onRefresh}
              style={{
                backgroundColor: theme.primary,
                paddingHorizontal: 32,
                paddingVertical: 14,
                borderRadius: 24,
              }}
            >
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
          // Handle filter logic here
          setFilterVisible(false);
        }}
      />
    </SafeAreaView>
  );
}
