import { ColorTheme } from '@/constants/theme';
import { Offer } from '@/types/appTypes';
import { router } from 'expo-router';
import { ChefHat, Clock10, Heart, Map, PlusCircle } from 'lucide-react-native';
import { TouchableOpacity, View, Image, Text, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  formatDateRange,
  formatPrice,
  getDiscountPercentage,
  handleImageSrc,
} from '@/utils/helpers';
import * as images from '../constants/images';
import { LinearGradient } from 'expo-linear-gradient';
// Enhanced Near You Card

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Default Offer Card
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
      onPress={() => router.push(`/offer-details?id=${offer.id}`)}
      activeOpacity={0.95}
    >
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
        {offer.sale_price && (
          <View
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              backgroundColor: theme.primary + '90',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              zIndex: 2,
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: 13,
                fontFamily: 'FredokaMedium',
              }}
            >
              {getDiscountPercentage(offer.price, offer.sale_price)}% OFF
            </Text>
          </View>
        )}
        <TouchableOpacity
          onPress={handleFavouriteToggle}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: theme.background + '90',
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2,
          }}
        >
          <Heart
            size={20}
            strokeWidth={isFavourite(offer.id) ? 0 : 2}
            fill={isFavourite(offer.id) ? theme.error : 'transparent'}
            color={isFavourite(offer.id) ? theme.errorLight : theme.text}
          />
        </TouchableOpacity>
      </View>

      <View style={{ padding: 16 }}>
        <Text
          style={{
            fontSize: 18,
            fontFamily: 'PoppinsMedium',
            color: theme.text,
            marginBottom: 8,
          }}
          numberOfLines={2}
        >
          {offer.title}
        </Text>

        <View style={{ gap: 8, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
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
              <ChefHat color={theme.primary} size={16} />
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
              {offer.provider?.name}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
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
              numberOfLines={1}
            >
              {offer.pickup_start_time && offer.pickup_end_time
                ? formatDateRange([
                    offer.pickup_start_time,
                    offer.pickup_end_time,
                  ])
                : 'Open pickup time!'}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTopWidth: 1,
            paddingTop: 5,
            borderTopColor: theme.border + '40',
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
              }}
            >
              ${formatPrice(offer.sale_price ?? offer.price)}
            </Text>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: theme.primary,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onAdd(offer);
            }}
          >
            <PlusCircle color="#fff" size={16} />
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
    </TouchableOpacity>
  );
};
export default DefaultOfferCard;
