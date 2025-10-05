import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '@/stores/appStore';
import { useTheme } from '@/hooks/useTheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function CategoriesScreen() {
  const { theme } = useTheme();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const {
    categories,
    offers,
    isLoading,
    error,
    fetchCategories,
    fetchOffers,
    selectedCategory,
    setSelectedCategory,
  } = useAppStore();

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
    if (offers.length === 0) {
      fetchOffers();
    }
  }, [categories, offers]);

  useEffect(() => {
    if (categoryId) {
      setSelectedCategory(categoryId);
    }
  }, [categoryId]);

  const filteredOffers = selectedCategory
    ? offers.filter((offer) => offer.category_id === selectedCategory)
    : offers;

  const renderCategoryItem = ({ item: category }: { item: any }) => (
    <TouchableOpacity
      className="w-28 h-32 rounded-2xl p-1 border-2"
      style={{
        backgroundColor:
          selectedCategory === category.id ? theme.primaryLight : theme.card,
        borderColor:
          selectedCategory === category.id ? theme.primary : theme.border,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
      }}
      onPress={() =>
        setSelectedCategory(
          selectedCategory === category.id ? null : category.id
        )
      }
      activeOpacity={0.7}
    >
      <Image
        source={category.image_url}
        resizeMode="contain"
        className="w-full h-16 rounded-lg mb-2"
      />
      <View className="flex-1 justify-center">
        <Text
          className="text-sm font-bold text-center mb-0.5"
          style={{ color: theme.text }}
        >
          {category.name}
        </Text>
        <Text
          className="text-[10px] text-center leading-3"
          style={{ color: theme.textSecondary }}
          numberOfLines={2}
        >
          {category.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderOfferItem = ({ item: offer }: { item: any }) => (
    <TouchableOpacity
      className="flex-[0.5] rounded-2xl overflow-hidden border m-2"
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
      }}
      onPress={() =>
        router.push(`/(in_app_screens)/offer-details?id=${offer.id}`)
      }
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={
          offer.is_featured
            ? ['rgba(255, 215, 0, 0.8)', 'rgba(255, 165, 0, 0.8)']
            : [theme.card, theme.card]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 rounded-xl"
      >
        <Image source={offer.image_url} className="w-full h-28" />
        <View className="absolute top-2 right-2 bg-[#FF6B35] px-1.5 py-1 rounded">
          <Text className="text-white text-[10px] font-bold">
            {offer.discount_percentage}% OFF
          </Text>
        </View>
        <View className="p-3">
          <Text
            className="text-sm font-bold mb-1 leading-[18px]"
            style={{ color: theme.text }}
            numberOfLines={2}
          >
            {offer.title}
          </Text>
          <Text
            className="text-xs mb-2"
            style={{
              color: offer.is_featured ? theme.text : theme.textSecondary,
            }}
          >
            {offer.restaurant.name}
          </Text>
          <View className="flex-row items-center gap-2">
            <Text
              className="text-xs line-through"
              style={{
                color: offer.is_featured ? theme.text : theme.textSecondary,
              }}
            >
              ${offer.original_price.toFixed(2)}
            </Text>
            <Text
              className="text-base font-bold"
              style={{ color: theme.success }}
            >
              ${offer.discounted_price.toFixed(2)}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      className="flex-1 pt-5"
      style={{ backgroundColor: theme.background }}
    >
      <View className="px-6 pb-6">
        <Text className="text-3xl font-bold" style={{ color: theme.text }}>
          Categories
        </Text>
      </View>

      {isLoading && (
        <View className="p-6 items-center">
          <Text className="text-base" style={{ color: theme.textSecondary }}>
            Loading categories...
          </Text>
        </View>
      )}

      {error && (
        <View className="p-6 items-center">
          <Text
            className="text-base text-center mb-4"
            style={{ color: theme.error }}
          >
            {error}
          </Text>
          <TouchableOpacity
            className="px-6 py-3 rounded-lg"
            style={{ backgroundColor: theme.primary }}
            onPress={() => {
              fetchCategories();
              fetchOffers();
            }}
            activeOpacity={0.8}
          >
            <Text className="text-white text-sm font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="mb-6">
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            gap: 12,
            paddingBottom: 5,
          }}
        />
      </View>

      <View className="flex-1">
        <View className="flex-row justify-between items-center px-6 mb-4">
          <Text className="text-xl font-bold" style={{ color: theme.text }}>
            {selectedCategory
              ? categories.find((c) => c.id === selectedCategory)?.name
              : 'All Offers'}
          </Text>
          <Text className="text-sm" style={{ color: theme.textSecondary }}>
            {filteredOffers.length} offers
          </Text>
        </View>

        <FlatList
          data={filteredOffers.sort(
            (a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)
          )}
          renderItem={renderOfferItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{
            paddingHorizontal: 16,
            gap: 16,
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
