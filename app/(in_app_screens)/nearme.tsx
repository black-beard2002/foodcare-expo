import React, {
  useEffect,
  useCallback,
  useState,
  useRef,
  useMemo,
} from 'react';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Region,
  LatLng,
  Circle,
} from 'react-native-maps';
import {
  StyleSheet,
  View,
  Alert,
  Platform,
  Linking,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import { useAlert } from '@/providers/AlertProvider';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/appStore';
import { Ionicons } from '@expo/vector-icons';
import { Provider, Address, Offer } from '../../types/appTypes';
import { handleImageSrc } from '@/utils/helpers';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const NEAR_ME_RADIUS_KM = 9;

// Haversine formula to calculate distance between two coordinates in km
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

type RestaurantMarker = {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title: string;
  description?: string;
  distance?: number;
  provider: Provider;
  address: Address;
  offers: Offer[];
  isNearMe: boolean;
};

// Custom Marker Component
const CustomMarker = ({
  marker,
  isSelected,
  onPress,
}: {
  marker: RestaurantMarker;
  isSelected: boolean;
  onPress: () => void;
}) => {
  const [imageError, setImageError] = useState(false);
  const { theme } = useTheme();

  return (
    <Marker
      coordinate={marker.coordinate}
      onPress={onPress}
      tracksViewChanges={false}
      anchor={{ x: 0.5, y: 0.5 }}
      zIndex={isSelected ? 1000 : 1}
    >
      <View style={styles.customMarkerContainer}>
        {marker.provider?.logo_path && !imageError ? (
          <View
            style={[
              styles.customMarker,
              isSelected && styles.customMarkerSelected,
              marker.isNearMe && styles.customMarkerNearMe,
              {
                borderColor: isSelected ? theme.primary : 'white',
                backgroundColor: 'white',
              },
            ]}
          >
            <Image
              source={{ uri: handleImageSrc(marker.provider.logo_path) }}
              style={styles.markerImage}
              resizeMode="contain"
              onError={() => setImageError(true)}
              onLoadStart={() => setImageError(false)}
            />
          </View>
        ) : (
          <View
            style={[
              styles.defaultMarker,
              marker.isNearMe && styles.defaultMarkerNearMe,
              {
                backgroundColor: marker.isNearMe
                  ? theme.success
                  : theme.primary,
                borderColor: 'white',
              },
            ]}
          >
            <Ionicons name="restaurant" size={20} color="white" />
          </View>
        )}
        {marker.isNearMe && (
          <View
            style={[styles.nearMeBadge, { backgroundColor: theme.success }]}
          >
            <Text style={styles.nearMeBadgeText}>Near</Text>
          </View>
        )}
      </View>
    </Marker>
  );
};

// Restaurant Card Component
const RestaurantCard = ({
  marker,
  isActive,
  onPress,
  onCall,
  onDirections,
  onWebsite,
  onOfferPress,
}: {
  marker: RestaurantMarker;
  isActive: boolean;
  onPress: () => void;
  onCall: () => void;
  onDirections: () => void;
  onWebsite: () => void;
  onOfferPress: (offerId: string) => void;
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.restaurantCard,
        { backgroundColor: theme.card },
        isActive && styles.activeCard,
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Restaurant Header */}
      <View style={styles.cardHeader}>
        {marker.provider.logo_path ? (
          <Image
            source={{ uri: handleImageSrc(marker.provider.logo_path) }}
            style={styles.cardLogo}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.cardLogoPlaceholder,
              { backgroundColor: theme.primary },
            ]}
          >
            <Ionicons name="restaurant" size={24} color="white" />
          </View>
        )}
        <View style={styles.cardHeaderText}>
          <View style={styles.cardTitleRow}>
            <Text
              style={[styles.cardTitle, { color: theme.text }]}
              numberOfLines={1}
            >
              {marker.title}
            </Text>
            {marker.isNearMe && (
              <View
                style={[styles.nearMeChip, { backgroundColor: theme.success }]}
              >
                <Ionicons name="location" size={12} color="white" />
                <Text style={styles.nearMeChipText}>Near</Text>
              </View>
            )}
          </View>
          <View style={styles.distanceRow}>
            <Ionicons name="navigate" size={14} color={theme.primary} />
            <Text style={[styles.distanceText, { color: theme.textSecondary }]}>
              {marker.distance?.toFixed(1)} km away
            </Text>
          </View>
        </View>
      </View>

      {/* Address */}
      <View style={styles.addressContainer}>
        <Ionicons
          name="location-outline"
          size={16}
          color={theme.textSecondary}
        />
        <Text
          style={[styles.addressText, { color: theme.textSecondary }]}
          numberOfLines={2}
        >
          {marker.address.street}, {marker.address.city}
        </Text>
      </View>

      {/* Available Offers */}
      {marker.offers.length > 0 && (
        <View style={styles.offersSection}>
          <Text style={[styles.offersSectionTitle, { color: theme.text }]}>
            Available Offers ({marker.offers.length})
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.offersScroll}
            nestedScrollEnabled={true}
          >
            {marker.offers.map((offer) => (
              <TouchableOpacity
                key={offer.id}
                style={[
                  styles.offerCard,
                  { backgroundColor: theme.background },
                ]}
                onPress={() => onOfferPress(offer.id)}
                activeOpacity={0.7}
              >
                {offer.main_image ? (
                  <Image
                    source={{ uri: handleImageSrc(offer.main_image) }}
                    style={styles.offerImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.offerImagePlaceholder,
                      { backgroundColor: theme.primary + '20' },
                    ]}
                  >
                    <Ionicons
                      name="fast-food-outline"
                      size={32}
                      color={theme.primary}
                    />
                  </View>
                )}
                <View style={styles.offerDetails}>
                  <Text
                    style={[styles.offerTitle, { color: theme.text }]}
                    numberOfLines={2}
                  >
                    {offer.title}
                  </Text>
                  <View style={styles.offerPriceRow}>
                    {offer.sale_price && offer.sale_price < offer.price ? (
                      <>
                        <Text
                          style={[
                            styles.offerSalePrice,
                            { color: theme.success },
                          ]}
                        >
                          ${offer.sale_price.toFixed(2)}
                        </Text>
                        <Text
                          style={[
                            styles.offerOriginalPrice,
                            { color: theme.textSecondary },
                          ]}
                        >
                          ${offer.price.toFixed(2)}
                        </Text>
                      </>
                    ) : (
                      <Text style={[styles.offerPrice, { color: theme.text }]}>
                        ${offer.price.toFixed(2)}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {marker.provider.primary_phone && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.success }]}
            onPress={onCall}
          >
            <Ionicons name="call" size={18} color="white" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.primary }]}
          onPress={onDirections}
        >
          <Ionicons name="navigate" size={18} color="white" />
          <Text style={styles.actionButtonText}>Directions</Text>
        </TouchableOpacity>
        {marker.provider.website && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.secondary }]}
            onPress={onWebsite}
          >
            <Ionicons name="globe" size={18} color="white" />
            <Text style={styles.actionButtonText}>Website</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function NearMeScreen() {
  const [region, setRegion] = useState<Region | null>(null);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [restaurantMarkers, setRestaurantMarkers] = useState<
    RestaurantMarker[]
  >([]);
  const [selectedMarker, setSelectedMarker] = useState<RestaurantMarker | null>(
    null
  );
  const [showNearMeOnly, setShowNearMeOnly] = useState(true);
  const { theme } = useTheme();
  const { offers } = useAppStore();
  const { showAlert } = useAlert();
  const mapRef = useRef<MapView>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const router = useRouter();

  // Get restaurants within 9km radius (NEAR_ME_RADIUS_KM)
  const getNearMeRestaurants = useCallback(
    (
      userLat: number,
      userLon: number,
      allRestaurants: RestaurantMarker[]
    ): RestaurantMarker[] => {
      return allRestaurants.filter((restaurant) => {
        const distance = calculateDistance(
          userLat,
          userLon,
          restaurant.coordinate.latitude,
          restaurant.coordinate.longitude
        );
        return distance <= NEAR_ME_RADIUS_KM;
      });
    },
    []
  );

  // FIXED: Extract providers from offers and group offers by provider
  const restaurantsWithOffers = useMemo(() => {
    if (!offers || offers.length === 0) return [];

    const providerOffersMap = new Map<
      string,
      { provider: Provider; offers: Offer[] }
    >();

    offers.forEach((offer) => {
      // Validate offer has provider with valid ID
      if (!offer?.provider?.id) {
        console.warn('Offer missing provider or provider ID:', offer?.id);
        return;
      }

      const providerId = offer.provider.id;
      const providerData = offer.provider;

      // Validate provider has basic required fields
      if (
        !providerData.name ||
        !providerData.addresses ||
        providerData.addresses.length === 0
      ) {
        console.warn('Provider missing required fields:', providerId);
        return;
      }

      // Get valid address with coordinates
      const validAddress = providerData.addresses.find(
        (addr) =>
          addr.latitude &&
          addr.longitude &&
          !isNaN(addr.latitude) &&
          !isNaN(addr.longitude)
      );

      if (!validAddress) {
        console.warn('No valid address found for provider:', providerData.name);
        return;
      }

      // Initialize provider in map if not exists
      if (!providerOffersMap.has(providerId)) {
        providerOffersMap.set(providerId, {
          provider: providerData,
          offers: [],
        });
      }

      // Only add unique offers for this provider
      const existingOffers = providerOffersMap.get(providerId)!.offers;
      const offerExists = existingOffers.some(
        (existingOffer) => existingOffer.id === offer.id
      );

      if (!offerExists) {
        providerOffersMap.get(providerId)!.offers.push(offer);
      }
    });

    const result = Array.from(providerOffersMap.values());
    console.log('✅ Grouped restaurants:', result.length);

    return result;
  }, [offers]);

  // Process restaurants to create markers with distance calculations
  useEffect(() => {
    if (!userLocation || restaurantsWithOffers.length === 0) {
      setRestaurantMarkers([]);
      setSelectedMarker(null);
      setActiveCardIndex(0);
      return;
    }

    const markers: RestaurantMarker[] = [];

    restaurantsWithOffers.forEach(({ provider, offers: providerOffers }) => {
      // Get valid address with coordinates
      const validAddress = provider.addresses?.find(
        (addr) =>
          addr.latitude &&
          addr.longitude &&
          !isNaN(addr.latitude) &&
          !isNaN(addr.longitude)
      );

      if (!validAddress) return;

      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        validAddress.latitude,
        validAddress.longitude
      );

      const isNearMe = distance <= NEAR_ME_RADIUS_KM;

      markers.push({
        id: provider.id,
        coordinate: {
          latitude: validAddress.latitude,
          longitude: validAddress.longitude,
        },
        title: provider.name || 'Unnamed Restaurant',
        description: `${validAddress.street || ''}, ${validAddress.city || ''}`,
        distance,
        provider,
        address: validAddress,
        offers: providerOffers,
        isNearMe,
      });
    });

    // Sort by nearest first
    const sortedMarkers = markers.sort(
      (a, b) => (a.distance || 0) - (b.distance || 0)
    );

    console.log('📍 Markers created:', sortedMarkers.length);
    setRestaurantMarkers(sortedMarkers);

    // Select the first marker if there are markers
    if (sortedMarkers.length > 0) {
      setSelectedMarker(sortedMarkers[0]);
      setActiveCardIndex(0);
    }
  }, [restaurantsWithOffers, userLocation]);

  // Get filtered markers based on showNearMeOnly
  const displayedMarkers = useMemo(() => {
    if (!showNearMeOnly) return restaurantMarkers;
    return restaurantMarkers.filter((marker) => marker.isNearMe);
  }, [restaurantMarkers, showNearMeOnly]);

  // Get restaurants within 9km radius for stats
  const nearMeRestaurants = useMemo(() => {
    if (!userLocation) return [];
    return getNearMeRestaurants(
      userLocation.latitude,
      userLocation.longitude,
      restaurantMarkers
    );
  }, [userLocation, restaurantMarkers, getNearMeRestaurants]);

  // Fit map to show markers when they're loaded or filter changes
  useEffect(() => {
    if (displayedMarkers.length > 0 && userLocation) {
      const allCoordinates = [
        userLocation,
        ...displayedMarkers.map((marker) => marker.coordinate),
      ];

      mapRef.current?.fitToCoordinates(allCoordinates, {
        edgePadding: { top: 150, right: 50, bottom: 350, left: 50 },
        animated: true,
      });
    }
  }, [displayedMarkers, userLocation]);

  const handleGetCurrentLocation = useCallback(
    async (showAlertMessage: boolean = true) => {
      setIsGettingLocation(true);

      try {
        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          showAlert(
            'Location Services Disabled',
            'Please enable location services in your device settings.',
            'error'
          );
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

        const newRegion: Region = {
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };

        setRegion(newRegion);
        setUserLocation({ latitude, longitude });

        mapRef.current?.animateToRegion(newRegion, 1000);

        if (showAlertMessage) {
          showAlert(
            'Location Found',
            'Your current location has been detected.',
            'success'
          );
        }
      } catch (error: any) {
        showAlert(
          'Location Error',
          error.message || 'Unable to get your location. Please try again.',
          'error'
        );
      } finally {
        setIsGettingLocation(false);
      }
    },
    [showAlert]
  );

  // Initial location load
  useEffect(() => {
    handleGetCurrentLocation(false);
  }, []);

  const handleMarkerPress = (marker: RestaurantMarker) => {
    setSelectedMarker(marker);
    const markerIndex = displayedMarkers.findIndex((m) => m.id === marker.id);
    if (markerIndex !== -1) {
      setActiveCardIndex(markerIndex);
      scrollViewRef.current?.scrollTo({
        x: markerIndex * (CARD_WIDTH + 20),
        animated: true,
      });
    }

    mapRef.current?.animateToRegion(
      {
        ...marker.coordinate,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500
    );
  };

  const handleMapPress = () => {
    setSelectedMarker(null);
  };

  const toggleNearMeFilter = () => {
    setShowNearMeOnly(!showNearMeOnly);
    setSelectedMarker(null);
    setActiveCardIndex(0);
    showAlert(
      'Filter Updated',
      `Now showing ${
        !showNearMeOnly ? 'only nearby restaurants (9km)' : 'all restaurants'
      }`,
      'info'
    );
  };

  const handleCallProvider = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() =>
      showAlert('Error', 'Could not make call', 'error')
    );
  };

  const handleVisitWebsite = (website: string) => {
    const url = website.startsWith('http') ? website : `https://${website}`;
    Linking.openURL(url).catch(() =>
      showAlert('Error', 'Could not open website', 'error')
    );
  };

  const handleOfferPress = useCallback(
    (offerId: string) => {
      router.push(`/offer-details?id=${offerId}`);
    },
    [router]
  );

  const handleGetDirections = (
    latitude: number,
    longitude: number,
    name: string
  ) => {
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });
    const latLng = `${latitude},${longitude}`;
    const label = name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    Linking.openURL(url!).catch(() => {
      const webUrl = `https://www.google.com/maps/search/?api=1&query=${latLng}`;
      Linking.openURL(webUrl);
    });
  };

  const onScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (CARD_WIDTH + 20));

    if (
      index !== activeCardIndex &&
      index >= 0 &&
      index < displayedMarkers.length
    ) {
      setActiveCardIndex(index);
      const marker = displayedMarkers[index];
      setSelectedMarker(marker);

      mapRef.current?.animateToRegion(
        {
          ...marker.coordinate,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        350
      );
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        region={region!}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        loadingEnabled={true}
      >
        {/* 9km radius circle */}
        {userLocation && showNearMeOnly && (
          <Circle
            center={userLocation}
            radius={NEAR_ME_RADIUS_KM * 1000}
            fillColor="rgba(33, 150, 243, 0.1)"
            strokeColor="rgba(33, 150, 243, 0.3)"
            strokeWidth={2}
          />
        )}

        {/* Restaurant Markers with Custom Icons */}
        {displayedMarkers.map((marker) => (
          <CustomMarker
            key={marker.id}
            marker={marker}
            isSelected={selectedMarker?.id === marker.id}
            onPress={() => handleMarkerPress(marker)}
          />
        ))}
      </MapView>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: theme.primary }]}
          onPress={() => handleGetCurrentLocation()}
          disabled={isGettingLocation}
        >
          {isGettingLocation ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Ionicons name="locate" size={24} color="white" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            {
              backgroundColor: showNearMeOnly ? theme.success : theme.secondary,
            },
          ]}
          onPress={toggleNearMeFilter}
        >
          <Ionicons
            name={showNearMeOnly ? 'radio-button-on' : 'radio-button-off'}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {/* Header Stats */}
      <View style={[styles.headerStats, { backgroundColor: theme.card }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: theme.backgroundSecondary,
            padding: 6,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft color={theme.text} />
        </TouchableOpacity>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.primary }]}>
            {displayedMarkers.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Total
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.success }]}>
            {nearMeRestaurants.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Within {NEAR_ME_RADIUS_KM}km
          </Text>
        </View>
      </View>

      {/* Horizontal Scrolling Restaurant Cards */}
      {displayedMarkers.length > 0 && (
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + 20}
          decelerationRate="fast"
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.cardsContainer}
          style={styles.cardsScrollView}
        >
          {displayedMarkers.map((marker, index) => (
            <RestaurantCard
              key={marker.id}
              marker={marker}
              isActive={activeCardIndex === index}
              onPress={() => handleMarkerPress(marker)}
              onCall={() => handleCallProvider(marker.provider.primary_phone)}
              onDirections={() =>
                handleGetDirections(
                  marker.coordinate.latitude,
                  marker.coordinate.longitude,
                  marker.title
                )
              }
              onWebsite={() => handleVisitWebsite(marker.provider.website)}
              onOfferPress={handleOfferPress}
            />
          ))}
        </ScrollView>
      )}

      {/* Loading Overlay */}
      {isGettingLocation && (
        <View style={styles.loadingOverlay}>
          <View
            style={[styles.loadingContent, { backgroundColor: theme.card }]}
          >
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.text }]}>
              Finding your location...
            </Text>
          </View>
        </View>
      )}

      {/* No Restaurants Message */}
      {displayedMarkers.length === 0 && !isGettingLocation && userLocation && (
        <View style={styles.noRestaurantsOverlay}>
          <View
            style={[
              styles.noRestaurantsContent,
              { backgroundColor: theme.card },
            ]}
          >
            <Ionicons
              name="restaurant-outline"
              size={64}
              color={theme.textSecondary}
            />
            <Text style={[styles.noRestaurantsTitle, { color: theme.text }]}>
              No Restaurants Found
            </Text>
            <Text
              style={[styles.noRestaurantsText, { color: theme.textSecondary }]}
            >
              {showNearMeOnly
                ? `No restaurants within ${NEAR_ME_RADIUS_KM}km of your location`
                : 'No restaurants available in this area'}
            </Text>
            {showNearMeOnly && (
              <TouchableOpacity
                style={[
                  styles.showAllButton,
                  { backgroundColor: theme.primary },
                ]}
                onPress={toggleNearMeFilter}
              >
                <Text style={styles.showAllButtonText}>
                  Show All Restaurants
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  controlsContainer: {
    position: 'absolute',
    top: 120,
    right: 20,
    gap: 12,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  headerStats: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  customMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  customMarker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  customMarkerSelected: {
    borderWidth: 4,
    transform: [{ scale: 1.2 }],
    elevation: 8,
  },
  customMarkerNearMe: {
    borderColor: '#4CAF50',
  },
  markerImage: {
    width: '100%',
    height: '100%',
  },
  defaultMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    elevation: 5,
  },
  defaultMarkerNearMe: {
    borderColor: '#4CAF50',
  },
  nearMeBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nearMeBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardsScrollView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: height * 0.45,
  },
  cardsContainer: {
    paddingHorizontal: (width - CARD_WIDTH) / 2,
    paddingVertical: 20,
  },
  restaurantCard: {
    width: CARD_WIDTH,
    marginHorizontal: 10,
    borderRadius: 20,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  activeCard: {
    transform: [{ scale: 1.02 }],
    elevation: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  cardLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  nearMeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  nearMeChipText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 13,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  addressText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  offersSection: {
    marginBottom: 12,
  },
  offersSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  offersScroll: {
    marginHorizontal: -4,
  },
  offerCard: {
    width: 160,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  offerImage: {
    width: '100%',
    height: 100,
  },
  offerImagePlaceholder: {
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerDetails: {
    padding: 10,
  },
  offerTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
    height: 36,
    lineHeight: 18,
  },
  offerPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  offerPrice: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  offerSalePrice: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  offerOriginalPrice: {
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  loadingContent: {
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    elevation: 10,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  noRestaurantsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noRestaurantsContent: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 400,
    elevation: 8,
  },
  noRestaurantsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  noRestaurantsText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  showAllButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  showAllButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
