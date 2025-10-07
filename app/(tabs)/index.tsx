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
  Image,
  FlatList,
  RefreshControl,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import {
  Star,
  Search,
  Bell,
  Filter,
  TrendingUp,
  ChefHat,
  Sparkles,
  MapPinned,
  MapPinHouse,
  User,
  UtensilsCrossed,
  SunMoon,
  MapPin,
  Clock,
  Heart,
  ShoppingCart,
} from 'lucide-react-native';
import { useAppStore } from '@/stores/appStore';
import { useTheme } from '@/hooks/useTheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FilterOptions, Offer } from '@/types/appTypes';
import FilterModal from '@/components/HomeScreenFilter';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';
import { useAlert } from '@/providers/AlertProvider';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useAuthStore } from '@/stores/authStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_CARD_WIDTH = SCREEN_WIDTH - 40;

// Fixed heights for consistency
const CARD_HEIGHTS = {
  HERO: 200,
  NEAR_YOU: 350,
  OFFER_CARD: 200,
  CATEGORY_CHIP: 56,
};

const Spacer = ({ height = 16, width = 0 }) => (
  <View style={{ height, width }} />
);

export default function HomeScreen(): JSX.Element {
  const { theme, isDark, setTheme } = useTheme();
  const { offers, categories, isLoading, refreshData, addToCart } =
    useAppStore();
  const { isNewFavoritedAdded } = useFavoritesStore();
  const { user } = useAuthStore();
  const { showAlert } = useAlert();

  const [refreshing, setRefreshing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions | null>(
    null
  );
  const [filteredOffers, setFilteredOffers] = useState(offers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const colorMode = isDark ? 'dark' : 'light';

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    setFilteredOffers(offers);
  }, [offers]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const featuredOffers = useMemo(
    () => offers.filter((offer) => offer.is_featured),
    [offers]
  );

  const nearYouOffers = useMemo(
    () => filteredOffers.filter((offer) => offer.isNear),
    [filteredOffers]
  );

  useEffect(() => {
    if (!isLoading && featuredOffers.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % featuredOffers.length;
          flatListRef?.current?.scrollToOffset({
            animated: true,
            offset: (HERO_CARD_WIDTH + 20) * nextIndex,
          });
          return nextIndex;
        });
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [featuredOffers.length, isLoading]);

  const handleFilterApply = useCallback(
    (filters: FilterOptions) => {
      setActiveFilters(filters);
      let filtered = [...offers];

      if (filters.priceRange.length > 0) {
        filtered = filtered.filter((offer: Offer) => {
          const price = offer.discounted_price;
          return filters.priceRange.some((range) => {
            if (range === '$1-9') return price < 10;
            if (range === '$10-19') return price >= 10 && price < 20;
            if (range === '$20-29') return price >= 20 && price < 30;
            if (range === '$30+') return price >= 30;
            return false;
          });
        });
      }

      if (filters.rating) {
        filtered = filtered.filter(
          (offer: Offer) => offer.rating >= filters.rating!
        );
      }

      if (filters.sortBy === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
      } else if (filters.sortBy === 'price_low') {
        filtered.sort((a, b) => a.discounted_price - b.discounted_price);
      } else if (filters.sortBy === 'price_high') {
        filtered.sort((a, b) => b.discounted_price - a.discounted_price);
      }

      setFilteredOffers(filtered);
    },
    [offers]
  );

  const handleAddToCart = (offer: Offer) => {
    addToCart(offer);
    showAlert('Added to cart', `${offer.title} added to cart`, 'success');
  };

  const hasActiveFilters =
    activeFilters &&
    (activeFilters.priceRange.length > 0 ||
      activeFilters.rating !== null ||
      activeFilters.deliveryTime.length > 0 ||
      activeFilters.sortBy !== 'recommended' ||
      activeFilters.cuisine.length > 0);

  const renderFeaturedHero = useCallback(
    ({ item }: { item: Offer }) => (
      <TouchableOpacity
        className="mx-2.5 rounded-2xl overflow-hidden border shadow-lg"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.shadow,
          width: HERO_CARD_WIDTH,
          height: CARD_HEIGHTS.HERO,
        }}
        onPress={() =>
          router.push(`/(in_app_screens)/offer-details?id=${item.id}`)
        }
        activeOpacity={0.9}
      >
        <ImageBackground
          source={item.image_url}
          className="w-full h-full justify-end"
          imageStyle={{ borderRadius: 12 }}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.85)']}
            className="p-5 justify-end"
            style={{ minHeight: 120 }}
          >
            <View className="absolute top-4 right-4 bg-red-500 px-3 py-1.5 rounded-xl">
              <Text className="text-white text-sm font-bold">
                -{item.discount_percentage}%
              </Text>
            </View>
            <Text
              className="text-white text-xl font-bold mb-3"
              numberOfLines={2}
            >
              {item.title}
            </Text>

            <View className="flex-row justify-between items-center bg-white/20 py-2 px-3.5 rounded-2xl">
              <View className="flex-row items-center gap-1.5 flex-1 mr-2">
                <ChefHat color="#fff" size={18} />
                <Text
                  className="text-white text-sm font-semibold flex-1"
                  numberOfLines={1}
                >
                  {item.restaurant.name}
                </Text>
              </View>

              <View className="flex-row items-center gap-1.5">
                <Star color="#FFD700" size={18} fill="#FFD700" />
                <Text className="text-white text-sm font-semibold">
                  {item.rating.toFixed(1)}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    ),
    [theme]
  );

  const renderCategoryChip = useCallback(
    ({ item }: { item: any }) => (
      <TouchableOpacity
        className="px-4 py-2 rounded-2xl border mr-2"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
          height: CARD_HEIGHTS.CATEGORY_CHIP,
        }}
        activeOpacity={0.7}
        onPress={() => router.push(`/(tabs)/categories?categoryId=${item.id}`)}
      >
        <View className="flex-row items-center gap-3 h-full">
          <Image
            source={item.image_url}
            className="w-10 h-10 rounded-xl"
            resizeMode="cover"
          />
          <Text
            className="text-sm font-inter-semibold"
            style={{ color: theme.text }}
          >
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [theme]
  );

  const renderNearYouCard = useCallback(
    ({ item: offer }: { item: Offer }) => (
      <TouchableOpacity
        className="overflow-hidden border rounded-2xl shadow-md mr-4"
        style={{
          borderColor: theme.border,
          width: 280,
          height: CARD_HEIGHTS.NEAR_YOU,
          backgroundColor: theme.card,
          shadowColor: theme.shadow,
        }}
        activeOpacity={0.85}
        onPress={() =>
          router.push(`/(in_app_screens)/offer-details?id=${offer.id}`)
        }
      >
        <Image
          source={offer.image_url}
          className="w-full"
          style={{ height: 160 }}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(50, 49, 49, 0.2)']}
          className="absolute top-0 left-0 right-0 justify-start items-end p-3"
          style={{ height: 160 }}
        >
          <View className="bg-red-500 px-2.5 py-1.5 rounded-lg">
            <Text className="text-white text-xs font-bold">
              -{offer.discount_percentage}%
            </Text>
          </View>
        </LinearGradient>

        <View className="p-3.5 flex-1 justify-between">
          <View>
            <View className="flex-row mb-1 justify-between items-center">
              <Text
                className="text-lg font-bold flex-1 mr-2"
                style={{ color: theme.text }}
                numberOfLines={1}
              >
                {offer.title}
              </Text>
              <View
                className="flex-row items-center gap-1 px-2 py-1 rounded-xl"
                style={{ backgroundColor: theme.warning + '20' }}
              >
                <Star color={theme.warning} size={14} />
                <Text
                  className="text-xs font-semibold"
                  style={{ color: theme.text }}
                >
                  {offer.rating.toFixed(1)}
                </Text>
              </View>
            </View>

            <View className="mb-1 gap-2">
              <View className="flex-row items-center gap-1.5">
                <ChefHat color={theme.primary} size={16} />
                <Text
                  className="text-xs font-medium flex-1"
                  style={{ color: theme.textSecondary }}
                  numberOfLines={1}
                >
                  {offer.restaurant.name}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <MapPin color={theme.primary} size={16} />
                <Text
                  className="text-xs font-medium flex-1"
                  style={{ color: theme.textSecondary }}
                  numberOfLines={1}
                >
                  {offer.restaurant.address}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <Clock color={theme.primary} size={16} />
                <Text
                  className="text-xs font-medium flex-1"
                  style={{ color: theme.textSecondary }}
                  numberOfLines={1}
                >
                  {offer.restaurant.opening_hours}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <User color={theme.primary} size={16} />
                <Text
                  className="text-xs font-medium flex-1"
                  style={{ color: theme.textSecondary }}
                  numberOfLines={1}
                >
                  {offer.review_count} reviews
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row justify-between items-center">
            <TouchableOpacity
              onPress={() => handleAddToCart(offer)}
              className="flex-row items-center gap-1 px-7 py-3 rounded-xl"
              style={{ backgroundColor: theme.warning }}
            >
              <ShoppingCart color={theme.text} size={18} />
              <Text
                className="text-sm font-semibold"
                style={{ color: theme.text }}
              >
                Add
              </Text>
            </TouchableOpacity>
            <View className="flex-row items-center gap-2">
              <Text
                className="text-xs font-inter-regular line-through"
                style={{ color: theme.textSecondary }}
              >
                ${offer.original_price}
              </Text>
              <Text
                className="text-2xl font-semibold"
                style={{ color: theme.success }}
              >
                ${offer.discounted_price}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [theme]
  );

  const renderOfferCard = useCallback(
    ({ item: offer }: { item: Offer }) => (
      <TouchableOpacity
        className="rounded-2xl overflow-visible border border-2 shadow-sm"
        style={{
          borderColor: theme.border,
          shadowColor: theme.shadow,
          height: CARD_HEIGHTS.OFFER_CARD,
        }}
        onPress={() =>
          router.push(`/(in_app_screens)/offer-details?id=${offer.id}`)
        }
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[theme.card, theme.card]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className=" h-full"
          style={[{ borderRadius: 12 }]}
        >
          <View
            className="absolute -top-20 left-0 right-0  items-center z-10"
            style={{ elevation: 10 }}
          >
            <Image
              source={offer.image_url}
              className="w-40 h-40 rounded-full border-2"
              style={{
                borderColor: theme.inputBorder,
                backgroundColor: theme.primary,
              }}
              resizeMode="contain"
            />
            <View
              className="absolute top-0 right-7 px-2 py-1 rounded-lg"
              style={{ backgroundColor: theme.error }}
            >
              <Text className="text-white text-xs font-bold">
                -{offer.discount_percentage}%
              </Text>
            </View>
          </View>

          <View className="p-4 pt-24 gap-2 flex-1 justify-between">
            <View>
              <View className="mb-1">
                <Text
                  className="text-lg font-semibold truncate"
                  style={{ color: theme.text }}
                  numberOfLines={2}
                >
                  {offer.title.length > 16
                    ? offer.title.slice(0, 17).concat('..')
                    : offer.title}
                </Text>
              </View>

              <View className="mb-1">
                <View className="flex-row items-center gap-1 mb-1">
                  <ChefHat
                    color={offer.is_featured ? theme.text : theme.primary}
                    size={14}
                  />
                  <Text
                    className="text-xs font-inter-medium flex-1"
                    style={{
                      color: offer.is_featured
                        ? theme.text
                        : theme.textSecondary,
                    }}
                    numberOfLines={1}
                  >
                    {offer.restaurant.name}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <User
                    color={offer.is_featured ? theme.text : theme.primary}
                    size={14}
                  />
                  <Text
                    className="text-xs font-inter-medium flex-1"
                    style={{
                      color: offer.is_featured
                        ? theme.text
                        : theme.textSecondary,
                    }}
                    numberOfLines={1}
                  >
                    {offer.review_count} reviews
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <View>
                <Text
                  className="text-xs font-inter-regular line-through"
                  style={{
                    color: offer.is_featured ? theme.text : theme.textSecondary,
                  }}
                >
                  ${offer.original_price.toFixed(2)}
                </Text>
                <Text
                  className="text-lg font-semibold"
                  style={{ color: theme.success }}
                >
                  ${offer.discounted_price.toFixed(2)}
                </Text>
              </View>
              <View
                className="flex-row items-center gap-1 px-2 py-1 rounded-xl"
                style={{ backgroundColor: theme.warning + '20' }}
              >
                <Star color={theme.warning} size={12} />
                <Text
                  className="text-xs font-semibold"
                  style={{ color: theme.text }}
                >
                  {offer.rating.toFixed(1)}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    ),
    [theme]
  );

  const keyExtractor = useCallback((item: any) => item.id, []);

  // Skeleton Components
  const HeroSkeleton = () => (
    <MotiView className="px-6 mb-6  md:px-8">
      <Skeleton
        colorMode={colorMode}
        radius={24}
        height={CARD_HEIGHTS.HERO}
        width={HERO_CARD_WIDTH}
      />
    </MotiView>
  );

  const CategoriesSkeleton = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-6 mb-6 md:px-8"
    >
      <Skeleton
        colorMode={colorMode}
        radius={20}
        height={CARD_HEIGHTS.CATEGORY_CHIP}
        width={130}
      />
      <Spacer width={8} />
      <Skeleton
        colorMode={colorMode}
        radius={20}
        height={CARD_HEIGHTS.CATEGORY_CHIP}
        width={140}
      />
      <Spacer width={8} />
      <Skeleton
        colorMode={colorMode}
        radius={20}
        height={CARD_HEIGHTS.CATEGORY_CHIP}
        width={120}
      />
    </ScrollView>
  );

  const NearYouSkeleton = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-6 md:px-8"
    >
      <View style={{ width: 280, height: CARD_HEIGHTS.NEAR_YOU }}>
        <Skeleton colorMode={colorMode} radius={16} height={160} width={280} />
        <Spacer height={12} />
        <View className="px-3">
          <Skeleton colorMode={colorMode} width={200} height={20} />
          <Spacer height={8} />
          <Skeleton colorMode={colorMode} width={150} height={16} />
          <Spacer height={8} />
          <Skeleton colorMode={colorMode} width={180} height={16} />
          <Spacer height={12} />
          <View className="flex-row justify-between">
            <Skeleton colorMode={colorMode} width={80} height={20} />
            <Skeleton
              colorMode={colorMode}
              width={50}
              height={24}
              radius={12}
            />
          </View>
        </View>
      </View>
      <Spacer width={16} />
      <View style={{ width: 280, height: CARD_HEIGHTS.NEAR_YOU }}>
        <Skeleton colorMode={colorMode} radius={16} height={160} width={280} />
        <Spacer height={12} />
        <View className="px-3">
          <Skeleton colorMode={colorMode} width={200} height={20} />
          <Spacer height={8} />
          <Skeleton colorMode={colorMode} width={150} height={16} />
          <Spacer height={8} />
          <Skeleton colorMode={colorMode} width={180} height={16} />
          <Spacer height={12} />
          <View className="flex-row justify-between">
            <Skeleton colorMode={colorMode} width={80} height={20} />
            <Skeleton
              colorMode={colorMode}
              width={50}
              height={24}
              radius={12}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const OfferCardSkeleton = () => (
    <View style={{ height: CARD_HEIGHTS.OFFER_CARD }}>
      <View className="items-center mb-4">
        <Skeleton
          colorMode={colorMode}
          radius="round"
          height={130}
          width={130}
        />
      </View>
      <Skeleton colorMode={colorMode} width="80%" height={18} />
      <Spacer height={8} />
      <Skeleton colorMode={colorMode} width="60%" height={14} />
      <Spacer height={12} />
      <View className="flex-row justify-between items-center">
        <Skeleton colorMode={colorMode} width={60} height={20} />
        <Skeleton colorMode={colorMode} width={50} height={24} radius={12} />
      </View>
    </View>
  );

  const OfferGridSkeleton = () => (
    <View className="flex-row flex-wrap px-6 gap-4 md:px-8 lg:gap-6">
      <View className="w-[47.5%] md:w-[48%] lg:w-[23%]">
        <OfferCardSkeleton />
      </View>
      <View className="w-[47.5%] md:w-[48%] lg:w-[23%]">
        <OfferCardSkeleton />
      </View>
      <View className="w-[47.5%] md:w-[48%] lg:w-[23%]">
        <OfferCardSkeleton />
      </View>
      <View className="w-[47.5%] md:w-[48%] lg:w-[23%]">
        <OfferCardSkeleton />
      </View>
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <LinearGradient
        className="flex-1"
        colors={[theme.background, theme.backgroundSecondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 pt-4 pb-6 md:px-8 md:pt-6">
          <View className="flex-row items-center gap-4">
            <View
              className="w-12 h-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: theme.border }}
            >
              <MapPinned color={theme.primary} size={28} />
            </View>
            <View>
              <Text
                className="text-base font-inter-semibold"
                style={{ color: theme.text }}
              >
                Deliver To
              </Text>
              <Text
                className="text-sm font-inter-regular mt-0.5"
                style={{ color: theme.textSecondary }}
              >
                {user?.address?.split(',')[0].concat('..') ||
                  'Set your address'}
              </Text>
            </View>
          </View>
          <View className="flex flex-row gap-2">
            <TouchableOpacity
              className="w-11 h-11 rounded-xl justify-center items-center border"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.card,
              }}
              onPress={() => setTheme(isDark ? 'light' : 'dark')}
            >
              <SunMoon color={theme.textSecondary} size={22} />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-11 h-11 rounded-xl justify-center items-center border relative"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.card,
              }}
              onPress={() => router.push('/(in_app_screens)/favourites')}
            >
              <Heart
                color={theme.textSecondary}
                fill={theme.error}
                strokeWidth={0}
                opacity={0.9}
                size={22}
              />
              {isNewFavoritedAdded && (
                <View
                  className="absolute top-2 right-1 w-2 h-2 rounded-full"
                  style={{ backgroundColor: theme.error }}
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              className="w-11 h-11 rounded-xl justify-center items-center border relative"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.card,
              }}
              onPress={() => router.push('/(in_app_screens)/notifications')}
            >
              <Bell color={theme.textSecondary} size={22} />
              <View
                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                style={{ backgroundColor: theme.error }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center px-6 pb-6 gap-2 md:px-8">
          <TouchableOpacity
            className="flex-row items-center flex-1 h-12 px-4 rounded-2xl border gap-3"
            style={{
              backgroundColor: theme.card,
              borderColor: theme.border,
            }}
            onPress={() => router.push('/(in_app_screens)/search')}
            activeOpacity={0.7}
          >
            <Search color={theme.textSecondary} size={20} />
            <Text
              className="text-base font-inter-regular flex-1"
              style={{ color: theme.textSecondary }}
            >
              Search for food, restaurants...
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-12 h-12 rounded-2xl justify-center items-center border"
            style={{
              backgroundColor: hasActiveFilters ? theme.primary : theme.card,
              borderColor: hasActiveFilters ? theme.primary : theme.border,
            }}
            onPress={() => setFilterVisible(true)}
          >
            <Filter
              color={hasActiveFilters ? '#fff' : theme.textSecondary}
              size={20}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
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
          {/* Featured Offers Section */}
          <View className="flex-row justify-between items-center px-6 mb-4 mt-2 md:px-8">
            <View className="flex-row items-center gap-3">
              <Sparkles color={theme.primary} size={24} />
              <Text
                className="text-xl font-semibold"
                style={{ color: theme.text }}
              >
                Featured Offers
              </Text>
            </View>
          </View>

          {isLoading ? (
            <HeroSkeleton />
          ) : (
            <FlatList
              ref={flatListRef}
              data={featuredOffers}
              keyExtractor={keyExtractor}
              renderItem={renderFeaturedHero}
              contentContainerStyle={{
                paddingHorizontal: 10,
                marginBottom: 16,
              }}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              snapToInterval={HERO_CARD_WIDTH + 20}
              decelerationRate="fast"
              getItemLayout={(data, index) => ({
                length: HERO_CARD_WIDTH + 20,
                offset: (HERO_CARD_WIDTH + 20) * index,
                index,
              })}
            />
          )}

          {/* Categories Section */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center px-6 mb-4 mt-2 md:px-8">
              <View className="flex-row items-center gap-3">
                <UtensilsCrossed color={theme.primary} size={24} />
                <Text
                  className="text-xl font-semibold"
                  style={{ color: theme.text }}
                >
                  Categories
                </Text>
              </View>
            </View>

            {isLoading ? (
              <CategoriesSkeleton />
            ) : (
              <FlatList
                data={categories}
                renderItem={renderCategoryChip}
                keyExtractor={keyExtractor}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 24,
                }}
              />
            )}
          </View>

          {/* Popular Near You Section */}
          <View className="pb-8 md:pb-10">
            <View className="flex-row justify-between items-center px-6 mb-4 mt-2 md:px-8">
              <View className="flex-row items-center gap-3">
                <MapPinHouse color={theme.primary} size={24} />
                <Text
                  className="text-xl font-semibold"
                  style={{ color: theme.text }}
                >
                  Popular Near You
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/categories')}
              >
                <Text
                  className="text-sm font-inter-semibold"
                  style={{ color: theme.primary }}
                >
                  See All →
                </Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <NearYouSkeleton />
            ) : (
              <FlatList
                data={nearYouOffers}
                keyExtractor={keyExtractor}
                renderItem={renderNearYouCard}
                contentContainerStyle={{
                  paddingHorizontal: 24,
                }}
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            )}
          </View>

          {/* Latest Offers Section */}
          <View className="pb-10 md:pb-12">
            <View className="flex-row justify-between items-center px-6 mb-4 mt-2 md:px-8">
              <View className="flex-row items-center gap-3">
                <TrendingUp color={theme.primary} size={24} />
                <Text
                  className="text-xl font-semibold"
                  style={{ color: theme.text }}
                >
                  Trending Offers
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/categories')}
              >
                <Text
                  className="text-sm font-inter-semibold"
                  style={{ color: theme.primary }}
                >
                  See All →
                </Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <OfferGridSkeleton />
            ) : (
              <View className="flex-row flex-wrap px-6 gap-4 md:px-8 lg:gap-6">
                {filteredOffers
                  .filter((offer) => !offer.is_featured)
                  .map((offer: Offer) => (
                    <View
                      key={offer.id}
                      className="w-[47.5%] md:w-[48%] lg:w-[23%]"
                      style={{ marginTop: 70 }}
                    >
                      {renderOfferCard({ item: offer })}
                    </View>
                  ))}
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={handleFilterApply}
      />
    </SafeAreaView>
  );
}
