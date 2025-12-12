import { ColorTheme } from '@/constants/theme';
import { Skeleton } from 'moti/skeleton';
import { Dimensions, View } from 'react-native';

// Skeleton Loader Components
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_CARD_WIDTH = SCREEN_WIDTH - 60;
const FeaturedCardSkeleton = ({
  theme,
  isDark,
}: {
  theme: ColorTheme;
  isDark: boolean;
}) => (
  <View
    style={{
      width: HERO_CARD_WIDTH,
      height: 220,
      marginHorizontal: 5,
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: theme.card,
    }}
  >
    <Skeleton
      colorMode={isDark ? 'dark' : 'light'}
      width="100%"
      height="100%"
    />
  </View>
);
export default FeaturedCardSkeleton;
