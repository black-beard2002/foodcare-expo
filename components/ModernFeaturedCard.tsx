import { ColorTheme } from '@/constants/theme';
import { Offer } from '@/types/appTypes';
import {
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  View,
  Text,
  Image,
} from 'react-native';
import ReanimatedAnimated from 'react-native-reanimated';
import { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getDiscountPercentage, handleImageSrc } from '@/utils/helpers';
import { Sparkles } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_CARD_WIDTH = SCREEN_WIDTH - 60;
// Modern Carousel Featured Card with Reanimated
const ModernFeaturedCard = ({
  item,
  theme,
  animationValue,
}: {
  item: Offer;
  theme: ColorTheme;
  animationValue: any;
}) => {
  const maskStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      animationValue.value,
      [-1, 0, 1],
      [0.88, 1, 0.88]
    );

    const opacity = interpolate(
      animationValue.value,
      [-1, 0, 1],
      [0.6, 1, 0.6]
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  }, [animationValue]);

  return (
    <ReanimatedAnimated.View style={[maskStyle]}>
      <TouchableOpacity
        style={{
          width: HERO_CARD_WIDTH,
          height: 220,
          borderRadius: 28,
          overflow: 'hidden',
          backgroundColor: theme.card,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 16,
          elevation: 8,
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
          imageStyle={{ borderRadius: 28 }}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']}
            style={{
              flex: 1,
              padding: 24,
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
                  backgroundColor: theme.primary,
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  borderRadius: 24,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                }}
              >
                <Sparkles size={16} color="#fff" />
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 'bold',
                    fontFamily: 'FredokaMedium',
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
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    padding: 4,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                  }}
                >
                  <Image
                    style={{ width: '100%', height: '100%', borderRadius: 24 }}
                    source={{ uri: handleImageSrc(item.provider.logo_path) }}
                  />
                </View>
              )}
            </View>

            <View>
              <Text
                style={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: 14,
                  marginBottom: 6,
                  fontFamily: 'PoppinsLight',
                }}
                numberOfLines={2}
              >
                {item.description || 'Delicious food awaits'}
              </Text>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 24,
                    fontWeight: 'bold',
                    fontFamily: 'FredokaMedium',
                    flex: 1,
                  }}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    </ReanimatedAnimated.View>
  );
};
export default ModernFeaturedCard;
