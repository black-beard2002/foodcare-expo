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
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import * as images from '../../constants/images';
import {
  Search,
  ChefHat,
  Sparkles,
  UtensilsCrossed,
  MapPin,
  ShoppingCart,
  Wifi,
  WifiOff,
  RefreshCw,
  Sun,
  Moon,
  Route,
  Heart,
  Clock10,
  Map,
  CalendarDays,
  CalendarPlus,
  PlusCircle,
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
  formatDateRange,
  formatPrice,
  getDiscountPercentage,
  handleImageSrc,
} from '@/utils/helpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_CARD_WIDTH = SCREEN_WIDTH - 40;
const CATEGORY_WIDTH = 120;

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
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View
                style={{
                  backgroundColor: theme.primary + '70',
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
                    fontSize: 14,
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
              {item.provider?.logo_path && (
                <Image
                  className="w-14 h-14 rounded-full object-cover"
                  source={{ uri: handleImageSrc(item.provider.logo_path) }}
                />
              )}
            </View>

            <View>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 13,
                  opacity: 0.9,
                  marginBottom: 4,
                }}
                numberOfLines={2}
              >
                {item.description || 'Delicious food awaits'}
              </Text>
              <View className="flex flex-row items-center gap-2">
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
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 10,
                    backgroundColor: theme.primary + '80',
                    padding: 4,
                    borderRadius: 10,
                    fontWeight: 'bold',
                  }}
                >
                  {item.provider?.name}
                </Text>
              </View>
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
        style={{ width: 55, height: 55, borderRadius: 25 }}
        resizeMode="contain"
      />
    </View>
    <Text
      style={{
        color: isSelected ? theme.primary : theme.text,
        fontSize: 13,
        fontFamily: 'FredokaMedium',
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
  onAddToFavourite,
  onRemoveFromFavourite,
  isFavourite,
}: {
  item: Offer;
  theme: ColorTheme;
  onAdd: (offer: Offer) => void;
  onAddToFavourite: (offer: Offer, enablePriceAlert?: boolean) => Promise<void>;
  onRemoveFromFavourite: (offerId: string) => Promise<void>;
  isFavourite: (offerId: string) => boolean;
}) => {
  const isOfferFavourited = isFavourite(offer.id);

  const [showLocationsModal, setShowLocationsModal] = useState(false);

  const handleFavouriteToggle = () => {
    if (!isOfferFavourited) {
      onAddToFavourite(offer);
    } else {
      onRemoveFromFavourite(offer.id);
    }
  };
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
            shadowColor: theme.shadow,
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
          }}
          resizeMode="cover"
        />
      </View>

      <View
        style={{ paddingTop: 170, padding: 20, alignItems: 'center' }}
        className="relative"
      >
        <TouchableOpacity
          onPress={handleFavouriteToggle}
          style={{
            position: 'absolute',
            top: 120,
            right: 12,
            backgroundColor: theme.background + '40',
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
          }}
        >
          <Heart
            size={20}
            strokeWidth={isFavourite(offer.id) ? 0 : 2}
            fill={isFavourite(offer.id) ? theme.error : 'transparent'}
            color={isFavourite(offer.id) ? theme.errorLight : theme.text}
          />
        </TouchableOpacity>
        {offer.provider?.logo_path && (
          <View
            style={{
              position: 'absolute',
              top: 120,
              left: 12,
              backgroundColor: theme.backgroundSecondary,
              padding: 2,
              width: 50,
              height: 50,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
            }}
          >
            <Image
              className="w-full h-full object-cover rounded-3xl"
              source={{ uri: handleImageSrc(offer.provider?.logo_path) }}
            />
          </View>
        )}
        <Text
          style={{
            fontSize: 20,
            fontFamily: 'PoppinsMedium',
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
                fontFamily: 'PoppinsMedium',
              }}
              className="line-clamp-2 text-sm font-semibold"
            >
              {offer.provider?.name}
            </Text>
            <View
              className="w-px"
              style={{ backgroundColor: theme.primary, borderRadius: 1 }}
            >
              <Text>|</Text>
            </View>
            {offer.provider?.addresses && (
              <TouchableOpacity
                onPress={() => {
                  if (
                    offer.provider?.addresses &&
                    offer.provider.addresses.length > 1
                  ) {
                    setShowLocationsModal(true);
                  }
                }}
                disabled={offer.provider.addresses.length === 1}
              >
                <Text
                  style={{
                    fontFamily: 'PoppinsMedium',
                    color:
                      offer.provider?.addresses.length > 1
                        ? theme.primary
                        : theme.textSecondary,
                    textDecorationLine:
                      offer.provider?.addresses.length > 1
                        ? 'underline'
                        : 'none',
                  }}
                  className="line-clamp-2 text-sm font-semibold"
                >
                  {offer.provider?.addresses[0].street.concat(
                    `, ${offer.provider?.addresses[0].city}`
                  )}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: theme.primary + '15',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Clock10 color={theme.primary} size={16} />
          </View>
          <Text
            style={{
              flex: 1,
              fontSize: 13,
              color: theme.textSecondary,
              fontFamily: 'PoppinsMedium',
            }}
            numberOfLines={2}
          >
            {offer.pickup_start_time && offer.pickup_end_time
              ? formatDateRange([
                  offer.pickup_start_time ?? '',
                  offer.pickup_end_time ?? '',
                ])
              : 'open pickup time!'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {offer.sale_price && (
            <Text
              style={{
                fontSize: 15,
                color: theme.textSecondary,
                textDecorationLine: 'line-through',
                fontFamily: 'PoppinsMedium',
              }}
            >
              ${offer.price}
            </Text>
          )}
          <Text
            style={{
              fontSize: 24,
              fontFamily: 'PoppinsMedium',
              color: theme.primary,
              letterSpacing: -0.5,
            }}
          >
            ${formatPrice(offer.sale_price ?? offer.price)}
          </Text>
        </View>
        <View className="flex flex-row items-start justify-between w-full">
          <Text
            className="line-clamp-3 flex-1"
            style={{
              fontSize: 13,
              color: theme.textSecondary,
              flex: 1,
              lineHeight: 18,
              fontFamily: 'PoppinsLight',
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
      {/* Locations Modal */}
      <Modal
        visible={showLocationsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLocationsModal(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
          activeOpacity={1}
          onPress={() => setShowLocationsModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.card,
              borderRadius: 20,
              padding: 20,
              width: '100%',
              maxWidth: 400,
              maxHeight: '80%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: theme.border + '40',
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: 'FredokaMedium',
                  color: theme.text,
                }}
              >
                All Locations
              </Text>
              <TouchableOpacity
                onPress={() => setShowLocationsModal(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: theme.border + '30',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    color: theme.text,
                    fontFamily: 'FredokaMedium',
                  }}
                >
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 400 }}
            >
              {offer.provider?.addresses.map((address, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    backgroundColor: theme.background,
                    marginBottom: 10,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: theme.primary + '15',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Map color={theme.primary} size={18} />
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 14,
                      color: theme.text,
                      fontFamily: 'PoppinsMedium',
                      lineHeight: 20,
                    }}
                  >
                    {address.street}, {address.city}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </TouchableOpacity>
  );
};

const DefaultOfferCard = ({
  item: offer,
  theme,
  onAdd,
  onAddToFavourite,
  onRemoveFromFavourite,
  isFavourite,
}: {
  item: Offer;
  theme: ColorTheme;
  onAdd: (offer: Offer) => void;
  onAddToFavourite: (offer: Offer, enablePriceAlert?: boolean) => Promise<void>;
  onRemoveFromFavourite: (offerId: string) => Promise<void>;
  isFavourite: (offerId: string) => boolean;
}) => {
  const isOfferFavourited = isFavourite(offer.id);

  const [showLocationsModal, setShowLocationsModal] = useState(false);

  const handleFavouriteToggle = () => {
    if (!isOfferFavourited) {
      onAddToFavourite(offer);
    } else {
      onRemoveFromFavourite(offer.id);
    }
  };

  return (
    <TouchableOpacity
      style={{
        width: SCREEN_WIDTH - 100,
        marginBottom: 16,
        borderRadius: 24,
        backgroundColor: theme.card,
        overflow: 'hidden',
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
      }}
      onPress={() =>
        router.push(`/(in_app_screens)/offer-details?id=${offer.id}`)
      }
      activeOpacity={0.95}
    >
      {/* Image Section with Enhanced Overlay */}
      <View style={{ position: 'relative', height: 180 }}>
        <Image
          source={
            offer.main_image
              ? { uri: handleImageSrc(offer.main_image) }
              : images.OFFER_PLACEHOLDER_IMAGE
          }
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.7)']}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1,
          }}
        />

        {/* Discount Badge */}
        {offer.sale_price && (
          <View
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              backgroundColor: theme.primary + '80',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              zIndex: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: 13,
                fontFamily: 'FredokaMedium',
              }}
            >
              {getDiscountPercentage(offer.price, offer.sale_price ?? 0)}% OFF
            </Text>
          </View>
        )}

        {/* Favorite Button */}
        <TouchableOpacity
          onPress={handleFavouriteToggle}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: theme.background + '40',
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
          }}
        >
          <Heart
            size={20}
            strokeWidth={isFavourite(offer.id) ? 0 : 2}
            fill={isFavourite(offer.id) ? theme.error : 'transparent'}
            color={isFavourite(offer.id) ? theme.errorLight : theme.text}
          />
        </TouchableOpacity>

        {/* Provider Logo */}
        {offer.provider && offer.provider.logo_path && (
          <View
            style={{
              position: 'absolute',
              bottom: 1,
              left: 4,
              padding: 4,
              borderRadius: 12,
              zIndex: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              opacity: 0.9,
              shadowRadius: 4,
            }}
          >
            <Image
              source={{ uri: handleImageSrc(offer.provider.logo_path) }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
              }}
            />
            {offer.provider && offer.provider.name && (
              <Text
                style={{
                  flex: 1,
                  fontSize: 11,
                  color: 'white',
                  fontFamily: 'FredokaBold',
                }}
                numberOfLines={1}
              >
                {offer.provider.name}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Content Section */}
      <View style={{ padding: 16 }}>
        {/* Title */}
        <Text
          style={{
            fontSize: 18,
            fontFamily: 'PoppinsMedium',
            color: theme.text,
            marginBottom: 5,
            lineHeight: 24,
          }}
          numberOfLines={2}
        >
          {offer.title}
        </Text>

        {/* Info Rows */}
        <View style={{ gap: 3, marginBottom: 10 }}>
          {/* Location */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <View
              style={{
                width: 25,
                height: 25,
                borderRadius: 16,
                backgroundColor: theme.primary + '15',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Map color={theme.primary} size={16} />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 13,
                color: theme.textSecondary,
                fontFamily: 'PoppinsMedium',
              }}
              numberOfLines={1}
            >
              {offer.provider?.addresses[0].street},{' '}
              {offer.provider?.addresses[0].city}
            </Text>
            {offer.provider?.addresses &&
              offer.provider.addresses.length > 1 && (
                <TouchableOpacity
                  onPress={() => setShowLocationsModal(true)}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: theme.primary,
                    backgroundColor: theme.primary + '10',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: theme.primary,
                      fontFamily: 'PoppinsMedium',
                    }}
                  >
                    +{offer.provider.addresses.length - 1}
                  </Text>
                </TouchableOpacity>
              )}
          </View>

          {/* Pickup Time */}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <View
              style={{
                width: 25,
                height: 25,
                borderRadius: 16,
                backgroundColor: theme.primary + '15',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Clock10 color={theme.primary} size={16} />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 13,
                color: theme.textSecondary,
                fontFamily: 'PoppinsMedium',
              }}
              numberOfLines={2}
            >
              {formatDateRange([
                offer.pickup_start_time ?? '',
                offer.pickup_end_time ?? '',
              ])}
            </Text>
          </View>
        </View>

        {/* Price and Add Button */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 7,
            borderTopWidth: 1,
            borderStyle: 'dashed',
            borderTopColor: theme.border,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {offer.sale_price && (
              <Text
                style={{
                  fontSize: 15,
                  color: theme.textSecondary,
                  textDecorationLine: 'line-through',
                  fontFamily: 'PoppinsMedium',
                }}
              >
                ${offer.price}
              </Text>
            )}
            <Text
              style={{
                fontSize: 24,
                fontFamily: 'PoppinsMedium',
                color: theme.primary,
                letterSpacing: -0.5,
              }}
            >
              ${formatPrice(offer.sale_price ?? offer.price)}
            </Text>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: theme.primary,
              paddingHorizontal: 14,
              paddingVertical: 5,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onAdd(offer);
            }}
          >
            <PlusCircle color={theme.text} size={14} />
            <Text
              style={{
                color: '#fff',
                fontSize: 14,
                fontFamily: 'PoppinsMedium',
              }}
            >
              Add
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Locations Modal */}
      <Modal
        visible={showLocationsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLocationsModal(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
          activeOpacity={1}
          onPress={() => setShowLocationsModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.card,
              borderRadius: 20,
              padding: 20,
              width: '100%',
              maxWidth: 400,
              maxHeight: '80%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: theme.border + '40',
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: theme.text,
                }}
              >
                All Locations
              </Text>
              <TouchableOpacity
                onPress={() => setShowLocationsModal(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: theme.border + '30',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{ fontSize: 18, color: theme.text, fontWeight: '600' }}
                >
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 400 }}
            >
              {offer.provider?.addresses.map((address, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    backgroundColor: theme.background,
                    marginBottom: 10,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: theme.primary + '15',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Map color={theme.primary} size={18} />
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 14,
                      color: theme.text,
                      fontWeight: '500',
                      lineHeight: 20,
                    }}
                  >
                    {address.street}, {address.city}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </TouchableOpacity>
  );
};
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
  const { addToFavorites, removeFromFavorites, isFavorite } =
    useFavoritesStore();
  const [refreshing, setRefreshing] = useState(false);
  const hasFetched = useRef(false);
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
    if (hasFetched.current) return; // skip if already fetched
    hasFetched.current = true; // mark as fetched
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
    const yyyy = today.getFullYear();
    const mm = today.getMonth();
    const dd = today.getDate();

    return filteredOffers.filter((offer) => {
      if (!offer.pickup_start_time) return false;

      const pickupDate = new Date(offer.pickup_start_time);
      return (
        pickupDate.getFullYear() === yyyy &&
        pickupDate.getMonth() === mm &&
        pickupDate.getDate() === dd
      );
    });
  }, [filteredOffers]);
  const tomorrowsOffers = useMemo(() => {
    const today = new Date();

    // Build tomorrow's date
    const tomorrow = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    const yyyy = tomorrow.getFullYear();
    const mm = tomorrow.getMonth();
    const dd = tomorrow.getDate();

    return filteredOffers.filter((offer) => {
      if (!offer.pickup_start_time) return false;

      const pickupDate = new Date(offer.pickup_start_time);
      return (
        pickupDate.getFullYear() === yyyy &&
        pickupDate.getMonth() === mm &&
        pickupDate.getDate() === dd
      );
    });
  }, [filteredOffers]);

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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.backgroundSecondary }}
    >
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
        }}
      >
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
            <View className="flex flex-row items-center gap-1">
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
          <View style={{ marginBottom: 24 }}>
            <View className="flex mb-4 flex-row items-center justify-between px-5">
              <View className="flex flex-row items-center gap-2">
                <Sparkles color={theme.textSecondary} />
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
          <View style={{ paddingBottom: todaysOffers.length > 0 ? 20 : 100 }}>
            <View className="flex mb-4 flex-row items-center justify-between px-5">
              <View className="flex flex-row items-center gap-2">
                <Route color={theme.textSecondary} />
                <Text
                  style={{
                    fontSize: 20,
                    color: theme.text,
                    fontFamily: 'FredokaMedium',
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
        )}

        {/* Pickup Today Offers*/}
        {todaysOffers.length > 0 && (
          <View
            style={{
              paddingHorizontal: 20,
              paddingBottom: tomorrowsOffers.length > 0 ? 20 : 100,
            }}
          >
            <View className="flex mb-4 flex-row items-center justify-between ">
              <View className="flex flex-row items-center gap-2">
                <CalendarDays color={theme.textSecondary} />
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
            </View>
            <FlatList
              data={todaysOffers}
              keyExtractor={(offer) => offer.id}
              renderItem={({ item: offer }) => (
                <DefaultOfferCard
                  key={offer.id}
                  item={offer}
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
        {/* Trending Offers Grid */}
        {tomorrowsOffers.length > 0 && (
          <View style={{ paddingHorizontal: 20, paddingBottom: 100 }}>
            <View className="flex mb-4 flex-row items-center justify-between ">
              <View className="flex flex-row items-center gap-2">
                <CalendarPlus color={theme.textSecondary} />
                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: 'FredokaMedium',
                    color: theme.text,
                  }}
                >
                  Pickup Tommorow
                </Text>
              </View>
            </View>
            <FlatList
              data={tomorrowsOffers}
              keyExtractor={(offer) => offer.id}
              renderItem={({ item: offer }) => (
                <DefaultOfferCard
                  key={offer.id}
                  item={offer}
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
