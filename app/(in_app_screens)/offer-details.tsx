import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useColorScheme,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Plus,
  ChefHat,
  Heart,
} from 'lucide-react-native';
import { useAppStore } from '@/stores/appStore';
import { dummyOffers } from '@/data/dummyData';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Offer } from '@/types/appTypes';
import { useTheme } from '@/hooks/useTheme';
import { useFavoritesStore } from '@/stores/favoritesStore';

export default function OfferDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [offer, setOffer] = useState<Offer | null>(null);
  const {
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    isLoading,
    setIsNewFavoritedAdded,
  } = useFavoritesStore();
  const { theme } = useTheme();
  const { addToCart } = useAppStore();

  useEffect(() => {
    const foundOffer = dummyOffers.find((o) => o.id === id);
    setOffer(foundOffer || null);
  }, [id]);
  useEffect(() => {
    setIsNewFavoritedAdded(false);
  }, []);

  if (!offer) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>
          Offer not found
        </Text>
      </View>
    );
  }
  const handleFavoritePress = () => {
    console.log('hi');
    if (isFavorite(id)) {
      removeFromFavorites(id);
    } else {
      console.log('hiiii');
      addToFavorites(offer);
    }
  };

  const handleAddToCart = () => {
    addToCart(offer);
    // Show success feedback (you could implement a toast here)
  };

  const renderItemCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.itemCard,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
      onPress={() =>
        router.push(`/(in_app_screens)/item-details?id=${item.id}`)
      }
    >
      <Image source={item.image_url} style={styles.itemImage} />
      <View style={styles.itemContent}>
        <Text
          style={[styles.itemName, { color: theme.text }]}
          numberOfLines={2}
        >
          {item.name}
        </Text>
        <Text
          style={[styles.itemDescription, { color: theme.textSecondary }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
        <View style={styles.itemFooter}>
          <Text style={[styles.itemPrice, { color: theme.primary }]}>
            ${item.price.toFixed(2)}
          </Text>
          <View style={styles.itemMeta}>
            <Text style={[styles.itemCalories, { color: theme.textSecondary }]}>
              {item.calories} cal
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.backButton,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <ArrowLeft color={theme.textSecondary} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={offer.image_url} style={styles.offerImage} />
          <View
            style={[styles.discountBadge, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.discountText}>
              {offer.discount_percentage}% OFF
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.detailsContainer,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <TouchableOpacity
            onPress={handleFavoritePress}
            style={[
              {
                position: 'absolute',
                top: 15,
                right: 30,
                backgroundColor: isFavorite(id) ? theme.accent : theme.card,
                padding: 10,
                borderRadius: 15,
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator />
            ) : (
              <Heart fill={isFavorite(id) ? 'white' : 'gray'} strokeWidth={0} />
            )}
          </TouchableOpacity>
          <Text style={[styles.offerTitle, { color: theme.text }]}>
            {offer.title}
          </Text>

          <Text
            style={[styles.offerDescription, { color: theme.textSecondary }]}
          >
            {offer.description}
          </Text>

          <View style={styles.restaurantInfo}>
            <View style={styles.restaurantMeta}>
              <View style={styles.metaRow}>
                <ChefHat color={theme.primary} size={16} fill={theme.primary} />
                <Text style={[styles.restaurantName, { color: theme.text }]}>
                  {offer.restaurant.name}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <View style={styles.rating}>
                  <Star color={theme.primary} size={16} fill={theme.primary} />
                  <Text style={[styles.ratingText, { color: theme.text }]}>
                    {offer.rating} ({offer.review_count} reviews)
                  </Text>
                </View>
              </View>
              <View style={styles.metaRow}>
                <Clock color={theme.info} size={16} />
                <Text
                  style={[styles.deliveryTime, { color: theme.textSecondary }]}
                >
                  {offer.restaurant.delivery_time}
                </Text>
                <MapPin color={theme.error} size={16} />
                <Text style={[styles.address, { color: theme.textSecondary }]}>
                  {offer.restaurant.address}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.priceSection}>
            <View>
              <Text
                style={[styles.originalPrice, { color: theme.textSecondary }]}
              >
                Was ${offer.original_price.toFixed(2)}
              </Text>
              <Text style={[styles.discountedPrice, { color: theme.primary }]}>
                Now ${offer.discounted_price.toFixed(2)}
              </Text>
            </View>
            <Text style={[styles.savings, { color: theme.success }]}>
              You save $
              {(offer.original_price - offer.discounted_price).toFixed(2)}
            </Text>
          </View>

          {offer.tags && offer.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {offer.tags.map((tag, index) => (
                <View
                  key={index}
                  style={[
                    styles.tag,
                    { backgroundColor: `${theme.primary}20` },
                  ]}
                >
                  <Text style={[styles.tagText, { color: theme.text }]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.itemsSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Included Items ({offer.items.length})
            </Text>
            <FlatList
              data={offer.items}
              renderItem={renderItemCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.itemsList}
            />
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <View style={styles.footerContent}>
          <View>
            <Text style={[styles.footerPrice, { color: theme.primary }]}>
              ${offer.discounted_price.toFixed(2)}
            </Text>
            <Text style={[styles.footerSavings, { color: theme.success }]}>
              Save ${(offer.original_price - offer.discounted_price).toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addToCartButton, { backgroundColor: theme.primary }]}
            onPress={handleAddToCart}
          >
            <Plus color="#FFFFFF" size={20} />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  offerImage: {
    width: '100%',
    height: 300,
  },
  discountBadge: {
    position: 'absolute',
    top: 24,
    right: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  detailsContainer: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  offerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
    lineHeight: 36,
  },
  offerDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    marginBottom: 24,
  },
  restaurantInfo: {
    marginBottom: 24,
  },
  restaurantMeta: {
    gap: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  deliveryTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  address: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  originalPrice: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  discountedPrice: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  savings: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 32,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  itemsSection: {
    marginBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  itemsList: {
    gap: 12,
    borderRadius: 16,
    paddingBottom: 16,
  },
  itemCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  itemContent: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
    lineHeight: 22,
  },
  itemDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  itemMeta: {
    alignItems: 'flex-end',
  },
  itemCalories: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  footerPrice: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  footerSavings: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 100,
  },
});
