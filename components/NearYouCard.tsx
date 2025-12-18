import { ColorTheme } from '@/constants/theme';
import { Offer } from '@/types/appTypes';
import { router } from 'expo-router';
import { ChefHat, Clock10, Heart, Map } from 'lucide-react-native';
import { useState } from 'react';
import {
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
  Image,
  Text,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { formatDateRange, formatPrice, handleImageSrc } from '@/utils/helpers';
import * as images from '../constants/images';
// Enhanced Near You Card

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NearYouCard = ({
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
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        backgroundColor: theme.card,
        overflow: 'visible',
        marginTop: 60,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
        elevation: 8,
      }}
      activeOpacity={0.9}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push(`/offer-details?id=${offer.id}`);
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
            left: '38%',
            transform: [{ translateX: -100 }],
            width: '90%',
            height: 180,
            borderRadius: 50,
            shadowColor: theme.shadow,
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
            borderWidth: 1,
            borderColor: theme.primaryLight,
          }}
          resizeMode="cover"
        />
      </View>

      <View
        style={{
          paddingTop: 165,
          padding: 20,
          paddingBottom: 1,
          alignItems: 'center',
        }}
      >
        <TouchableOpacity
          onPress={handleFavouriteToggle}
          style={{
            position: 'absolute',
            top: 100,
            right: 12,
            backgroundColor: theme.background + '90',
            width: 44,
            height: 44,
            borderRadius: 22,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.25,
            shadowRadius: 6,
          }}
        >
          <Heart
            size={22}
            strokeWidth={isFavourite(offer.id) ? 0 : 2}
            fill={isFavourite(offer.id) ? theme.error : 'transparent'}
            color={isFavourite(offer.id) ? theme.errorLight : theme.text}
          />
        </TouchableOpacity>

        {offer.provider?.logo_path && (
          <View
            style={{
              position: 'absolute',
              top: 100,
              left: 12,
              backgroundColor: theme.primary,
              padding: 3,
              width: 54,
              height: 54,
              borderRadius: 27,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.25,
              shadowRadius: 6,
            }}
          >
            <Image
              style={{ width: '100%', height: '100%', borderRadius: 23 }}
              source={{ uri: handleImageSrc(offer.provider?.logo_path) }}
            />
          </View>
        )}
        {offer.provider?.name && (
          <View
            style={{
              position: 'absolute',
              top: 135,
              left: 70,
            }}
          >
            <Text
              style={{
                color: theme.textSecondary,
                fontFamily: 'PoppinsMedium',
                textAlignVertical: 'center',
                fontSize: 13,
              }}
              numberOfLines={1}
            >
              {offer.provider?.name.length > 15
                ? offer.provider?.name.slice(0, 13) + '...'
                : offer.provider?.name}
            </Text>
          </View>
        )}

        <Text
          style={{
            fontSize: 21,
            fontFamily: 'PoppinsMedium',
            color: theme.text,
            textAlign: 'center',
          }}
          numberOfLines={2}
        >
          {offer.title}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            alignItems: 'center',
            gap: 5,
            justifyContent: 'center',
          }}
        >
          {offer.sale_price && (
            <Text
              style={{
                fontSize: 16,
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
              fontSize: 26,
              fontFamily: 'PoppinsMedium',
              color: theme.primary,
              letterSpacing: -0.5,
            }}
          >
            ${formatPrice(offer.sale_price ?? offer.price)}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
          }}
        >
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
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
              : 'Open pickup time!'}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingBottom: 8,
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <Text
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
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onAdd(offer);
            }}
            style={{
              backgroundColor: theme.primary,
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>
              +
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
export default NearYouCard;
