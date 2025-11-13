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
} from 'react-native';
import { router } from 'expo-router';
import * as images from '../../constants/images';
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
  Sun,
  Moon,
  Route,
  ArrowRight,
  EarthIcon,
} from 'lucide-react-native';
import { useAppStore } from '@/stores/appStore';
import { useTheme } from '@/hooks/useTheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Category, FilterOptions, Offer } from '@/types/appTypes';
import FilterModal from '@/components/HomeScreenFilter';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';
import { useAlert } from '@/providers/AlertProvider';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useAuthStore } from '@/stores/authStore';
import * as Haptics from 'expo-haptics';
import { ColorTheme } from '@/constants/theme';
import {
  formatPrice,
  getDiscountPercentage,
  handleImageSrc,
} from '@/utils/helpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_CARD_WIDTH = SCREEN_WIDTH - 40;
const CATEGORY_WIDTH = 120;

const Spacer = ({ height = 16, width = 0 }) => (
  <View style={{ height, width }} />
);

// Animated Badge Component
const AnimatedBadge = ({ count, color }: { count: number; color: string }) => {
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
        top: -3,
        right: -3,
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
const NetworkStatusBanner = ({
  isOffline,
  syncStatus,
  theme,
}: {
  isOffline: boolean;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  theme: ColorTheme;
}) => {
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
        paddingTop: 25,
        paddingBottom: 5,
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

// Modern Carousel Featured Card
const ModernFeaturedCard = ({
  item,
  theme,
  isActive,
}: {
  item: Offer;
  theme: ColorTheme;
  isActive: boolean;
}) => {
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0.9)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isActive ? 1 : 0.9,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [isActive]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={{
          width: HERO_CARD_WIDTH,
          height: 200,
          marginHorizontal: 5,
          borderRadius: 24,
          overflow: 'hidden',
          backgroundColor: theme.card,
        }}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push(`/(in_app_screens)/offer-details?id=${item.id}`);
        }}
        activeOpacity={0.95}
      >
        <ImageBackground
          source={{ uri: handleImageSrc(item.main_image ?? '') }}
          style={{ width: '100%', height: '100%' }}
          imageStyle={{ borderRadius: 24 }}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
            style={{
              flex: 1,
              padding: 20,
              justifyContent: 'space-between',
            }}
          >
            <View style={{ alignItems: 'flex-start' }}>
              <View
                style={{
                  backgroundColor: theme.primary,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}
                >
                  {getDiscountPercentage(
                    item.price,
                    item.sale_price ?? item.price
                  )}
                  % off
                </Text>
              </View>
            </View>

            <View>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 13,
                  opacity: 0.9,
                  marginBottom: 4,
                }}
              >
                {item.description || 'Delicious food awaits'}
              </Text>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 22,
                  fontWeight: 'bold',
                }}
                numberOfLines={2}
              >
                {item.title}
              </Text>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Modern Category Chip
const ModernCategoryChip = ({
  item,
  theme,
  isSelected,
}: {
  item: Category;
  theme: ColorTheme;
  isSelected: boolean;
}) => (
  <TouchableOpacity
    style={{
      width: CATEGORY_WIDTH,
      marginRight: 12,
      alignItems: 'center',
    }}
    activeOpacity={0.7}
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(`/(tabs)/categories?categoryId=${item.id}`);
    }}
  >
    <View
      style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: isSelected ? theme.primary : theme.card,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <Image
        source={
          item.main_image
            ? { uri: handleImageSrc(item.main_image) }
            : images.CATEGORY_PLACEHOLDER_IMAGE
        }
        style={{ width: 50, height: 50 }}
        resizeMode="contain"
      />
    </View>
    <Text
      style={{
        color: isSelected ? theme.primary : theme.text,
        fontSize: 13,
        fontWeight: isSelected ? '600' : '500',
        textAlign: 'center',
      }}
      numberOfLines={2}
    >
      {item.name}
    </Text>
  </TouchableOpacity>
);

