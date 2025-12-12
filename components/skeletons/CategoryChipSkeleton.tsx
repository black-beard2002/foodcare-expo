import { ColorTheme } from '@/constants/theme';
import { Skeleton } from 'moti/skeleton';
import { View } from 'react-native';

const CategoryChipSkeleton = ({
  theme,
  isDark,
}: {
  theme: ColorTheme;
  isDark: boolean;
}) => (
  <View
    style={{
      width: 120,
      marginRight: 12,
      alignItems: 'center',
    }}
  >
    <Skeleton
      colorMode={isDark ? 'dark' : 'light'}
      width={80}
      height={80}
      radius="round"
    />
    <Skeleton
      colorMode={isDark ? 'dark' : 'light'}
      width={100}
      height={16}
      radius={8}
    />
  </View>
);
export default CategoryChipSkeleton;
