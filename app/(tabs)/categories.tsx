import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '@/stores/appStore';
import { dummyOffers, dummyCategories } from '@/data/dummyData';
import { useTheme } from '@/hooks/useTheme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CategoriesScreen() {
  const { theme } = useTheme();
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
  }, []);

  const filteredOffers = selectedCategory
    ? offers.filter((offer) => offer.category_id === selectedCategory)
    : offers;

  const renderCategoryItem = ({ item: category }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        {
          backgroundColor: selectedCategory === category.id 
            ? theme.primaryLight 
            : theme.card,
          borderColor:
            selectedCategory === category.id ? theme.primary : theme.border,
        },
      ]}
      onPress={() =>
        setSelectedCategory(
          selectedCategory === category.id ? null : category.id
        )
      }
    >
      <Image
        source={ category.image_url }
        style={styles.categoryImage}
      />
      <View style={styles.categoryContent}>
        <Text style={[styles.categoryName, { color: theme.text }]}>
          {category.name}
        </Text>
        <Text
          style={[styles.categoryDescription, { color: theme.textSecondary }]}
        >
          {category.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderOfferItem = ({ item: offer }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.offerCard,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
      onPress={() => router.push(`/offer-details?id=${offer.id}`)}
    >
      <Image source={ offer.image_url } style={styles.offerImage} />
      <View style={styles.discountBadge}>
        <Text style={styles.discountText}>
          {offer.discount_percentage}% OFF
        </Text>
      </View>
      <View style={styles.offerContent}>
        <Text
          style={[styles.offerTitle, { color: theme.text }]}
          numberOfLines={2}
        >
          {offer.title}
        </Text>
        <Text style={[styles.restaurantName, { color: theme.textSecondary }]}>
          {offer.restaurant.name}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={[styles.originalPrice, { color: theme.textSecondary }]}>
            ${offer.original_price.toFixed(2)}
          </Text>
          <Text style={[styles.discountedPrice, { color: theme.primary }]}>
            ${offer.discounted_price.toFixed(2)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Categories</Text>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading categories...
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.error }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={() => {
              fetchCategories();
              fetchOffers();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.categoriesSection}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <View style={styles.offersSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {selectedCategory
              ? categories.find((c) => c.id === selectedCategory)?.name
              : 'All Offers'}
          </Text>
          <Text style={[styles.offersCount, { color: theme.textSecondary }]}>
            {filteredOffers.length} offers
          </Text>
        </View>

        <FlatList
          data={filteredOffers}
          renderItem={renderOfferItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.offersList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
  },
  categoriesSection: {
    marginBottom: 24,
  },
  categoriesList: {
    paddingHorizontal: 24,
    gap: 12,
  },
  categoryCard: {
    width: 120,
    height: 140,
    borderRadius: 16,
    padding: 5,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryImage: {
    width: '100%',
    height: 70,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryContent: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 12,
  },
  offersSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  offersCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  offersList: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 100,
  },
  offerCard: {
    flex: 0.5,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    margin: 8,
  },
  offerImage: {
    width: '100%',
    height: 120,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  offerContent: {
    padding: 12,
  },
  offerTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
    lineHeight: 18,
  },
  restaurantName: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});