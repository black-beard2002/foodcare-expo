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
  Animated,
  Platform,
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
  Wifi,
  WifiOff,
  RefreshCw,
  Zap,
} from 'lucide-react-native';
import { useAppStore } from '@/stores/appStore';
import { useTheme } from '@/hooks/useTheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FilterOptions, Offer } from '@/types/appTypes';
import FilterModal from '@/components/HomeScreenFilter';
import { MotiView, AnimatePresence } from 'moti';
import { Skeleton } from 'moti/skeleton';
import { useAlert } from '@/providers/AlertProvider';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useAuthStore } from '@/stores/authStore';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_CARD_WIDTH = SCREEN_WIDTH - 40;

const CARD_HEIGHTS = {
  HERO: 220,
  NEAR_YOU: 360,
  OFFER_CARD: 240,
  CATEGORY_CHIP: 64,
};

const Spacer = ({ height = 16, width = 0 }) => (
  <View style={{ height, width }} />
);

// Animated Badge Component
const AnimatedBadge = ({ count, color }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (count > 0) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.3,
          useNativeDriver: true,
          speed: 50,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [count]);

  if (count === 0) return null;

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: color,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
      }}
    >
      <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>
        {count > 99 ? '99+' : count}
      </Text>
    </Animated.View>
  );
};

// Network Status Banner
const NetworkStatusBanner = ({ isOffline, syncStatus, theme }) => {
  if (!isOffline && syncStatus === 'idle') return null;

  return (
    <MotiView
      from={{ opacity: 0, translateY: -50 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -50 }}
      transition={{ type: 'timing', duration: 300 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: isOffline ? theme.error : theme.success,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      {isOffline ? (
        <>
          <WifiOff color="#fff" size={18} />
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
            Offline Mode - Using cached data
          </Text>
        </>
      ) : syncStatus === 'syncing' ? (
        <>
          <RefreshCw color="#fff" size={18} />
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
            Syncing data...
          </Text>
        </>
      ) : (
        <>
          <Wifi color="#fff" size={18} />
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
            Back online - Data synced!
          </Text>
        </>
      )}
    </MotiView>
  );
};

// Enhanced Featured Card with Parallax
const EnhancedFeaturedCard = ({ item, theme, index }) => {
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        delay: index * 100,
      }}
    >
      <TouchableOpacity
        className="mx-2.5 rounded-3xl overflow-hidden shadow-2xl"
        style={{
          backgroundColor: theme.card,
          width: HERO_CARD_WIDTH,
          height: CARD_HEIGHTS.HERO,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 12,
        }}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push(`/(in_app_screens)/offer-details?id=${item.id}`);
        }}
        activeOpacity={0.95}
      >
        <ImageBackground
          source={item.image_url}
          className="w-full h-full justify-end"
          imageStyle={{ borderRadius: 24 }}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 140,
              padding: 20,
              justifyContent: 'flex-end',
            }}
          >
            <MotiView
              from={{ translateX: -100, opacity: 0 }}
              animate={{ translateX: 0, opacity: 1 }}
              transition={{ type: 'timing', duration: 400, delay: 200 }}
              className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-600 px-4 py-2 rounded-2xl shadow-lg"
            >
              <View className="flex-row items-center gap-1">
                <Zap color="#fff" size={16} fill="#fff" />
                <Text className="text-white text-sm font-bold">
                  {item.discount_percentage}% OFF
                </Text>
              </View>
            </MotiView>

            <Text
              className="text-white text-2xl font-bold mb-3"
              numberOfLines={2}
              style={{
                textShadowColor: 'rgba(0,0,0,0.5)',
                textShadowRadius: 4,
              }}
            >
              {item.title}
            </Text>

            <View className="flex-row justify-between items-center bg-white/25 backdrop-blur-lg py-2.5 px-4 rounded-2xl border border-white/30">
              <View className="flex-row items-center gap-2 flex-1 mr-2">
                <View className="bg-white/30 p-1.5 rounded-lg">
                  <ChefHat color="#fff" size={16} />
                </View>
                <Text
                  className="text-white text-sm font-semibold flex-1"
                  numberOfLines={1}
                >
                  {item.restaurant.name}
                </Text>
              </View>

              <View className="flex-row items-center gap-1.5 bg-yellow-400/30 px-3 py-1.5 rounded-xl">
                <Star color="#FFD700" size={16} fill="#FFD700" />
                <Text className="text-white text-sm font-bold">
                  {item.rating.toFixed(1)}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    </MotiView>
  );
};

