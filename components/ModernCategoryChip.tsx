import { handleImageSrc } from '@/utils/helpers';
import { TouchableOpacity, View, Image, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Category } from '@/types/appTypes';
import { ColorTheme } from '@/constants/theme';
import { router } from 'expo-router';
import * as images from '../constants/images';
const ModernCategoryChip = ({
  item,
  theme,
  isSelected,
}: {
  item: Category;
  theme: ColorTheme;
  isSelected: boolean;
}) => (
  <TouchableOpacity
    style={{
      width: 120,
      marginRight: 12,
      alignItems: 'center',
    }}
    activeOpacity={0.7}
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(`/categories?categoryId=${item.id}`);
    }}
  >
    <View
      style={{
        width: 85,
        height: 85,
        borderRadius: 42.5,
        backgroundColor: isSelected ? theme.primary : theme.card,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 3,
        borderColor: isSelected ? theme.primary : 'transparent',
      }}
    >
      <Image
        source={
          item.main_image
            ? { uri: handleImageSrc(item.main_image) }
            : images.CATEGORY_PLACEHOLDER_IMAGE
        }
        style={{ width: 60, height: 60, borderRadius: 30 }}
        resizeMode="contain"
      />
    </View>
    <Text
      style={{
        color: isSelected ? theme.primary : theme.text,
        fontSize: 13,
        fontFamily: 'FredokaMedium',
        textAlign: 'center',
      }}
      numberOfLines={2}
    >
      {item.name}
    </Text>
  </TouchableOpacity>
);

export default ModernCategoryChip;