// Enhanced Near You Card matching the image design
const EnhancedNearYouCard = ({
  item: offer,
  theme,
  onAdd,
}: {
  item: Offer;
  theme: ColorTheme;
  onAdd: (offer: Offer) => void;
}) => {
  return (
    <TouchableOpacity
      style={{
        width: SCREEN_WIDTH * 0.75,
        marginRight: 16,
        borderTopRightRadius: 100,
        borderTopLeftRadius: 100,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        backgroundColor: theme.card,
        overflow: 'visible',
        marginTop: 60,
      }}
      activeOpacity={0.9}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push(`/(in_app_screens)/offer-details?id=${offer.id}`);
      }}
    >
      <View style={{ position: 'relative' }}>
        <Image
          source={
            offer.main_image
              ? { uri: handleImageSrc(offer.main_image) }
              : images.OFFER_PLACEHOLDER_IMAGE
          }
          style={{
            position: 'absolute',
            top: -50,
            left: '50%',
            transform: [{ translateX: -100 }],
            width: 200,
            height: 200,
            borderRadius: 100,
            shadowColor: '#c94242',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
          }}
          resizeMode="cover"
        />
      </View>

      <View style={{ paddingTop: 160, padding: 20, alignItems: 'center' }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.text,
            marginBottom: 4,
            textAlign: 'center',
          }}
          className="line-clamp-2"
        >
          {offer.title}
        </Text>
        <View className="flex flex-row mb-2 items-center justify-center gap-1">
          <ChefHat fill={theme.primary} color={theme.primary} size={16} />
          <View className="flex flex-row items-center justify-center gap-4">
            <Text
              style={{
                color: theme.textSecondary,
              }}
              className="line-clamp-2 text-sm font-semibold"
            >
              restaurant_name
            </Text>
            <View
              className="w-px"
              style={{ backgroundColor: theme.primary, borderRadius: 1 }}
            >
              <Text>|</Text>
            </View>
            <Text
              style={{
                color: theme.textSecondary,
              }}
              className="line-clamp-2 text-sm font-semibold"
            >
              123 food street
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#FFA500',
            marginBottom: 12,
          }}
        >
          ${formatPrice(offer.sale_price ?? offer.price)}
        </Text>
        <View className="flex flex-row items-start justify-between w-full">
          <Text
            className="line-clamp-3 flex-1"
            style={{
              fontSize: 13,
              color: theme.textSecondary,
              flex: 1,
              lineHeight: 18,
            }}
            numberOfLines={2}
          >
            {offer.description || 'Amazing food experience'}
          </Text>
          <TouchableOpacity>
            <View
              style={{
                backgroundColor: theme.primary,
                width: 36,
                height: 36,
                borderRadius: 18,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onTouchEnd={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onAdd(offer);
              }}
            >
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
                +
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Trending Offer Card (2 per row)
const TrendingOfferCard = ({
  item: offer,
  theme,
  onAdd,
}: {
  item: Offer;
  theme: ColorTheme;
  onAdd: (offer: Offer) => void;
}) => (
  <TouchableOpacity
    style={{
      width: (SCREEN_WIDTH - 48) / 2,
      marginBottom: 16,
      borderRadius: 20,
      backgroundColor: theme.card,
      overflow: 'hidden',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    }}
    onPress={() =>
      router.push(`/(in_app_screens)/offer-details?id=${offer.id}`)
    }
    activeOpacity={0.9}
  >
    <View style={{ position: 'relative' }}>
      <Image
        source={
          offer.main_image
            ? { uri: handleImageSrc(offer.main_image) }
            : images.OFFER_PLACEHOLDER_IMAGE
        }
        style={{ width: '100%', height: 120 }}
        resizeMode="cover"
      />
      {offer.sale_price && (
        <View
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: theme.primary,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>
            -{getDiscountPercentage(offer.price, offer.sale_price ?? 0)}%
          </Text>
        </View>
      )}
    </View>

    <View style={{ padding: 12 }}>
      <Text
        style={{
          fontSize: 15,
          fontWeight: '600',
          color: theme.text,
          marginBottom: 6,
        }}
        numberOfLines={1}
      >
        {offer.title}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          marginBottom: 3,
        }}
      >
        <Star color={theme.warning} size={12} fill={theme.warning} />
        <Text style={{ fontSize: 12, color: theme.textSecondary }}>
          {offer.rating || '5.0'}
        </Text>
        <Text style={{ fontSize: 12, color: theme.textSecondary }}>
          • {offer.location || '2.5 km'}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          marginBottom: 8,
        }}
      >
        <ChefHat color={theme.primary} size={12} fill={theme.primary} />
        <Text style={{ fontSize: 12, color: theme.textSecondary }}>
          restaurant_name
        </Text>
      </View>

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
              fontSize: 16,
              fontWeight: 'bold',
              color: theme.primary,
            }}
          >
            ${formatPrice(offer.sale_price ?? offer.price)}
          </Text>
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: theme.primary,
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onAdd(offer);
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
            +
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

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
  const { showAlert } = useAlert();
  const [refreshing, setRefreshing] = useState(false);
  const isLocked = useRef(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions | null>(
    null
  );
  const [filteredOffers, setFilteredOffers] = useState(offers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Initialize app
  useEffect(() => {
    const init = async () => {
      await loadCachedData();
      initNetworkListener();
      await refreshData(true);
    };
    if (!isLocked.current) {
      init();
      isLocked.current = true;
    }
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
          flatListRef?.current?.scrollToIndex({
            animated: true,
            index: nextIndex,
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
          const price = offer.sale_price ?? offer.price;
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
          (offer: Offer) => (offer.rating ?? 0) >= (filters.rating ?? 0)
        );
      }

      if (filters.sortBy === 'rating') {
        filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      } else if (filters.sortBy === 'price_low') {
        filtered.sort((a, b) => (a.sale_price ?? 0) - (b.sale_price ?? 0));
      } else if (filters.sortBy === 'price_high') {
        filtered.sort((a, b) => (b.sale_price ?? 0) - (a.sale_price ?? 0));
      }

      setFilteredOffers(filtered);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    [offers]
  );

  const hasActiveFilters =
    activeFilters &&
    (activeFilters.priceRange.length > 0 ||
      activeFilters.rating !== null ||
      activeFilters.deliveryTime.length > 0 ||
      activeFilters.sortBy !== 'recommended' ||
      activeFilters.cuisine.length > 0);

  const cartCount = getCartItemCount();

  // Pagination dots for carousel
  const renderDots = () => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12,
        gap: 6,
      }}
    >
      {featuredOffers.map((_, index) => (
        <View
          key={index}
          style={{
            width: currentIndex === index ? 24 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor:
              currentIndex === index ? theme.primary : theme.border,
          }}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <NetworkStatusBanner
        isOffline={isOffline}
        syncStatus={syncStatus}
        theme={theme}
      />

      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 16,
          backgroundColor: theme.background,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: theme.card,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <User color={theme.textSecondary} size={24} />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: 13, color: theme.textSecondary }}>
                Welcome back
              </Text>
              <View className="flex flex-row items-center gap-1">
                <MapPin size={14} color={theme.textSecondary} />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: theme.text,
                  }}
                >
                  {user?.address?.split(',')[0] || 'Food Lover'}
                </Text>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: theme.card,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={toggleTheme}
            >
              {isDark ? (
                <Sun color={theme.textSecondary} size={22} />
              ) : (
                <Moon color={theme.textSecondary} size={22} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: theme.card,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => router.push('/(tabs)/cart')}
            >
              <ShoppingCart color={theme.textSecondary} size={22} />
              <AnimatedBadge count={cartCount} color={theme.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: theme.card,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => router.push('/(in_app_screens)/search')}
            >
              <Search color={theme.textSecondary} size={22} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        className="pt-6"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        {/* Promotional Banner / Featured Carousel */}
        {featuredOffers.length > 0 && (
          <View style={{ paddingVertical: 20 }}>
            <View className="flex mb-4 flex-row items-center justify-between px-5">
              <View className="flex flex-row items-center gap-2">
                <Sparkles color={theme.textSecondary} />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: theme.text,
                  }}
                >
                  Featured Offers
                </Text>
              </View>
            </View>
            <FlatList
              ref={flatListRef}
              data={featuredOffers}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <ModernFeaturedCard
                  item={item}
                  theme={theme}
                  isActive={index === currentIndex}
                />
              )}
              contentContainerStyle={{ paddingHorizontal: 15 }}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              snapToInterval={HERO_CARD_WIDTH + 10}
              decelerationRate="fast"
              onMomentumScrollEnd={(event) => {
                const index = Math.round(
                  event.nativeEvent.contentOffset.x / (HERO_CARD_WIDTH + 10)
                );
                setCurrentIndex(index);
              }}
            />
            {renderDots()}
          </View>
        )}

        {/* Section Header */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 15,
              color: theme.textSecondary,
              marginBottom: 4,
            }}
          >
            What do you want to eat today?
          </Text>
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: theme.text,
            }}
          >
            Choose Your Favorite Food
          </Text>
        </View>

        {/* Categories */}
        {categories.length > 0 && (
          <View style={{ marginBottom: 24 }}>
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
        )}

        {/* Popular Near You */}
        {nearYouOffers.length > 0 && (
          <View style={{ marginBottom: 32 }}>
            <View className="flex mb-4 flex-row items-center justify-between px-5">
              <View className="flex flex-row items-center gap-2">
                <Route color={theme.textSecondary} />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: theme.text,
                  }}
                >
                  Near You Offers
                </Text>
              </View>
            </View>

            <FlatList
              data={nearYouOffers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <EnhancedNearYouCard
                  item={item}
                  theme={theme}
                  onAdd={addToCart}
                />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            />
          </View>
        )}

        {/* Trending Offers Grid */}
        {regularOffers.length > 0 && (
          <View style={{ paddingHorizontal: 20, paddingBottom: 100 }}>
            <View className="flex mb-4 flex-row items-center justify-between ">
              <View className="flex flex-row items-center gap-2">
                <EarthIcon color={theme.textSecondary} />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: theme.text,
                  }}
                >
                  Trending Offers
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/categories')}
              >
                <View className="flex flex-row items-center gap-1">
                  <Text style={{ color: theme.textSecondary }}>see all</Text>
                  <ArrowRight color={theme.textSecondary} size={16} />
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }}
            >
              {regularOffers.map((offer) => (
                <TrendingOfferCard
                  key={offer.id}
                  item={offer}
                  theme={theme}
                  onAdd={addToCart}
                />
              ))}
            </View>
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
                backgroundColor: theme.highlight,
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
                fontWeight: 'bold',
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
                  fontWeight: 'bold',
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
        onApply={handleFilterApply}
      />
    </SafeAreaView>
  );
}
