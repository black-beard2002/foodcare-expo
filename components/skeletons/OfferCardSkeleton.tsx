import { ColorTheme } from '@/constants/theme';
import { Skeleton } from 'moti/skeleton';
import { Dimensions, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OfferCardSkeleton = ({
  theme,
  isDark,
}: {
  theme: ColorTheme;
  isDark: boolean;
}) => (
  <View
    style={{
      width: SCREEN_WIDTH * 0.75,
      marginRight: 16,
      borderRadius: 24,
      backgroundColor: theme.card,
      overflow: 'hidden',
      marginTop: 60,
    }}
  >
    <Skeleton colorMode={isDark ? 'dark' : 'light'} width="100%" height={250} />
    <View style={{ padding: 16 }}>
      <Skeleton
        colorMode={isDark ? 'dark' : 'light'}
        width="80%"
        height={20}
        radius={8}
      />
      <Skeleton
        colorMode={isDark ? 'dark' : 'light'}
        width="60%"
        height={16}
        radius={8}
      />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 12,
        }}
      >
        <Skeleton
          colorMode={isDark ? 'dark' : 'light'}
          width={80}
          height={30}
          radius={12}
        />
        <Skeleton
          colorMode={isDark ? 'dark' : 'light'}
          width={80}
          height={36}
          radius={18}
        />
      </View>
    </View>
  </View>
);
export default OfferCardSkeleton;
