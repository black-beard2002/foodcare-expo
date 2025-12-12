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
} from 'react-native';
import * as Location from 'expo-location';
import { useAlert } from '@/providers/AlertProvider';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/appStore';
import { Ionicons } from '@expo/vector-icons';
import { Provider, Address } from '../../types/appTypes'; // Assuming you have these types
import { handleImageSrc } from '@/utils/helpers';

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

type ProviderMarker = {
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
  providerType: string;
};

export default function NearMeScreen() {
  const [region, setRegion] = useState<Region | null>(null);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [providerMarkers, setProviderMarkers] = useState<ProviderMarker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<ProviderMarker | null>(
    null
  );
  const [showAllAddresses, setShowAllAddresses] = useState(false); // Toggle for showing all addresses
  const { theme } = useTheme();
  const { offers } = useAppStore();
  const { showAlert } = useAlert();
  const mapRef = useRef<MapView>(null);

  // Extract providers from offers and get their addresses
  const providersWithAddresses = useMemo(() => {
    if (!offers || offers.length === 0) return [];

    const providers: { provider: Provider; offerId: string }[] = [];
    offers.forEach((offer) => {
      if (offer?.provider) {
        providers.push({ provider: offer.provider, offerId: offer.id });
      }
    });

    return providers;
  }, [offers]);

  // Process providers to create markers with distance calculations
  useEffect(() => {
    if (!userLocation || providersWithAddresses.length === 0) {
      setProviderMarkers([]);
      return;
    }

    const markers: ProviderMarker[] = [];

    providersWithAddresses.forEach(({ provider, offerId }) => {
      if (!provider.addresses || provider.addresses.length === 0) return;

      const validAddresses = provider.addresses.filter(
        (address: Address) =>
          address?.latitude &&
          address?.longitude &&
          !isNaN(address.latitude) &&
          !isNaN(address.longitude)
      );

      if (validAddresses.length === 0) return;

      // If showAllAddresses is true, create markers for all valid addresses
      // Otherwise, only use the primary address (is_primary: true)
      const addressesToUse = showAllAddresses
        ? validAddresses
        : validAddresses.filter((addr: Address) => addr.is_primary);

      if (addressesToUse.length === 0 && !showAllAddresses) {
        // Fallback to first address if no primary address found
        addressesToUse.push(validAddresses[0]);
      }

      addressesToUse.forEach((address: Address, index: number) => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          address.latitude,
          address.longitude
        );

        markers.push({
          id: `${provider.id}-${address.latitude}-${address.longitude}-${index}`,
          coordinate: {
            latitude: address.latitude,
            longitude: address.longitude,
          },
          title: provider.name || '',
          description: `${address.street}, ${address.city}`,
          distance,
          provider,
          address,
          providerType: provider.provider_type,
        });
      });
    });

    // Remove duplicates (same provider at same location)
    const uniqueMarkers = markers.filter(
      (marker, index, self) =>
        index ===
        self.findIndex(
          (m) =>
            m.provider.id === marker.provider.id &&
            m.address.latitude === marker.address.latitude &&
            m.address.longitude === marker.address.longitude
        )
    );

    // Sort by nearest first
    const sortedMarkers = uniqueMarkers.sort(
      (a, b) => (a.distance || 0) - (b.distance || 0)
    );

    setProviderMarkers(sortedMarkers);
  }, [providersWithAddresses, userLocation, showAllAddresses]);

  // Fit map to show all markers when they're loaded
  useEffect(() => {
    if (providerMarkers.length > 0 && userLocation) {
      const allCoordinates = [
        userLocation,
        ...providerMarkers.map((marker) => marker.coordinate),
      ];

      mapRef.current?.fitToCoordinates(allCoordinates, {
        edgePadding: { top: 100, right: 50, bottom: 150, left: 50 },
        animated: true,
      });
    }
  }, [providerMarkers, userLocation]);

  const reverseGeocode = async (
    lat: number,
    lon: number
  ): Promise<string | null> => {
    try {
      const data = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lon,
      });
      if (data.length > 0) {
        const item = data[0];
        return `${item.name || ''} ${item.city || ''} ${
          item.region || ''
        }`.trim();
      }
      return null;
    } catch (e) {
      console.error('Reverse geocode error:', e);
      return null;
    }
  };

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
            'Location access is required to show nearby providers.',
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

        // Smooth animate map camera
        mapRef.current?.animateToRegion(newRegion, 1000);

        if (showAlertMessage) {
          const addressString = await reverseGeocode(latitude, longitude);

          if (addressString) {
            showAlert(
              'Location Found',
              `You're in ${addressString}`,
              'success'
            );
          } else {
            showAlert(
              'Location Found',
              'Your current location has been detected.',
              'info'
            );
          }
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

  // Fetch user location on mount
  useEffect(() => {
    handleGetCurrentLocation(false);
  }, []);

  const handleMarkerPress = (marker: ProviderMarker) => {
    setSelectedMarker(marker);
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

  const getMarkerColor = (providerType: string) => {
    switch (providerType) {
      case 'hospital':
        return '#FF4444'; // Red for hospitals
      case 'clinic':
        return '#44B7FF'; // Blue for clinics
      case 'pharmacy':
        return '#44FF7F'; // Green for pharmacies
      default:
        return '#FF6B6B';
    }
  };

  const nearestProviders = useMemo(
    () => providerMarkers.slice(0, 5), // Show top 5 nearest
    [providerMarkers]
  );

  const toggleShowAllAddresses = () => {
    setShowAllAddresses(!showAllAddresses);
    showAlert(
      'Display Mode Changed',
      `Now showing ${
        !showAllAddresses ? 'all addresses' : 'only primary addresses'
      }`,
      'info'
    );
  };

  const handleCallProvider = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch((err) =>
      showAlert('Error', 'Could not make call', 'error')
    );
  };

  const handleVisitWebsite = (website: string) => {
    const url = website.startsWith('http') ? website : `https://${website}`;
    Linking.openURL(url).catch((err) =>
      showAlert('Error', 'Could not open website', 'error')
    );
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
        region={region}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        loadingEnabled={true}
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            description="Your current position"
            pinColor="#2196F3"
          >
            <Ionicons name="person-circle" size={40} color="#2196F3" />
          </Marker>
        )}

        {/* Provider Markers */}
        {providerMarkers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={`${marker.address.city}, ${marker.distance?.toFixed(
              1
            )}km`}
            onPress={() => handleMarkerPress(marker)}
            pinColor={getMarkerColor(marker.providerType)}
          />
        ))}
      </MapView>

      {/* Control Buttons Container */}
      <View style={styles.controlsContainer}>
        {/* Location Button */}
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

        {/* Toggle Addresses Button */}
        {providersWithAddresses.length > 0 && (
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: theme.secondary }]}
            onPress={toggleShowAllAddresses}
          >
            <Ionicons
              name={showAllAddresses ? 'location' : 'location-outline'}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Selected Provider Details Card */}
      {selectedMarker && (
        <View
          style={[styles.detailsCard, { backgroundColor: theme.background }]}
        >
          <View style={styles.detailsHeader}>
            {selectedMarker.provider.logo_path ? (
              <Image
                source={{
                  uri: handleImageSrc(selectedMarker.provider.logo_path),
                }}
                style={styles.providerLogo}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.providerLogoPlaceholder,
                  { backgroundColor: theme.primary },
                ]}
              >
                <Text style={styles.logoPlaceholderText}>
                  {selectedMarker.provider.name?.charAt(0) || 'P'}
                </Text>
              </View>
            )}
            <View style={styles.detailsTitle}>
              <Text style={[styles.providerName, { color: theme.text }]}>
                {selectedMarker.provider.name}
              </Text>
              <Text
                style={[styles.providerType, { color: theme.textSecondary }]}
              >
                {selectedMarker.provider.provider_type}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedMarker(null)}>
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.detailsContent}>
            <View style={styles.addressSection}>
              <Ionicons name="location" size={20} color={theme.primary} />
              <View style={styles.addressText}>
                <Text style={[styles.addressStreet, { color: theme.text }]}>
                  {selectedMarker.address.street}
                </Text>
                <Text
                  style={[styles.addressCity, { color: theme.textSecondary }]}
                >
                  {selectedMarker.address.city}, {selectedMarker.address.state}{' '}
                  {selectedMarker.address.zipcode}
                </Text>
              </View>
            </View>

            <View style={styles.distanceSection}>
              <Ionicons name="navigate" size={20} color={theme.primary} />
              <Text style={[styles.distanceText, { color: theme.text }]}>
                {selectedMarker.distance?.toFixed(1)} km away
              </Text>
            </View>

            {selectedMarker.provider.description && (
              <Text
                style={[styles.description, { color: theme.textSecondary }]}
              >
                {selectedMarker.provider.description}
              </Text>
            )}

            <View style={styles.contactButtons}>
              {selectedMarker.provider.primary_phone && (
                <TouchableOpacity
                  style={[
                    styles.contactButton,
                    { backgroundColor: theme.success },
                  ]}
                  onPress={() =>
                    handleCallProvider(selectedMarker.provider.primary_phone)
                  }
                >
                  <Ionicons name="call" size={20} color="white" />
                  <Text style={styles.contactButtonText}>Call</Text>
                </TouchableOpacity>
              )}

              {selectedMarker.provider.website && (
                <TouchableOpacity
                  style={[
                    styles.contactButton,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={() =>
                    handleVisitWebsite(selectedMarker.provider.website)
                  }
                >
                  <Ionicons name="globe" size={20} color="white" />
                  <Text style={styles.contactButtonText}>Website</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Nearest Providers List */}
      {providerMarkers.length > 0 && selectedMarker && (
        <View
          style={[styles.nearestList, { backgroundColor: theme.background }]}
        >
          <Text style={[styles.nearestTitle, { color: theme.text }]}>
            Nearest Restaurants ({providerMarkers.length})
          </Text>
          <ScrollView>
            {nearestProviders.map((provider) => (
              <TouchableOpacity
                key={provider.id}
                style={[
                  styles.providerItem,
                  selectedMarker?.id === provider.id &&
                    styles.selectedProviderItem,
                ]}
                onPress={() => handleMarkerPress(provider)}
              >
                <View style={styles.providerMarker}>
                  <View
                    style={[
                      styles.markerDot,
                      {
                        backgroundColor: getMarkerColor(provider.providerType),
                      },
                    ]}
                  />
                </View>
                <View style={styles.providerInfo}>
                  <Text style={[styles.providerName, { color: theme.text }]}>
                    {provider.title}
                  </Text>
                  <Text
                    style={[
                      styles.providerAddress,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {provider.address.city}, {provider.address.state}
                  </Text>
                  <Text
                    style={[styles.providerDistance, { color: theme.primary }]}
                  >
                    {provider.distance?.toFixed(1)} km away
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
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

      {/* No Providers Message */}
      {providerMarkers.length === 0 &&
        providersWithAddresses.length > 0 &&
        userLocation && (
          <View style={styles.noProvidersOverlay}>
            <View
              style={[
                styles.noProvidersContent,
                { backgroundColor: theme.card },
              ]}
            >
              <Ionicons
                name="location-outline"
                size={48}
                color={theme.textSecondary}
              />
              <Text style={[styles.noProvidersText, { color: theme.text }]}>
                No restaurants with location data available nearby
              </Text>
            </View>
          </View>
        )}

      {/* Info Banner */}
      {providerMarkers.length > 0 && (
        <View style={[styles.infoBanner, { backgroundColor: theme.card }]}>
          <Ionicons name="information-circle" size={20} color={theme.primary} />
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Tap on markers for details •{' '}
            {showAllAddresses
              ? 'Showing all locations'
              : 'Showing primary locations'}
          </Text>
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
    top: 50,
    right: 20,
    gap: 10,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  detailsCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    maxHeight: 300,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  providerLogo: {
    width: 50,
    height: 50,
    borderRadius: 24,
    marginRight: 12,
  },
  providerLogoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholderText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  detailsTitle: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  providerType: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  detailsContent: {
    gap: 12,
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  addressText: {
    flex: 1,
  },
  addressStreet: {
    fontSize: 14,
    marginBottom: 2,
  },
  addressCity: {
    fontSize: 13,
  },
  distanceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  contactButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  nearestList: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 16,
    padding: 16,
    maxHeight: 220,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  nearestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  providerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  selectedProviderItem: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  providerMarker: {
    marginRight: 12,
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  providerInfo: {
    flex: 1,
  },
  providerAddress: {
    fontSize: 12,
    marginBottom: 2,
  },
  providerDistance: {
    fontSize: 12,
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  loadingContent: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  noProvidersOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  noProvidersContent: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  noProvidersText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  infoBanner: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    flex: 1,
  },
});
