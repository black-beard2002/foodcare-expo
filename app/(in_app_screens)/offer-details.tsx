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
  Check,
  ChevronDown,
} from 'lucide-react-native';
import { useAppStore } from '@/stores/appStore';
import {
  Offer,
  Address,
  SelectedProperties,
  CustomProperty,
  AddOn,
} from '@/types/appTypes';
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
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.35;

export default function OfferDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLocationsModal, setShowLocationsModal] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [selectedProperties, setSelectedProperties] =
    useState<SelectedProperties>({});
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [activeProperty, setActiveProperty] = useState<CustomProperty | null>(
    null
  );

  const { addToCart, updateCartItem, cart, offers, findCartItem } =
    useAppStore();
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

  // Get all images
  const allImages = useMemo(() => {
    if (!offer) return [];
    const imageList = [];
    if (offer.main_image) imageList.push(offer.main_image);
    if (offer.images && Array.isArray(offer.images))
      imageList.push(...offer.images);
    return imageList;
  }, [offer]);

  // Find current cart item with matching properties
  const currentCartItem = useMemo(() => {
    if (!offer) return null;
    return findCartItem(offer.id, selectedProperties);
  }, [offer, selectedProperties, findCartItem, cart]);

  // Calculate total price including addons
  const calculateTotalPrice = useCallback(() => {
    if (!offer) return 0;

    const basePrice = offer.sale_price ?? offer.price;
    let addonPrice = 0;

    Object.values(selectedProperties).forEach((value) => {
      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (typeof v === 'object' && 'price' in v) {
            addonPrice += (v as AddOn).price;
          }
        });
      }
    });

    return basePrice + addonPrice;
  }, [offer, selectedProperties]);

  // Handle property selection
  const handlePropertySelect = useCallback((property: CustomProperty) => {
    setActiveProperty(property);
    setShowPropertyModal(true);
  }, []);

  // Update selected property value
  const updatePropertyValue = useCallback((propertyId: string, value: any) => {
    setSelectedProperties((prev) => ({
      ...prev,
      [propertyId]: value,
    }));
  }, []);

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

    Linking.openURL(url).catch(() => {
      const webUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
        message
      )}`;
      Linking.openURL(webUrl).catch(() => {
        showAlert('Error', 'Failed to open WhatsApp', 'error');
      });
    });
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
    if (foundOffer) {
      addToRecentlyViewed(foundOffer);
      setOffer(foundOffer);

      // Initialize default property selections
      if (foundOffer.custom_properties) {
        const defaults: SelectedProperties = {};
        Object.entries(foundOffer.custom_properties).forEach(([key, prop]) => {
          if (prop.type === 'select' && prop.options) {
            if (Array.isArray(prop.options) && prop.options.length > 0) {
              const firstOption = prop.options[0];
              if (
                typeof firstOption === 'string' ||
                typeof firstOption === 'number'
              ) {
                defaults[key] = firstOption;
              }
            }
          } else if (prop.type === 'addon' && prop.options) {
            defaults[key] = [];
          }
        });
        setSelectedProperties(defaults);
      }

      // Trigger animations
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
    addToCart(offer, 1, selectedProperties);
    router.push('/cart');
  }, [offer, selectedProperties, addToCart, showAlert]);

  const handleUpdateQuantity = useCallback(
    (newQuantity: number) => {
      if (!currentCartItem) return;
      updateCartItem(currentCartItem.id, newQuantity);
    },
    [currentCartItem, updateCartItem]
  );

  // Render custom properties selection UI
  const renderCustomPropertiesSelector = useCallback(() => {
    if (
      !offer?.custom_properties ||
      Object.keys(offer.custom_properties).length === 0
    ) {
      return null;
    }

    return (
      <View className="mb-6">
        <View className="gap-3">
          {Object.entries(offer.custom_properties).map(([key, property]) => {
            if (
              property.type === 'readonly' ||
              property.type === 'multireadonly'
            ) {
              return null; // Skip readonly properties
            }

            const selectedValue = selectedProperties[key];
            let displayValue = 'Tap to customize';
            let excludedCount = 0;

            if (selectedValue !== undefined) {
              if (Array.isArray(selectedValue)) {
                if (selectedValue.length > 0) {
                  if (
                    typeof selectedValue[0] === 'object' &&
                    'name' in selectedValue[0]
                  ) {
                    displayValue = selectedValue
                      .map((v: any) => v.name)
                      .join(', ');
                  } else {
                    // For exclude types, show excluded items
                    if (
                      property.type === 'exclude' ||
                      property.type === 'multiexclude'
                    ) {
                      excludedCount = selectedValue.length;
                      if (excludedCount > 0) {
                        displayValue = `${excludedCount} item${
                          excludedCount > 1 ? 's' : ''
                        } excluded`;
                      } else {
                        displayValue = 'All included';
                      }
                    } else {
                      displayValue = selectedValue.join(', ');
                    }
                  }
                } else {
                  if (
                    property.type === 'exclude' ||
                    property.type === 'multiexclude'
                  ) {
                    displayValue = 'All included';
                  }
                }
              } else if (
                typeof selectedValue === 'object' &&
                'name' in selectedValue
              ) {
                displayValue = (selectedValue as any).name;
              } else {
                displayValue = String(selectedValue);
              }
            }

            return (
              <View key={key}>
                <View className="flex-row items-center gap-2 mb-4">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${theme.primary}15` }}
                  >
                    <Sparkles color={theme.primary} size={18} />
                  </View>
                  <Text
                    className="text-xl"
                    style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
                  >
                    Customize Your Order
                  </Text>
                </View>
                <TouchableOpacity
                  key={key}
                  onPress={() => handlePropertySelect(property)}
                  className="rounded-2xl p-4"
                  style={{
                    backgroundColor: theme.card,
                    borderWidth: 1,
                    borderColor:
                      excludedCount > 0
                        ? theme.error
                        : selectedValue
                        ? theme.primary
                        : theme.border,
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        {property.icon && (
                          <Text style={{ fontSize: 18 }}>{property.icon}</Text>
                        )}
                        <Text
                          className="text-sm uppercase tracking-wide"
                          style={{
                            color: theme.textSecondary,
                            fontFamily: 'PoppinsMedium',
                          }}
                        >
                          {property.label}
                        </Text>
                      </View>
                      <Text
                        className="text-base"
                        style={{
                          color: theme.text,
                          fontFamily: 'PoppinsMedium',
                        }}
                      >
                        {displayValue}
                      </Text>
                    </View>
                    <ChevronDown color={theme.textSecondary} size={20} />
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
    );
  }, [offer, selectedProperties, theme, handlePropertySelect]);

  // Render property selection modal
  const renderPropertyModal = () => {
    if (!activeProperty) return null;

    const currentValue = selectedProperties[activeProperty.id];
    const options = activeProperty.options;
    const isExcludeType =
      activeProperty.type === 'exclude' ||
      activeProperty.type === 'multiexclude';

    return (
      <Modal
        visible={showPropertyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPropertyModal(false)}
      >
        <View className="flex-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setShowPropertyModal(false)}
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
            <View
              className="flex-row justify-between items-center mb-3 pb-4"
              style={{
                borderBottomWidth: 1,
                borderBottomColor: theme.border + '40',
              }}
            >
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  {activeProperty.icon && (
                    <Text style={{ fontSize: 24 }}>{activeProperty.icon}</Text>
                  )}
                  <Text
                    className="text-2xl"
                    style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
                  >
                    {activeProperty.label}
                  </Text>
                </View>
                {isExcludeType && (
                  <Text
                    className="text-sm mt-1"
                    style={{
                      color: theme.textSecondary,
                      fontFamily: 'PoppinsMedium',
                    }}
                  >
                    Tap to exclude items you don't want
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => setShowPropertyModal(false)}
                className="w-10 h-10 rounded-2xl items-center justify-center"
                style={{ backgroundColor: theme.card }}
              >
                <X color={theme.text} size={22} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {activeProperty.type === 'addon' && Array.isArray(options) ? (
                // Addon selection (multiselect)
                <View className="gap-3">
                  {(options as AddOn[]).map((addon) => {
                    const isSelected =
                      Array.isArray(currentValue) &&
                      currentValue.some((v: any) => v.id === addon.id);

                    return (
                      <TouchableOpacity
                        key={addon.id}
                        onPress={() => {
                          let newValue: AddOn[] = [];
                          if (Array.isArray(currentValue)) {
                            const addonValues = currentValue.filter(
                              (v: any): v is AddOn =>
                                typeof v === 'object' && 'id' in v
                            );
                            if (isSelected) {
                              newValue = addonValues.filter(
                                (v: AddOn) => v.id !== addon.id
                              );
                            } else {
                              newValue = [...addonValues, addon];
                            }
                          } else {
                            newValue = [addon];
                          }
                          updatePropertyValue(activeProperty.id, newValue);
                        }}
                        className="rounded-2xl p-4"
                        style={{
                          backgroundColor: theme.card,
                          borderWidth: 2,
                          borderColor: isSelected
                            ? theme.primary
                            : theme.border,
                        }}
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1">
                            <Text
                              className="text-base mb-1"
                              style={{
                                color: theme.text,
                                fontFamily: 'PoppinsMedium',
                              }}
                            >
                              {addon.name}
                            </Text>
                            {addon.description && (
                              <Text
                                className="text-sm"
                                style={{
                                  color: theme.textSecondary,
                                  fontFamily: 'PoppinsMedium',
                                }}
                              >
                                {addon.description}
                              </Text>
                            )}
                            <Text
                              className="text-sm mt-1"
                              style={{
                                color: theme.primary,
                                fontFamily: 'PoppinsMedium',
                              }}
                            >
                              +${addon.price.toFixed(2)}
                            </Text>
                          </View>
                          {isSelected && (
                            <View
                              className="w-6 h-6 rounded-full items-center justify-center"
                              style={{ backgroundColor: theme.primary }}
                            >
                              <Check color="white" size={16} />
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (activeProperty.type === 'multiselect' ||
                  activeProperty.type === 'multiexclude') &&
                Array.isArray(options) ? (
                // Multiselect or multiexclude options
                <View className="gap-3">
                  {(options as string[]).map((option) => {
                    const isExcluded =
                      Array.isArray(currentValue) &&
                      currentValue.every(
                        (v): v is string => typeof v === 'string'
                      ) &&
                      currentValue.includes(option);
                    const showAsExcluded = isExcludeType && isExcluded;

                    return (
                      <TouchableOpacity
                        key={option}
                        onPress={() => {
                          let newValue: string[] = [];
                          if (Array.isArray(currentValue)) {
                            const stringValues = currentValue.filter(
                              (v): v is string => typeof v === 'string'
                            );
                            if (isExcluded) {
                              newValue = stringValues.filter(
                                (v) => v !== option
                              );
                            } else {
                              newValue = [...stringValues, option];
                            }
                          } else {
                            newValue = [option];
                          }
                          updatePropertyValue(activeProperty.id, newValue);
                        }}
                        className="rounded-2xl p-4"
                        style={{
                          backgroundColor: showAsExcluded
                            ? theme.error + '10'
                            : theme.card,
                          borderWidth: 2,
                          borderColor: showAsExcluded
                            ? theme.error
                            : !isExcludeType && isExcluded
                            ? theme.primary
                            : theme.border,
                        }}
                      >
                        <View className="flex-row items-center justify-between">
                          <Text
                            className="text-base capitalize"
                            style={{
                              color: showAsExcluded ? theme.error : theme.text,
                              fontFamily: 'PoppinsMedium',
                              textDecorationLine: showAsExcluded
                                ? 'line-through'
                                : 'none',
                            }}
                          >
                            {option}
                          </Text>
                          {showAsExcluded ? (
                            <View
                              className="w-6 h-6 rounded-full items-center justify-center"
                              style={{ backgroundColor: theme.error }}
                            >
                              <X color="white" size={16} />
                            </View>
                          ) : !isExcludeType && isExcluded ? (
                            <View
                              className="w-6 h-6 rounded-full items-center justify-center"
                              style={{ backgroundColor: theme.primary }}
                            >
                              <Check color="white" size={16} />
                            </View>
                          ) : null}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (activeProperty.type === 'select' ||
                  activeProperty.type === 'exclude') &&
                Array.isArray(options) ? (
                // Single select or single exclude
                <View className="gap-3">
                  {(options as string[]).map((option) => {
                    const isSelected = currentValue === option;

                    return (
                      <TouchableOpacity
                        key={option}
                        onPress={() => {
                          updatePropertyValue(activeProperty.id, option);
                          setShowPropertyModal(false);
                        }}
                        className="rounded-2xl p-4"
                        style={{
                          backgroundColor: theme.card,
                          borderWidth: 2,
                          borderColor: isSelected
                            ? theme.primary
                            : theme.border,
                        }}
                      >
                        <View className="flex-row items-center justify-between">
                          <Text
                            className="text-base capitalize"
                            style={{
                              color: theme.text,
                              fontFamily: 'PoppinsMedium',
                            }}
                          >
                            {option}
                          </Text>
                          {isSelected && (
                            <View
                              className="w-6 h-6 rounded-full items-center justify-center"
                              style={{ backgroundColor: theme.primary }}
                            >
                              <Check color="white" size={16} />
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Render readonly custom properties (for display only)
  const renderReadonlyProperties = useCallback(() => {
    if (!offer?.custom_properties) return null;

    const readonlyProps = Object.entries(offer.custom_properties).filter(
      ([_, prop]) => prop.type === 'readonly' || prop.type === 'multireadonly'
    );

    if (readonlyProps.length === 0) return null;

    return (
      <View className="mb-6">
        {/* <View className="flex-row items-center gap-2 mb-4">
          <View
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{ backgroundColor: `${theme.primary}15` }}
          >
            <Info color={theme.primary} size={18} />
          </View>
          <Text
            className="text-xl"
            style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
          >
            Additional Information
          </Text>
        </View> */}

        <View className="gap-3">
          {readonlyProps.map(([key, property]) => (
            <View
              key={key}
              className="rounded-2xl p-4"
              style={{
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text
                className="text-sm uppercase tracking-wide mb-2"
                style={{
                  color: theme.textSecondary,
                  fontFamily: 'PoppinsMedium',
                }}
              >
                {property.label}
              </Text>
              <Text
                className="text-base"
                style={{
                  color: theme.text,
                  fontFamily: 'PoppinsMedium',
                }}
              >
                {Array.isArray(property.options)
                  ? property.options.join(', ')
                  : String(property.options)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  }, [offer, theme]);

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
              style={{
                borderTopWidth: 1,
                borderTopColor: theme.border + '40',
              }}
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
                      style={{
                        color: theme.text,
                        fontFamily: 'PoppinsMedium',
                      }}
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
                      style={{
                        color: theme.text,
                        fontFamily: 'PoppinsMedium',
                      }}
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
                      style={{
                        color: theme.text,
                        fontFamily: 'PoppinsMedium',
                      }}
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

        {allImages.length > 1 && (
          <View
            className="absolute bottom-4 right-4 px-4 py-2 rounded-full"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          >
            <Text className="text-white text-sm">
              {selectedImageIndex + 1} / {allImages.length}
            </Text>
          </View>
        )}

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

  if (!offer) {
    return (
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: theme.background }}
      >
        {/* Icon */}
        <View
          className="w-16 h-16 rounded-full items-center justify-center mb-5"
          style={{ backgroundColor: theme.card }}
        >
          <Clock size={28} color={theme.primary} />
        </View>

        {/* Title */}
        <Text
          className="text-xl text-center mb-2"
          style={{ color: theme.text, fontFamily: 'FredokaMedium' }}
        >
          This offer is coming soon ⏳
        </Text>

        {/* Description */}
        <Text
          className="text-sm text-center mb-8 leading-5"
          style={{ color: theme.textSecondary }}
        >
          We're putting the final touches on this deal. Check back shortly —
          delicious savings are on the way!
        </Text>

        {/* Action */}
        <TouchableOpacity
          onPress={() => router.replace('/')}
          activeOpacity={0.85}
          className="px-6 py-3 rounded-full"
          style={{ backgroundColor: theme.primary }}
        >
          <Text
            className="text-sm"
            style={{
              color: theme.background,
              fontFamily: 'FredokaMedium',
              letterSpacing: 0.3,
            }}
          >
            Back to Home
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalPrice = calculateTotalPrice();
  const currentQuantity = currentCartItem?.quantity || 0;

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <Animated.View
        className="absolute top-16 left-0 right-0 z-10 flex-row justify-between items-center px-6"
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

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderImageCarousel()}

        <Animated.View
          className="flex-1 relative mt-[-24px] rounded-t-3xl px-6 pt-6 pb-32"
          style={{
            backgroundColor: theme.backgroundSecondary,
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }],
          }}
        >
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
                className="text-white text-base"
                style={{ fontFamily: 'FredokaMedium' }}
              >
                {getDiscountPercentage(offer.price, offer.sale_price ?? 0)}% OFF
              </Text>
            </View>
          )}
          <Text
            className="text-3xl leading-tight my-4"
            style={{ color: theme.text, fontFamily: 'PoppinsMedium' }}
          >
            {offer.title}
          </Text>
          <View className="flex-row items-center gap-4 mb-6">
            <View className="flex-row items-center gap-1">
              <Star color={theme.warning} fill={theme.warning} size={18} />
              <Text
                className="text-base"
                style={{ color: theme.text, fontFamily: 'PoppinsMedium' }}
              >
                {offer.rating || '5.0'}
              </Text>
            </View>
            <Text style={{ color: theme.text, fontFamily: 'PoppinsLight' }}>
              Remaining offers ({offer.qty <= 0 ? 0 : offer.qty})
            </Text>
          </View>

          <Text
            style={{
              color: theme.text,
              fontFamily: 'FredokaMedium',
              fontSize: 15,
              marginBottom: 3,
            }}
          >
            What to expect:
          </Text>
          <Text
            style={{
              color: theme.textSecondary,
              fontFamily: 'PoppinsMedium',
              marginBottom: 22,
            }}
          >
            {offer.description}
          </Text>

          {renderPickupTime()}
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
                {offer.sale_price ? (
                  <Text
                    className="text-2xl line-through "
                    style={{
                      color: theme.textSecondary,
                      fontFamily: 'PoppinsMedium',
                    }}
                  >
                    ${formatPrice(offer.price)}
                  </Text>
                ) : (
                  <Text
                    className="text-2xl "
                    style={{
                      color: theme.primary,
                      fontFamily: 'PoppinsMedium',
                    }}
                  >
                    ${formatPrice(offer.price)}
                  </Text>
                )}
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

          {/* Custom Properties Selector */}
          {renderCustomPropertiesSelector()}

          {/* Readonly Properties */}
          {renderReadonlyProperties()}

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
          {currentQuantity > 0 && (
            <View
              className="flex-row items-center rounded-2xl p-1"
              style={{
                backgroundColor: theme.inputBackground,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <TouchableOpacity
                onPress={() => handleUpdateQuantity(currentQuantity - 1)}
                className="w-10 h-10 justify-center items-center rounded-xl"
                activeOpacity={0.7}
                style={{ backgroundColor: theme.card }}
              >
                <Minus color={theme.primary} size={18} strokeWidth={2.5} />
              </TouchableOpacity>

              <View className="px-4">
                <Text
                  className="text-base"
                  style={{ color: theme.text, fontFamily: 'PoppinsMedium' }}
                >
                  {currentQuantity}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleUpdateQuantity(currentQuantity + 1)}
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
            activeOpacity={0.85}
            disabled={offer.qty <= 0}
            className="flex-1 flex-row items-center justify-center px-6 py-4 rounded-2xl"
            style={{
              backgroundColor: offer.qty <= 0 ? theme.disabled : theme.primary,
              opacity: offer.qty <= 0 ? 0.7 : 1,
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: offer.qty <= 0 ? 0 : 0.25,
              shadowRadius: 8,
              elevation: offer.qty <= 0 ? 0 : 6,
            }}
          >
            <View className="flex-row items-center gap-2">
              <Text
                className="text-white text-base"
                style={{ fontFamily: 'PoppinsMedium' }}
              >
                {offer.qty <= 0 ? 'Coming Back Soon' : 'Add to Cart'}
              </Text>

              {offer.qty > 0 && (
                <Text
                  className="text-white/90 text-sm"
                  style={{ fontFamily: 'PoppinsRegular' }}
                >
                  • ${totalPrice.toFixed(2)}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {renderPropertyModal()}
      {renderLocationsModal()}
      {renderProviderModal()}
    </SafeAreaView>
  );
}
