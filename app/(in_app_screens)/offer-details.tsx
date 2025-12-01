import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Animated,
  FlatList,
  Linking,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as images from '../../constants/images';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Heart,
  Coins,
  Minus,
  Plus,
  Info,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Map,
  Phone,
  Navigation,
  MessageCircle,
  X,
  Building2,
  Globe,
  Mail,
  Sprout,
  BookCheck,
  Flame,
} from 'lucide-react-native';
import { useAppStore } from '@/stores/appStore';
import { Offer, Address } from '@/types/appTypes';
import { useTheme } from '@/hooks/useTheme';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { useAlert } from '@/providers/AlertProvider';

import {
  formatDateRange,
  formatPrice,
  getDiscountPercentage,
  handleImageSrc,
} from '@/utils/helpers';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.45;
const THUMBNAIL_SIZE = 70;

export default function OfferDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLocationsModal, setShowLocationsModal] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);

  const { addToCart, updateCartItem, cart, offers } = useAppStore();
  const { addToRecentlyViewed } = useRecentlyViewedStore();
  const { showAlert } = useAlert();
  const {
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    isLoading,
    setIsNewFavoritedAdded,
  } = useFavoritesStore();
  const { theme } = useTheme();

  // Animation values
  const imageScale = useRef(new Animated.Value(0.8)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(50)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const thumbnailOpacity = useRef(new Animated.Value(0)).current;
  const providerCardScale = useRef(new Animated.Value(0.9)).current;

  const carouselRef = useRef<FlatList>(null);

  // Get all images (main image + additional images)
  const allImages = useMemo(() => {
    if (!offer) return [];
    const imageList = [];

    if (offer.main_image) {
      imageList.push(offer.main_image);
    }

    if (offer.images && Array.isArray(offer.images)) {
      imageList.push(...offer.images);
    }

    return imageList;
  }, [offer]);

  const item = useMemo(
    () =>
      cart.find((cartItem) => cartItem.offer.id === id) || {
        id: `${offer?.id}-${Date.now()}`,
        offer: offer!,
        quantity: 0,
      },
    [cart, id, offer]
  );

  // Format pickup time
  const formatPickupTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Open location in maps
  const openLocation = (address: Address) => {
    const { latitude, longitude } = address;
    if (!latitude || !longitude) {
      showAlert('Error', 'Location coordinates not available', 'error');
      return;
    }

    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });
    const latLng = `${latitude},${longitude}`;
    const label = `${address.street}, ${address.city}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    Linking.openURL(url!);
  };

  // Open WhatsApp
  const openWhatsApp = () => {
    if (!offer?.provider?.whatsapp_number) {
      showAlert('Error', 'WhatsApp number not available', 'error');
      return;
    }

    const phoneNumber = offer.provider.whatsapp_number.replace(/[^0-9]/g, '');
    const message = `Hi! I'm interested in ordering "${offer.title}" (ID: ${offer.id}). Could you please help me with this?`;
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(
      message
    )}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          showAlert('Error', 'WhatsApp is not installed', 'error');
        }
      })
      .catch(() => showAlert('Error', 'Failed to open WhatsApp', 'error'));
  };

  // Carousel handlers
  const handleImageSelect = useCallback((index: number) => {
    setSelectedImageIndex(index);
    carouselRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setSelectedImageIndex(viewableItems[0].index || 0);
    }
  }, []);

  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: {
        itemVisiblePercentThreshold: 50,
      },
      onViewableItemsChanged,
    },
  ]);

  useEffect(() => {
    const foundOffer = offers.find((o) => o.id === id);
    if (foundOffer) addToRecentlyViewed(foundOffer);
    setOffer(foundOffer || null);

    // Trigger animations when offer is found
    if (foundOffer) {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(imageOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(imageScale, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 500,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(thumbnailOpacity, {
          toValue: 1,
          duration: 500,
          delay: 400,
          useNativeDriver: true,
        }),
        Animated.spring(providerCardScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          delay: 500,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.parallel([
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 600,
          delay: 300,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 500,
          delay: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [id, offers, addToRecentlyViewed]);

  useEffect(() => {
    setIsNewFavoritedAdded(false);
  }, [setIsNewFavoritedAdded]);

  const handleFavoritePress = useCallback(() => {
    if (isFavorite(id)) {
      removeFromFavorites(id);
    } else {
      if (offer) addToFavorites(offer);
    }
  }, [id, offer, isFavorite, removeFromFavorites, addToFavorites]);

  const handleAddToCart = useCallback(() => {
    if (!offer) return;
    addToCart(offer);
    showAlert(
      'Added to cart',
      `${offer.title} is added to your cart`,
      'success'
    );
    // router.replace('/(tabs)');
  }, [offer, addToCart, showAlert]);

  const renderRestaurantCard = useCallback(() => {
    if (!offer?.provider) return null;

    const provider = offer.provider;

    return (
      <Animated.View
        style={{
          transform: [{ scale: providerCardScale }],
        }}
      >
        <TouchableOpacity
          onPress={() => setShowProviderModal(true)}
          activeOpacity={0.9}
          className="mb-6 rounded-3xl overflow-hidden"
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
            shadowColor: theme.text,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          {/* Cover Image */}
          {provider.cover_image && (
            <Image
              source={{ uri: handleImageSrc(provider.cover_image) }}
              style={{ width: '100%', height: 120 }}
              resizeMode="cover"
            />
          )}

          <View className="p-5">
            {/* Logo and Name */}
            <View className="flex-row items-center gap-4 mb-4">
              {provider.logo_path && (
                <View
                  className="rounded-2xl overflow-hidden"
                  style={{
                    padding: 2,
                    shadowColor: theme.text,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                  }}
                >
                  <Image
                    source={{ uri: handleImageSrc(provider.logo_path) }}
                    style={{ width: 70, height: 70, borderRadius: 50 }}
                    resizeMode="cover"
                  />
                </View>
              )}

              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <Building2 color={theme.primary} size={16} />
                  <Text
                    className="text-lg  uppercase tracking-wide"
                    style={{
                      color: theme.text,
                      fontFamily: 'FredokaMedium',
                    }}
                  >
                    {provider.name}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View className="flex-row gap-2">
              {provider.whatsapp_number && (
                <TouchableOpacity
                  onPress={openWhatsApp}
                  className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl"
                  style={{
                    backgroundColor: '#25D366' + '15',
                    borderWidth: 1,
                    borderColor: '#25D366' + '40',
                  }}
                >
                  <MessageCircle color="#25D366" size={18} />
                  <Text
                    className="text-sm "
                    style={{ color: '#25D366', fontFamily: 'PoppinsMedium' }}
                  >
                    WhatsApp
                  </Text>
                </TouchableOpacity>
              )}

              {provider.addresses && provider.addresses.length > 0 && (
                <TouchableOpacity
                  onPress={() => setShowLocationsModal(true)}
                  className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl"
                  style={{
                    backgroundColor: theme.primary + '15',
                    borderWidth: 1,
                    borderColor: theme.primary + '40',
                  }}
                >
                  <MapPin color={theme.primary} size={18} />
                  <Text
                    className="text-sm "
                    style={{
                      color: theme.primary,
                      fontFamily: 'PoppinsMedium',
                    }}
                  >
                    Locations
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* View Details */}
            <View
              className="mt-3 py-2 items-center"
              style={{ borderTopWidth: 1, borderTopColor: theme.border + '40' }}
            >
              <Text
                className="text-xs "
                style={{
                  color: theme.textSecondary,
                  fontFamily: 'PoppinsMedium',
                }}
              >
                Tap to view full details
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [offer, theme, providerCardScale]);

  const renderPickupTime = useCallback(() => {
    if (!offer?.pickup_start_time && !offer?.pickup_end_time) return null;

    return (
      <View
        className="mb-6 rounded-2xl p-5"
        style={{
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border,
          borderLeftWidth: 4,
          borderLeftColor: theme.primary,
        }}
      >
        <View className="flex-row items-center gap-3 mb-3">
          <View
            className="w-12 h-12 rounded-2xl items-center justify-center"
            style={{ backgroundColor: theme.primary + '15' }}
          >
            <Clock color={theme.primary} size={22} />
          </View>
          <View className="flex ">
            <Text
              className="text-lg "
              style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
            >
              Pickup Time Range
            </Text>
            <Text
              className="text-xs "
              style={{
                color: theme.textSecondary,
                fontFamily: 'FredokaMedium',
              }}
            >
              you can pick up and enjoy this offer within the below time
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2 ml-15">
          <Text
            style={{
              fontSize: 20,
              color: theme.primary,
              fontFamily: 'PoppinsMedium',
            }}
          >
            {formatDateRange([
              offer.pickup_start_time ?? '',
              offer.pickup_end_time ?? '',
            ])}
          </Text>
        </View>
      </View>
    );
  }, [offer, theme]);

  const renderLocationsModal = () => {
    if (!offer?.provider?.addresses) return null;

    return (
      <Modal
        visible={showLocationsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLocationsModal(false)}
      >
        <View className="flex-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setShowLocationsModal(false)}
          />

          <View
            className="rounded-t-3xl p-6 max-h-[80%]"
            style={{
              backgroundColor: theme.background,
              shadowColor: theme.text,
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {/* Header */}
            <View
              className="flex-row justify-between items-center mb-5 pb-4"
              style={{
                borderBottomWidth: 1,
                borderBottomColor: theme.border + '40',
              }}
            >
              <View>
                <Text
                  className="text-2xl "
                  style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
                >
                  All Locations
                </Text>
                <Text
                  className="text-sm  mt-1"
                  style={{
                    color: theme.textSecondary,
                    fontFamily: 'PoppinsMedium',
                  }}
                >
                  {offer.provider.addresses.length} location
                  {offer.provider.addresses.length > 1 ? 's' : ''} available
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowLocationsModal(false)}
                className="w-10 h-10 rounded-2xl items-center justify-center"
                style={{ backgroundColor: theme.card }}
              >
                <X color={theme.text} size={22} />
              </TouchableOpacity>
            </View>

            {/* Locations List */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {offer.provider.addresses.map((address, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    openLocation(address);
                    setShowLocationsModal(false);
                  }}
                  className="mb-4 rounded-2xl p-4"
                  style={{
                    backgroundColor: theme.card,
                    borderWidth: 1,
                    borderColor: address.is_primary
                      ? theme.primary
                      : theme.border,
                    borderLeftWidth: 3,
                    borderLeftColor: address.is_primary
                      ? theme.primary
                      : theme.border,
                  }}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-start gap-3">
                    <View
                      className="w-12 h-12 rounded-xl items-center justify-center mt-1"
                      style={{ backgroundColor: theme.primary + '15' }}
                    >
                      <MapPin color={theme.primary} size={20} />
                    </View>

                    <View className="flex-1">
                      {address.is_primary && (
                        <View
                          className="px-3 py-1 rounded-lg mb-2 self-start"
                          style={{ backgroundColor: theme.primary + '20' }}
                        >
                          <Text
                            className="text-xs "
                            style={{ color: theme.primary }}
                          >
                            PRIMARY
                          </Text>
                        </View>
                      )}

                      <Text
                        className="text-base  mb-1"
                        style={{
                          color: theme.text,
                          fontFamily: 'PoppinsMedium',
                        }}
                      >
                        {address.street}
                      </Text>
                      <Text
                        className="text-sm  mb-2"
                        style={{
                          color: theme.textSecondary,
                          fontFamily: 'PoppinsMedium',
                        }}
                      >
                        {address.city}, {address.state} {address.zipcode}
                      </Text>
                      <Text
                        className="text-xs "
                        style={{
                          color: theme.textSecondary,
                          fontFamily: 'PoppinsMedium',
                        }}
                      >
                        {address.country}
                      </Text>

                      {address.latitude && address.longitude && (
                        <View
                          className="flex-row items-center gap-2 mt-3 pt-3"
                          style={{
                            borderTopWidth: 1,
                            borderTopColor: theme.border + '40',
                          }}
                        >
                          <Navigation color={theme.primary} size={14} />
                          <Text
                            className="text-xs "
                            style={{
                              color: theme.primary,
                              fontFamily: 'PoppinsMedium',
                            }}
                          >
                            Tap to navigate
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderProviderModal = () => {
    if (!offer?.provider) return null;

    const provider = offer.provider;

    return (
      <Modal
        visible={showProviderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProviderModal(false)}
      >
        <View className="flex-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setShowProviderModal(false)}
          />

          <View
            className="rounded-t-3xl max-h-[85%]"
            style={{
              backgroundColor: theme.background,
              shadowColor: theme.text,
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {/* Cover Image Header */}
            <View className="relative">
              {provider.cover_image ? (
                <Image
                  source={{ uri: handleImageSrc(provider.cover_image) }}
                  style={{ width: '100%', height: 160 }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: '100%',
                    height: 160,
                    backgroundColor: theme.primary + '20',
                  }}
                />
              )}

              {/* Close Button */}
              <TouchableOpacity
                onPress={() => setShowProviderModal(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-2xl items-center justify-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
              >
                <X color="white" size={22} />
              </TouchableOpacity>

              {/* Logo */}
              {provider.logo_path && (
                <View
                  className="absolute -bottom-8 left-6 rounded-2xl overflow-hidden"
                  style={{
                    backgroundColor: theme.card,
                    padding: 3,
                    shadowColor: theme.text,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 5,
                  }}
                >
                  <Image
                    source={{ uri: handleImageSrc(provider.logo_path) }}
                    style={{ width: 80, height: 80, borderRadius: 14 }}
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>

            <ScrollView
              className="px-6 pt-12 pb-6"
              showsVerticalScrollIndicator={false}
            >
              {/* Provider Name and Type */}
              <Text
                className="text-3xl  mb-2"
                style={{ color: theme.text, fontFamily: 'PoppinsMedium' }}
              >
                {provider.name}
              </Text>
              <Text
                className="text-base capitalize mb-6"
                style={{
                  color: theme.textSecondary,
                  fontFamily: 'PoppinsMedium',
                }}
              >
                store type: {provider.provider_type}
              </Text>

              {/* Description */}
              {provider.description && (
                <Text
                  className="text-sm  leading-6 mb-6"
                  style={{
                    color: theme.textSecondary,
                    fontFamily: 'PoppinsMedium',
                  }}
                >
                  {provider.description}
                </Text>
              )}

              {/* Contact Actions */}
              <View className="flex-row gap-3 mb-6">
                {provider.whatsapp_number && (
                  <TouchableOpacity
                    onPress={openWhatsApp}
                    className="flex-1 flex-row items-center justify-center gap-2 py-4 rounded-2xl"
                    style={{ backgroundColor: '#25D366' }}
                  >
                    <MessageCircle color="white" size={20} />
                    <Text
                      className="text-sm  text-white"
                      style={{ fontFamily: 'PoppinsMedium' }}
                    >
                      WhatsApp
                    </Text>
                  </TouchableOpacity>
                )}

                {provider.primary_phone && (
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(`tel:${provider.primary_phone}`)
                    }
                    className="flex-1 flex-row items-center justify-center gap-2 py-4 rounded-2xl"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <Phone color="white" size={20} />
                    <Text
                      className="text-sm  text-white"
                      style={{ fontFamily: 'PoppinsMedium' }}
                    >
                      Call
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Info Grid */}
              <View className="gap-3 mb-6">
                {provider.primary_email && (
                  <View
                    className="flex-row items-center gap-3 p-4 rounded-2xl"
                    style={{
                      backgroundColor: theme.card,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                  >
                    <Mail color={theme.primary} size={20} />
                    <Text
                      className="flex-1 text-sm "
                      style={{ color: theme.text, fontFamily: 'PoppinsMedium' }}
                    >
                      {provider.primary_email}
                    </Text>
                  </View>
                )}

                {provider.website && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(provider.website)}
                    className="flex-row items-center gap-3 p-4 rounded-2xl"
                    style={{
                      backgroundColor: theme.card,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                  >
                    <Globe color={theme.primary} size={20} />
                    <Text
                      className="flex-1 text-sm "
                      style={{ color: theme.text, fontFamily: 'PoppinsMedium' }}
                    >
                      {provider.website}
                    </Text>
                  </TouchableOpacity>
                )}

                {provider.founded_year && (
                  <View
                    className="flex-row items-center justify-between p-4 rounded-2xl"
                    style={{
                      backgroundColor: theme.card,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                  >
                    <Text
                      className="text-sm "
                      style={{
                        color: theme.textSecondary,
                        fontFamily: 'FredokaMedium',
                      }}
                    >
                      Founded
                    </Text>
                    <Text
                      className="text-sm "
                      style={{ color: theme.text, fontFamily: 'PoppinsMedium' }}
                    >
                      {provider.founded_year}
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderCustomProperties = useCallback(() => {
    if (
      !offer?.custom_properties ||
      Object.keys(offer.custom_properties).length === 0
    ) {
      return null;
    }

    const getPropertyIcon = (key: string) => {
      switch (key) {
        case 'ingredients':
          return <BookCheck size={15} color={theme.primary} />;
        case 'nutrition_facts':
          return <Sprout size={15} color={theme.primary} />;
        case 'spice_level':
          return <Flame size={15} color={theme.primary} />;
      }
    };

    const renderPropertyValue = (value: any, key: string) => {
      if (Array.isArray(value)) {
        return (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
          >
            <View className="flex-row gap-2 pr-4">
              {value.map((v, i) => (
                <View
                  key={i}
                  className="px-4 py-2.5 rounded-xl"
                  style={{
                    backgroundColor: `${theme.primary}10`,
                    borderWidth: 1,
                    borderColor: `${theme.primary}30`,
                  }}
                >
                  <Text
                    className="text-sm "
                    style={{
                      color: theme.primary,
                      fontFamily: 'PoppinsMedium',
                    }}
                  >
                    {String(v)}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        );
      }

      if (typeof value === 'object' && value !== null) {
        return (
          <View className="mt-3 gap-3">
            {Object.entries(value).map(([subKey, subValue], subIndex) => (
              <View
                key={subIndex}
                className="flex-row justify-between items-center py-3 px-4 rounded-xl"
                style={{
                  backgroundColor: theme.inputBackground,
                  borderLeftWidth: 3,
                  borderLeftColor: theme.primary,
                }}
              >
                <Text
                  className="text-sm  flex-1"
                  style={{
                    color: theme.textSecondary,
                    fontFamily: 'PoppinsMedium',
                  }}
                >
                  {subKey.charAt(0).toUpperCase() +
                    subKey.slice(1).replace(/_/g, ' ')}
                </Text>
                <Text
                  className="text-sm "
                  style={{ color: theme.text, fontFamily: 'PoppinsMedium' }}
                >
                  {String(subValue)}
                </Text>
              </View>
            ))}
          </View>
        );
      }

      return (
        <Text
          className="text-base  mt-2"
          style={{ color: theme.text, fontFamily: 'PoppinsMedium' }}
        >
          {String(value)}
        </Text>
      );
    };

    return (
      <View className="mb-6">
        <View className="flex-row items-center gap-2 mb-4">
          <View
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{ backgroundColor: `${theme.primary}15` }}
          >
            <Sparkles color={theme.primary} size={18} />
          </View>
          <Text
            className="text-xl "
            style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
          >
            Additional Details
          </Text>
        </View>

        <View className="gap-4">
          {Object.entries(offer.custom_properties).map(
            ([key, value], index) => {
              if (
                value === null ||
                value === undefined ||
                (typeof value === 'object' &&
                  !Array.isArray(value) &&
                  Object.keys(value).length === 0)
              ) {
                return null;
              }

              const propertyTitle =
                key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');

              return (
                <View
                  key={index}
                  className="rounded-2xl p-5 overflow-hidden"
                  style={{
                    backgroundColor: theme.card,
                    borderWidth: 1,
                    borderColor: theme.border,
                    shadowColor: theme.text,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-1">
                    <View className="flex flex-row items-center gap-2">
                      {getPropertyIcon(key)}
                      <Text
                        className="text-sm  tracking-wide uppercase"
                        style={{
                          color: theme.textSecondary,
                          fontFamily: 'PoppinsMedium',
                        }}
                      >
                        {propertyTitle}
                      </Text>
                    </View>
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center"
                      style={{ backgroundColor: `${theme.primary}10` }}
                    >
                      <Info color={theme.primary} size={14} />
                    </View>
                  </View>
                  {renderPropertyValue(value, key)}
                </View>
              );
            }
          )}
        </View>
      </View>
    );
  }, [offer, theme]);

  const renderImageCarousel = useCallback(() => {
    if (allImages.length === 0) {
      return (
        <Animated.View
          style={{
            opacity: imageOpacity,
            transform: [{ scale: imageScale }],
          }}
        >
          <Image
            source={images.OFFER_PLACEHOLDER_IMAGE}
            className="w-full"
            style={{ height: IMAGE_HEIGHT }}
            resizeMode="cover"
          />
        </Animated.View>
      );
    }

    return (
      <Animated.View
        style={{
          opacity: imageOpacity,
          transform: [{ scale: imageScale }],
        }}
      >
        <FlatList
          ref={carouselRef}
          data={allImages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          viewabilityConfigCallbackPairs={
            viewabilityConfigCallbackPairs.current
          }
          keyExtractor={(item, index) => `image-${index}`}
          renderItem={({ item }) => (
            <View style={{ width: SCREEN_WIDTH, height: IMAGE_HEIGHT }}>
              <Image
                source={{ uri: handleImageSrc(item) }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          )}
        />

        {/* Image Counter Badge */}
        {allImages.length > 1 && (
          <View
            className="absolute bottom-4 right-4 px-4 py-2 rounded-full"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
            }}
          >
            <Text className="text-white text-sm ">
              {selectedImageIndex + 1} / {allImages.length}
            </Text>
          </View>
        )}

        {/* Navigation Arrows for multiple images */}
        {allImages.length > 1 && (
          <>
            <TouchableOpacity
              onPress={() => {
                const prevIndex =
                  selectedImageIndex > 0
                    ? selectedImageIndex - 1
                    : allImages.length - 1;
                handleImageSelect(prevIndex);
              }}
              className="absolute left-4 top-1/2 w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                transform: [{ translateY: -20 }],
              }}
            >
              <ChevronLeft color="white" size={24} strokeWidth={2.5} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                const nextIndex =
                  selectedImageIndex < allImages.length - 1
                    ? selectedImageIndex + 1
                    : 0;
                handleImageSelect(nextIndex);
              }}
              className="absolute right-4 top-1/2 w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                transform: [{ translateY: -20 }],
              }}
            >
              <ChevronRight color="white" size={24} strokeWidth={2.5} />
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    );
  }, [
    allImages,
    imageOpacity,
    imageScale,
    selectedImageIndex,
    handleImageSelect,
  ]);

  const renderThumbnails = useCallback(() => {
    if (allImages.length <= 1) return null;

    return (
      <Animated.View className="mb-6" style={{ opacity: thumbnailOpacity }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4 }}
        >
          <View className="flex-row gap-3">
            {allImages.map((img, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleImageSelect(index)}
                activeOpacity={0.7}
                style={{
                  width: THUMBNAIL_SIZE,
                  height: THUMBNAIL_SIZE,
                  borderRadius: 16,
                  overflow: 'hidden',
                  borderWidth: 3,
                  borderColor:
                    selectedImageIndex === index
                      ? theme.primary
                      : 'transparent',
                  shadowColor: theme.text,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: selectedImageIndex === index ? 0.3 : 0.1,
                  shadowRadius: 4,
                  elevation: selectedImageIndex === index ? 4 : 2,
                }}
              >
                <Image
                  source={{ uri: handleImageSrc(img) }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                {selectedImageIndex === index && (
                  <View
                    className="absolute inset-0"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    );
  }, [
    allImages,
    thumbnailOpacity,
    selectedImageIndex,
    handleImageSelect,
    theme,
  ]);

  if (!offer) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.background }}
      >
        <Text
          className="text-lg "
          style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
        >
          Offer not found
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <Animated.View
        className="absolute top-14 left-0 right-0 z-10 flex-row justify-between items-center px-6"
        style={{ opacity: headerOpacity }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 rounded-2xl items-center justify-center shadow-lg"
          style={{
            backgroundColor: `${theme.card}F0`,
            borderWidth: 1,
            borderColor: `${theme.border}60`,
          }}
        >
          <ArrowLeft color={theme.text} size={22} strokeWidth={2.5} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleFavoritePress}
          className="w-11 h-11 rounded-2xl items-center justify-center shadow-lg"
          style={{
            backgroundColor: isFavorite(id) ? theme.error : `${theme.card}F0`,
            borderWidth: 1,
            borderColor: isFavorite(id) ? theme.error : `${theme.border}60`,
          }}
        >
          {isLoading ? (
            <ActivityIndicator
              color={isFavorite(id) ? 'white' : theme.primary}
              size="small"
            />
          ) : (
            <Heart
              fill={isFavorite(id) ? 'white' : 'none'}
              color={isFavorite(id) ? 'white' : theme.text}
              strokeWidth={2.5}
              size={22}
            />
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        {renderImageCarousel()}

        {/* Details Container */}
        <Animated.View
          className="flex-1 relative mt-[-24px] rounded-t-3xl px-6 pt-6 pb-32"
          style={{
            backgroundColor: theme.backgroundSecondary,
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }],
          }}
        >
          {/* Discount Badge */}
          {offer.sale_price && (
            <View
              className="absolute -top-5 right-6 px-5 py-3 rounded-2xl shadow-xl"
              style={{
                backgroundColor: theme.error,
                borderWidth: 2,
                borderColor: 'white',
              }}
            >
              <Text
                className="text-white text-base "
                style={{ fontFamily: 'FredokaMedium' }}
              >
                {getDiscountPercentage(offer.price, offer.sale_price ?? 0)}% OFF
              </Text>
            </View>
          )}

          {/* Thumbnails */}
          {renderThumbnails()}

          {/* Title */}
          <Text
            className="text-3xl  leading-tight mb-2"
            style={{ color: theme.text, fontFamily: 'PoppinsMedium' }}
          >
            {offer.title}
          </Text>

          {/* Rating Row */}
          <View className="flex-row items-center gap-4 mb-6">
            <View className="flex-row items-center gap-1">
              <Star color={theme.warning} fill={theme.warning} size={18} />
              <Text
                className="text-base "
                style={{ color: theme.text, fontFamily: 'PoppinsMedium' }}
              >
                {offer.rating || '5.0'}
              </Text>
            </View>
            <View
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: theme.textSecondary }}
            />
            <Text
              className="text-sm "
              style={{
                color: theme.textSecondary,
                fontFamily: 'PoppinsMedium',
              }}
            >
              {offer.stock_status === 'in_stock' ||
              offer.stock_status === 'low_stock'
                ? `${offer.qty} available`
                : 'OUT OF STOCK'}
            </Text>
          </View>

          {/* Pickup Time */}
          {renderPickupTime()}

          {/* Description */}
          {offer.description && (
            <View className="mb-6">
              <Text
                className="text-lg "
                style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
              >
                Description
              </Text>
              <Text
                className="text-base leading-6"
                style={{
                  color: theme.textSecondary,
                  fontFamily: 'PoppinsMedium',
                }}
              >
                {offer.description}
              </Text>
            </View>
          )}

          {/* Price Card */}
          <View
            className="rounded-2xl p-6 mb-6 overflow-hidden"
            style={{
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text
                  className="text-xs  mb-1 uppercase tracking-wider"
                  style={{
                    color: theme.textSecondary,
                    fontFamily: 'FredokaMedium',
                  }}
                >
                  Original Price
                </Text>
                <Text
                  className="text-2xl line-through "
                  style={{
                    color: theme.textSecondary,
                    fontFamily: 'PoppinsMedium',
                  }}
                >
                  ${formatPrice(offer.price)}
                </Text>
              </View>

              {offer.sale_price && (
                <View className="items-end">
                  <Text
                    className="text-xs  mb-1 uppercase tracking-wider"
                    style={{
                      color: theme.success,
                      fontFamily: 'FredokaMedium',
                    }}
                  >
                    You Save
                  </Text>
                  <View className="flex-row items-center gap-1">
                    <Coins color={theme.success} size={20} />
                    <Text
                      className="text-xl "
                      style={{
                        color: theme.success,
                        fontFamily: 'PoppinsMedium',
                      }}
                    >
                      ${(offer.price - offer.sale_price).toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {offer.sale_price && (
              <View
                className="rounded-xl p-4"
                style={{ backgroundColor: `${theme.primary}10` }}
              >
                <Text
                  className="text-xs  mb-1 uppercase tracking-wider"
                  style={{ color: theme.primary, fontFamily: 'FredokaMedium' }}
                >
                  Special Price
                </Text>
                <Text
                  className="text-4xl "
                  style={{ color: theme.primary, fontFamily: 'PoppinsMedium' }}
                >
                  ${formatPrice(offer.sale_price)}
                </Text>
              </View>
            )}
          </View>

          {/* Tags */}
          {offer.tags && offer.tags.length > 0 && (
            <View className="mb-6">
              <Text
                className="text-lg  mb-3"
                style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
              >
                Features
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {offer.tags.map((tag, i) => (
                  <View
                    key={i}
                    className="px-4 py-2.5 rounded-xl"
                    style={{
                      backgroundColor: `${theme.success}15`,
                      borderWidth: 1,
                      borderColor: `${theme.success}30`,
                    }}
                  >
                    <Text
                      className="text-sm "
                      style={{
                        color: theme.success,
                        fontFamily: 'PoppinsMedium',
                      }}
                    >
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {renderCustomProperties()}
          {/* Provider Card */}
          {renderRestaurantCard()}
        </Animated.View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View
        className="absolute bottom-0 left-0 right-0"
        style={{
          backgroundColor: theme.card,
          borderTopWidth: 1,
          borderColor: theme.border,
          shadowColor: theme.text,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <View className="flex-row items-center gap-3 px-6 py-4">
          {item.quantity > 0 && (
            <View
              className="flex-row items-center rounded-2xl p-1"
              style={{
                backgroundColor: theme.inputBackground,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <TouchableOpacity
                onPress={() => updateCartItem(item.id, item.quantity - 1)}
                className="w-10 h-10 justify-center items-center rounded-xl"
                activeOpacity={0.7}
                style={{ backgroundColor: theme.card }}
              >
                <Minus color={theme.primary} size={18} strokeWidth={2.5} />
              </TouchableOpacity>

              <View className="px-4">
                <Text
                  className="text-base "
                  style={{ color: theme.text, fontFamily: 'PoppinsMedium' }}
                >
                  {item.quantity}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => updateCartItem(item.id, item.quantity + 1)}
                className="w-10 h-10 justify-center items-center rounded-xl"
                activeOpacity={0.7}
                style={{ backgroundColor: theme.card }}
              >
                <Plus color={theme.primary} size={18} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            onPress={handleAddToCart}
            className="flex-1 flex-row items-center justify-center px-6 py-4 rounded-2xl gap-2"
            style={{
              backgroundColor: theme.primary,
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
            activeOpacity={0.8}
          >
            <Text className="text-white text-base ">Add to Cart</Text>
            {offer.sale_price && (
              <Text
                className="text-white text-sm "
                style={{ fontFamily: 'PoppinsMedium' }}
              >
                • ${formatPrice(offer.sale_price)}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Modals */}
      {renderLocationsModal()}
      {renderProviderModal()}
    </SafeAreaView>
  );
}