// Enhanced Category Chip with Animation
const EnhancedCategoryChip = ({ item, theme, index }) => (
  <MotiView
    from={{ opacity: 0, translateY: 20 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{
      type: 'spring',
      delay: index * 50,
    }}
  >
    <TouchableOpacity
      className="rounded-3xl overflow-hidden mr-3 shadow-lg"
      style={{
        backgroundColor: theme.card,
        height: CARD_HEIGHTS.CATEGORY_CHIP,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
      }}
      activeOpacity={0.8}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/(tabs)/categories?categoryId=${item.id}`);
      }}
    >
      <LinearGradient
        colors={[theme.card, theme.backgroundSecondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <View className="flex-row items-center gap-3 h-full px-5">
          <View className="w-12 h-12 rounded-2xl overflow-hidden shadow-md">
            <Image
              source={{ uri: item.image_url }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          <Text
            className="text-base font-inter-semibold"
            style={{ color: theme.text }}
          >
            {item.name}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  </MotiView>
);

// Enhanced Near You Card with Micro-interactions
const EnhancedNearYouCard = ({ item: offer, theme, onAddToCart }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        className="overflow-hidden rounded-3xl shadow-2xl mr-4"
        style={{
          width: 300,
          height: CARD_HEIGHTS.NEAR_YOU,
          backgroundColor: theme.card,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 10,
        }}
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push(`/(in_app_screens)/offer-details?id=${offer.id}`);
        }}
      >
        <View style={{ position: 'relative' }}>
          <Image
            source={offer.image_url}
            style={{ width: 300, height: 180 }}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 180,
              justifyContent: 'flex-start',
              alignItems: 'flex-end',
              padding: 12,
            }}
          >
            <MotiView
              from={{ scale: 0, rotate: '-45deg' }}
              animate={{ scale: 1, rotate: '0deg' }}
              transition={{ type: 'spring' }}
              className="bg-gradient-to-r from-red-500 to-pink-600 px-3 py-2 rounded-2xl shadow-lg"
            >
              <Text className="text-white text-sm font-bold">
                -{offer.discount_percentage}%
              </Text>
            </MotiView>
          </LinearGradient>
        </View>

        <LinearGradient
          colors={[theme.card, theme.backgroundSecondary]}
          style={{ padding: 16, flex: 1, justifyContent: 'space-between' }}
        >
          <View>
            <View className="flex-row mb-2 justify-between items-center">
              <Text
                className="text-xl font-bold flex-1 mr-2"
                style={{ color: theme.text }}
                numberOfLines={1}
              >
                {offer.title}
              </Text>
              <View
                className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-xl"
                style={{ backgroundColor: theme.warning + '30' }}
              >
                <Star color={theme.warning} size={14} fill={theme.warning} />
                <Text
                  className="text-sm font-bold"
                  style={{ color: theme.text }}
                >
                  {offer.rating.toFixed(1)}
                </Text>
              </View>
            </View>

            <View className="gap-2.5">
              <View className="flex-row items-center gap-2">
                <View
                  className="p-1.5 rounded-lg"
                  style={{ backgroundColor: theme.primary + '20' }}
                >
                  <MapPin color={theme.primary} size={14} />
                </View>
                <Text
                  className="text-sm font-medium flex-1"
                  style={{ color: theme.textSecondary }}
                  numberOfLines={1}
                >
                  {offer.restaurant.address}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View
                  className="p-1.5 rounded-lg"
                  style={{ backgroundColor: theme.primary + '20' }}
                >
                  <Clock color={theme.primary} size={14} />
                </View>
                <Text
                  className="text-sm font-medium flex-1"
                  style={{ color: theme.textSecondary }}
                  numberOfLines={1}
                >
                  {offer.restaurant.opening_hours}
                </Text>
              </View>
            </View>
          </View>

          <View
            className="flex-row justify-between items-center pt-3 border-t"
            style={{ borderColor: theme.border }}
          >
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onAddToCart(offer);
              }}
              className="flex-row items-center gap-2 px-6 py-3.5 rounded-2xl shadow-lg"
              style={{ backgroundColor: theme.warning }}
              activeOpacity={0.8}
            >
              <ShoppingCart color="#fff" size={18} />
              <Text className="text-base font-bold text-white">Add</Text>
            </TouchableOpacity>
            <View className="items-end">
              <Text
                className="text-xs font-inter-regular line-through"
                style={{ color: theme.textSecondary }}
              >
                ${offer.original_price}
              </Text>
              <Text
                className="text-3xl font-bold"
                style={{ color: theme.success }}
              >
                ${offer.discounted_price}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Enhanced Offer Card with 3D effect
const EnhancedOfferCard = ({ item: offer, theme }) => (
  <MotiView
    from={{ opacity: 0, scale: 0.8, rotateY: '90deg' }}
    animate={{ opacity: 1, scale: 1, rotateY: '0deg' }}
    transition={{
      type: 'spring',
      damping: 15,
    }}
  >
    <TouchableOpacity
      className="rounded-3xl overflow-visible shadow-xl"
      style={{
        height: CARD_HEIGHTS.OFFER_CARD,
        backgroundColor: theme.card,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
      }}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/(in_app_screens)/offer-details?id=${offer.id}`);
      }}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[theme.card, theme.backgroundSecondary]}
        style={{
          borderRadius: 24,
          height: CARD_HEIGHTS.OFFER_CARD,
          width: '100%',
        }}
      >
        <View
          className="absolute -top-20 left-0 right-0 items-center z-10"
          style={{ elevation: 10 }}
        >
          <MotiView
            from={{ scale: 0, rotate: '-180deg' }}
            animate={{ scale: 1, rotate: '0deg' }}
            transition={{ type: 'spring', damping: 12 }}
          >
            <View
              className="w-44 h-44 rounded-full overflow-hidden shadow-2xl"
              style={{
                borderWidth: 4,
                borderColor: theme.card,
                backgroundColor: theme.background,
                shadowColor: theme.shadow,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
              }}
            >
              <Image
                source={offer.image_url}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          </MotiView>

          <MotiView
            from={{ scale: 0, translateY: -20 }}
            animate={{ scale: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 200 }}
            className="absolute -top-2 -right-2 px-3 py-1.5 rounded-xl shadow-lg"
            style={{ backgroundColor: theme.error }}
          >
            <Text className="text-white text-xs font-bold">
              -{offer.discount_percentage}%
            </Text>
          </MotiView>
        </View>

        <View className="p-5 pt-28 gap-3 flex-1 justify-between">
          <View>
            <Text
              className="text-lg font-bold mb-2"
              style={{ color: theme.text }}
              numberOfLines={2}
            >
              {offer.title}
            </Text>

            <View className="gap-1.5">
              <View className="flex-row items-center gap-2">
                <View
                  className="p-1 rounded-lg"
                  style={{ backgroundColor: theme.primary + '20' }}
                >
                  <ChefHat color={theme.primary} size={12} />
                </View>
                <Text
                  className="text-xs font-inter-medium flex-1"
                  style={{ color: theme.textSecondary }}
                  numberOfLines={1}
                >
                  {offer.restaurant.name}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View
                  className="p-1 rounded-lg"
                  style={{ backgroundColor: theme.primary + '20' }}
                >
                  <User color={theme.primary} size={12} />
                </View>
                <Text
                  className="text-xs font-inter-medium flex-1"
                  style={{ color: theme.textSecondary }}
                  numberOfLines={1}
                >
                  {offer.review_count} reviews
                </Text>
              </View>
            </View>
          </View>

          <View
            className="flex-row justify-between items-center pt-3 border-t"
            style={{ borderColor: theme.border }}
          >
            <View>
              <Text
                className="text-xs font-inter-regular line-through"
                style={{ color: theme.textSecondary }}
              >
                ${offer.original_price.toFixed(2)}
              </Text>
              <Text
                className="text-2xl font-bold"
                style={{ color: theme.success }}
              >
                ${offer.discounted_price.toFixed(2)}
              </Text>
            </View>
            <View
              className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl"
              style={{ backgroundColor: theme.warning + '25' }}
            >
              <Star color={theme.warning} size={14} fill={theme.warning} />
              <Text className="text-sm font-bold" style={{ color: theme.text }}>
                {offer.rating.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  </MotiView>
);

export default function HomeScreen(): JSX.Element {
  const { theme, isDark, setTheme } = useTheme();
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
  const { showAlert } = useAlert();

  const [refreshing, setRefreshing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions | null>(
    null
  );
  const [filteredOffers, setFilteredOffers] = useState(offers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const headerOpacity = useRef(new Animated.Value(1)).current;

  const colorMode = isDark ? 'dark' : 'light';

  // Initialize app
  useEffect(() => {
    const init = async () => {
      await loadCachedData();
      initNetworkListener();
      await refreshData();
    };
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
    () => filteredOffers.filter((offer) => offer.isNear),
    [filteredOffers]
  );

  const regularOffers = useMemo(
    () => filteredOffers.filter((offer) => !offer.is_featured),
    [filteredOffers]
  );

  // Auto-scroll featured offers
  useEffect(() => {
    if (!isLoading && featuredOffers.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % featuredOffers.length;
          flatListRef?.current?.scrollToOffset({
            animated: true,
            offset: (HERO_CARD_WIDTH + 20) * nextIndex,
          });
          return nextIndex;
        });
      }, 5000);

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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    [offers]
  );

  const handleAddToCart = async (offer: Offer) => {
    await addToCart(offer);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showAlert('Added to cart', `${offer.title} added to cart`, 'success');
  };

  const hasActiveFilters =
    activeFilters &&
    (activeFilters.priceRange.length > 0 ||
      activeFilters.rating !== null ||
      activeFilters.deliveryTime.length > 0 ||
      activeFilters.sortBy !== 'recommended' ||
      activeFilters.cuisine.length > 0);

  const keyExtractor = useCallback((item: any) => item.id, []);

  // Enhanced Skeleton Components
  const HeroSkeleton = () => (
    <View className="px-6 mb-6">
      <Skeleton
        colorMode={colorMode}
        radius={24}
        height={CARD_HEIGHTS.HERO}
        width={HERO_CARD_WIDTH}
      />
    </View>
  );

  const CategoriesSkeleton = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-6 mb-6"
    >
      {[1, 2, 3].map((i) => (
        <View key={i} className="mr-3">
          <Skeleton
            colorMode={colorMode}
            radius={24}
            height={CARD_HEIGHTS.CATEGORY_CHIP}
            width={140}
          />
        </View>
      ))}
    </ScrollView>
  );

  const NearYouSkeleton = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-6"
    >
      {[1, 2].map((i) => (
        <View key={i} className="mr-4" style={{ width: 300 }}>
          <Skeleton
            colorMode={colorMode}
            radius={24}
            height={180}
            width={300}
          />
          <Spacer height={12} />
          <Skeleton colorMode={colorMode} width={200} height={20} />
          <Spacer height={8} />
          <Skeleton colorMode={colorMode} width={150} height={16} />
        </View>
      ))}
    </ScrollView>
  );

  const OfferGridSkeleton = () => (
    <View className="flex-row flex-wrap px-6 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <View key={i} className="w-[47.5%]" style={{ marginTop: 70 }}>
          <Skeleton
            colorMode={colorMode}
            radius="round"
            height={130}
            width={130}
          />
          <Spacer height={12} />
          <Skeleton colorMode={colorMode} width="80%" height={18} />
          <Spacer height={8} />
          <Skeleton colorMode={colorMode} width="60%" height={14} />
        </View>
      ))}
    </View>
  );

  const cartCount = getCartItemCount();

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <NetworkStatusBanner
        isOffline={isOffline}
        syncStatus={syncStatus}
        theme={theme}
      />

      <View style={{ flex: 1, width: '100%' }}>
        <LinearGradient
          colors={[theme.background, theme.backgroundSecondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          }}
        />

        {/* Enhanced Header */}
        <Animated.View style={{ opacity: headerOpacity }}>
          <View className="flex-row justify-between items-center px-6 pt-4 pb-6">
            <TouchableOpacity
              className="flex-row items-center gap-4"
              onPress={() => router.push('/(in_app_screens)/personal-info')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[theme.primary + '30', theme.primary + '10']}
                className="w-14 h-14 items-center justify-center rounded-2xl"
              >
                <MapPinned color={theme.primary} size={28} />
              </LinearGradient>
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
                  numberOfLines={1}
                >
                  {user?.address?.split(',')[0].concat('..') ||
                    'Set your address'}
                </Text>
              </View>
            </TouchableOpacity>

            <View className="flex-row gap-2">
              <TouchableOpacity
                className="w-12 h-12 rounded-2xl justify-center items-center shadow-md"
                style={{
                  backgroundColor: theme.card,
                  shadowColor: theme.shadow,
                }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setTheme(isDark ? 'light' : 'dark');
                }}
              >
                <SunMoon color={theme.textSecondary} size={22} />
              </TouchableOpacity>

              <TouchableOpacity
                className="w-12 h-12 rounded-2xl justify-center items-center relative shadow-md"
                style={{
                  backgroundColor: theme.card,
                  shadowColor: theme.shadow,
                }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(in_app_screens)/favourites');
                }}
              >
                <Heart
                  color={theme.error}
                  fill={theme.error}
                  strokeWidth={0}
                  opacity={0.9}
                  size={22}
                />
                {isNewFavoritedAdded && (
                  <View
                    className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: theme.success }}
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="w-12 h-12 rounded-2xl justify-center items-center relative shadow-md"
                style={{
                  backgroundColor: theme.card,
                  shadowColor: theme.shadow,
                }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(tabs)/cart');
                }}
              >
                <ShoppingCart color={theme.textSecondary} size={22} />
                <AnimatedBadge count={cartCount} color={theme.error} />
              </TouchableOpacity>

              <TouchableOpacity
                className="w-12 h-12 rounded-2xl justify-center items-center relative shadow-md"
                style={{
                  backgroundColor: theme.card,
                  shadowColor: theme.shadow,
                }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(in_app_screens)/notifications');
                }}
              >
                <Bell color={theme.textSecondary} size={22} />
                <View
                  className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: theme.error }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Enhanced Search Bar */}
        <View className="flex-row items-center px-6 pb-6 gap-3">
          <TouchableOpacity
            className="flex-row items-center flex-1 h-14 px-5 rounded-2xl shadow-lg gap-3"
            style={{
              backgroundColor: theme.card,
              shadowColor: theme.shadow,
            }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(in_app_screens)/search');
            }}
            activeOpacity={0.7}
          >
            <Search color={theme.textSecondary} size={22} />
            <Text
              className="text-base font-inter-regular flex-1"
              style={{ color: theme.textSecondary }}
            >
              Search for food, restaurants...
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-14 h-14 rounded-2xl justify-center items-center shadow-lg"
            style={{
              backgroundColor: hasActiveFilters ? theme.primary : theme.card,
              shadowColor: theme.shadow,
            }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setFilterVisible(true);
            }}
          >
            <Filter
              color={hasActiveFilters ? '#fff' : theme.textSecondary}
              size={22}
            />
            {hasActiveFilters && (
              <View
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full items-center justify-center"
                style={{ backgroundColor: theme.error }}
              >
                <Text className="text-white text-xs font-bold">!</Text>
              </View>
            )}
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
          {(isLoading || featuredOffers.length > 0) && (
            <View className="mb-8">
              <MotiView
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                className="flex-row justify-between items-center px-6 mb-5"
              >
                <View className="flex-row items-center gap-3">
                  <LinearGradient
                    colors={[theme.primary, theme.primary + '80']}
                    className="p-2 rounded-xl"
                  >
                    <Sparkles color="#fff" size={20} />
                  </LinearGradient>
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: theme.text }}
                  >
                    Featured Offers
                  </Text>
                </View>
              </MotiView>

              {isLoading ? (
                <HeroSkeleton />
              ) : (
                <FlatList
                  ref={flatListRef}
                  data={featuredOffers}
                  keyExtractor={keyExtractor}
                  renderItem={({ item, index }) => (
                    <EnhancedFeaturedCard
                      item={item}
                      theme={theme}
                      index={index}
                    />
                  )}
                  contentContainerStyle={{
                    paddingHorizontal: 10,
                    marginBottom: 8,
                  }}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  pagingEnabled
                  snapToInterval={HERO_CARD_WIDTH + 20}
                  decelerationRate="fast"
                />
              )}
            </View>
          )}

          {/* Categories Section */}
          {(isLoading || categories.length > 0) && (
            <View className="mb-8">
              <MotiView
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: 100 }}
                className="flex-row justify-between items-center px-6 mb-5"
              >
                <View className="flex-row items-center gap-3">
                  <LinearGradient
                    colors={[theme.primary, theme.primary + '80']}
                    className="p-2 rounded-xl"
                  >
                    <UtensilsCrossed color="#fff" size={20} />
                  </LinearGradient>
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: theme.text }}
                  >
                    Categories
                  </Text>
                </View>
              </MotiView>

              {isLoading ? (
                <CategoriesSkeleton />
              ) : (
                <FlatList
                  data={categories}
                  renderItem={({ item, index }) => (
                    <EnhancedCategoryChip
                      item={item}
                      theme={theme}
                      index={index}
                    />
                  )}
                  keyExtractor={keyExtractor}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 24 }}
                />
              )}
            </View>
          )}

          {/* Popular Near You Section */}
          {(isLoading || nearYouOffers.length > 0) && (
            <View className="mb-8">
              <MotiView
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: 200 }}
                className="flex-row justify-between items-center px-6 mb-5"
              >
                <View className="flex-row items-center gap-3">
                  <LinearGradient
                    colors={[theme.primary, theme.primary + '80']}
                    className="p-2 rounded-xl"
                  >
                    <MapPinHouse color="#fff" size={20} />
                  </LinearGradient>
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: theme.text }}
                  >
                    Popular Near You
                  </Text>
                </View>
                {nearYouOffers.length > 0 && (
                  <TouchableOpacity
                    onPress={() => router.push('/(tabs)/categories')}
                  >
                    <Text
                      className="text-sm font-inter-bold"
                      style={{ color: theme.primary }}
                    >
                      See All →
                    </Text>
                  </TouchableOpacity>
                )}
              </MotiView>

              {isLoading ? (
                <NearYouSkeleton />
              ) : (
                <FlatList
                  data={nearYouOffers}
                  keyExtractor={keyExtractor}
                  renderItem={({ item }) => (
                    <EnhancedNearYouCard
                      item={item}
                      theme={theme}
                      onAddToCart={handleAddToCart}
                    />
                  )}
                  contentContainerStyle={{ paddingHorizontal: 24 }}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              )}
            </View>
          )}

          {/* Trending Offers Section */}
          {(isLoading || regularOffers.length > 0) && (
            <View className="pb-12">
              <MotiView
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: 300 }}
                className="flex-row justify-between items-center px-6 mb-5"
              >
                <View className="flex-row items-center gap-3">
                  <LinearGradient
                    colors={[theme.primary, theme.primary + '80']}
                    className="p-2 rounded-xl"
                  >
                    <TrendingUp color="#fff" size={20} />
                  </LinearGradient>
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: theme.text }}
                  >
                    Trending Offers
                  </Text>
                </View>
                {regularOffers.length > 0 && (
                  <TouchableOpacity
                    onPress={() => router.push('/(tabs)/categories')}
                  >
                    <Text
                      className="text-sm font-inter-bold"
                      style={{ color: theme.primary }}
                    >
                      See All →
                    </Text>
                  </TouchableOpacity>
                )}
              </MotiView>

              {isLoading ? (
                <OfferGridSkeleton />
              ) : (
                <View className="flex-row flex-wrap px-6 gap-4">
                  {regularOffers.map((offer: Offer) => (
                    <View
                      key={offer.id}
                      className="w-[47.5%]"
                      style={{ marginTop: 70 }}
                    >
                      <EnhancedOfferCard item={offer} theme={theme} />
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Empty State */}
          {!isLoading && offers.length === 0 && (
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="items-center justify-center py-20 px-6"
            >
              <View
                className="w-32 h-32 rounded-full items-center justify-center mb-6"
                style={{ backgroundColor: theme.primary + '20' }}
              >
                <UtensilsCrossed color={theme.primary} size={64} />
              </View>
              <Text
                className="text-2xl font-bold mb-3"
                style={{ color: theme.text }}
              >
                No Offers Available
              </Text>
              <Text
                className="text-base text-center mb-6"
                style={{ color: theme.textSecondary }}
              >
                {isOffline
                  ? 'You appear to be offline. Please check your connection.'
                  : 'Check back later for amazing deals!'}
              </Text>
              <TouchableOpacity
                onPress={onRefresh}
                className="px-8 py-4 rounded-2xl"
                style={{ backgroundColor: theme.primary }}
              >
                <Text className="text-white font-bold text-base">Refresh</Text>
              </TouchableOpacity>
            </MotiView>
          )}
        </ScrollView>
      </View>

      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={handleFilterApply}
      />
    </SafeAreaView>
  );
}
