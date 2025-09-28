import React, { JSX, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useColorScheme,
  Dimensions,
  FlatList,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import {
  Star,
  Clock,
  MapPin,
  Search,
  Bell,
  Filter,
  Heart,
} from 'lucide-react-native';
import { useAppStore } from '@/stores/appStore';
import {
  dummyOffers,
  dummyCategories,
  dummyRestaurants,
} from '@/data/dummyData';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface ColorTheme {
  background: string;
  primary: string;
  primaryLight: string;
  secondary: string;
  text: string;
  textSecondary: string;
  card: string;
  border: string;
  shadow: string;
  accent: string;
  success: string;
  gradient: string[];
}

interface Offer {
  id: string;
  title: string;
  description: string;
  image_url: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  rating: number;
  review_count: number;
  is_featured: boolean;
  restaurant: {
    name: string;
    delivery_time: string;
  };
}

export default function HomeScreen(): JSX.Element {
  const colorScheme = useColorScheme();
  const { offers, setOffers, setCategories, setRestaurants } = useAppStore();

  const colors: Record<'light' | 'dark', ColorTheme> = {
    light: {
      background: '#F8F9FA',
      primary: '#22C55E',
      primaryLight: '#DCFCE7',
      secondary: '#16A34A',
      text: '#1A1A1A',
      textSecondary: '#6B7280',
      card: '#FFFFFF',
      border: '#E5E7EB',
      shadow: '#000000',
      accent: '#F59E0B',
      success: '#10B981',
      gradient: ['#22C55E', '#16A34A'],
    },
    dark: {
      background: '#0e0e0eff',
      primary: '#22C55E',
      primaryLight: '#052E16',
      secondary: '#16A34A',
      text: '#F8FAFC',
      textSecondary: '#94A3B8',
      card: '#202428ff',
      border: '#334155',
      shadow: '#000000',
      accent: '#F59E0B',
      success: '#10B981',
      gradient: ['#22C55E', '#16A34A'],
    },
  };

  const theme: ColorTheme = colors[colorScheme ?? 'light'];

  useEffect(() => {
    // Load dummy data
    setOffers(dummyOffers);
    setCategories(dummyCategories);
    setRestaurants(dummyRestaurants);
  }, []);

  const featuredOffers = offers.filter((offer: Offer) => offer.is_featured);

  const renderOfferCard = ({ item: offer }: { item: Offer }) => (
    <TouchableOpacity
      style={[
        styles.offerCard,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.shadow,
        },
      ]}
      onPress={() => router.push(`/offer-details?id=${offer.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.offerImageContainer}>
        <Image source={ offer.image_url } style={styles.offerImage} />
        <TouchableOpacity style={styles.favoriteButton}>
          <Heart color={theme.textSecondary} size={16} />
        </TouchableOpacity>
        <View
          style={[styles.discountBadge, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.discountText}>
            {offer.discount_percentage}% OFF
          </Text>
        </View>
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
        <View style={styles.offerMeta}>
          <View style={styles.rating}>
            <Star color="#F59E0B" size={14} fill="#F59E0B" />
            <Text style={[styles.ratingText, { color: theme.text }]}>
              {offer.rating}
            </Text>
            <Text style={[styles.reviewCount, { color: theme.textSecondary }]}>
              ({offer.review_count})
            </Text>
          </View>
          <View style={styles.deliveryInfo}>
            <Clock color={theme.textSecondary} size={12} />
            <Text style={[styles.deliveryText, { color: theme.textSecondary }]}>
              {offer.restaurant.delivery_time}
            </Text>
          </View>
        </View>
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

  const renderFeaturedCard = ({ item: offer }: { item: Offer }) => (
    <TouchableOpacity
      style={[
        styles.featuredCard,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.shadow,
        },
      ]}
      onPress={() => router.push(`/offer-details?id=${offer.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.featuredImageContainer}>
        <Image source={ offer.image_url } style={styles.featuredImage} />
        <View
          style={[styles.featuredBadge, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.featuredBadgeText}>FEATURED</Text>
        </View>
        <TouchableOpacity style={styles.featuredFavoriteButton}>
          <Heart color="#FFFFFF" size={18} fill="rgba(255,255,255,0.3)" />
        </TouchableOpacity>
      </View>
      <View style={styles.featuredContent}>
        <View style={styles.featuredHeader}>
          <Text
            style={[styles.featuredTitle, { color: theme.text }]}
            numberOfLines={1}
          >
            {offer.title}
          </Text>
          <View
            style={[
              styles.featuredDiscount,
              { backgroundColor: theme.primaryLight },
            ]}
          >
            <Text
              style={[styles.featuredDiscountText, { color: theme.primary }]}
            >
              {offer.discount_percentage}%
            </Text>
          </View>
        </View>
        <Text
          style={[styles.featuredRestaurant, { color: theme.textSecondary }]}
        >
          {offer.restaurant.name}
        </Text>
        <Text
          style={[styles.featuredDescription, { color: theme.textSecondary }]}
          numberOfLines={2}
        >
          {offer.description}
        </Text>
        <View style={styles.featuredFooter}>
          <View style={styles.featuredPriceContainer}>
            <Text
              style={[
                styles.featuredOriginalPrice,
                { color: theme.textSecondary },
              ]}
            >
              ${offer.original_price.toFixed(2)}
            </Text>
            <Text style={[styles.featuredPrice, { color: theme.primary }]}>
              ${offer.discounted_price.toFixed(2)}
            </Text>
          </View>
          <View style={styles.featuredRating}>
            <Star color="#F59E0B" size={14} fill="#F59E0B" />
            <Text style={[styles.featuredRatingText, { color: theme.text }]}>
              {offer.rating}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
      activeOpacity={0.7}
    >
      <Image
        source={ item.image_url }
        resizeMode="cover"
        style={{
          width: 50,
          height: 50,
          borderTopLeftRadius: 16,
          borderBottomLeftRadius: 16,
        }}
      />
      <Text
        style={[
          styles.categoryName,
          { color: theme.text, backgroundColor: theme.card },
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <View style={styles.headerLeft}>
          <View style={styles.locationContainer}>
            <MapPin color={theme.primary} size={16} />
            <Text style={[styles.locationText, { color: theme.textSecondary }]}>
              Deliver to
            </Text>
          </View>
          <Text style={[styles.locationName, { color: theme.text }]}>
            Downtown, NYC
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[
              styles.headerButton,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Bell color={theme.text} size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.headerButton,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Filter color={theme.text} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={[
            styles.searchBar,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
          // onPress={() => router.push("/search")}
        >
          <Search color={theme.textSecondary} size={20} />
          <Text
            style={[styles.searchPlaceholder, { color: theme.textSecondary }]}
          >
            Search for food, restaurants...
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Categories */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.text, paddingLeft: 20, marginBottom: 15 },
            ]}
          >
            Categories
          </Text>
          <FlatList
            data={dummyCategories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Featured Deals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Featured Deals
            </Text>
            <TouchableOpacity>
              <Text style={[styles.viewAllText, { color: theme.primary }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={featuredOffers}
            renderItem={renderFeaturedCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
            snapToInterval={300}
            decelerationRate="fast"
          />
        </View>

        {/* Popular Near You */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Popular Near You
            </Text>
            <TouchableOpacity>
              <Text style={[styles.viewAllText, { color: theme.primary }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.offersGrid}>
            {offers.slice(0, 6).map((offer: Offer) => (
              <View key={offer.id} style={styles.gridItem}>
                {renderOfferCard({ item: offer })}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerLeft: {
    flex: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  locationName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  searchPlaceholder: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  lastSection: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  // Categories
  categoriesList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryItem: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 80,
    flexDirection: 'row',
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 13,
    height: '100%',
    paddingHorizontal: 8,
    textAlignVertical: 'center',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  // Featured Cards
  featuredList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  featuredCard: {
    width: 300,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  featuredImageContainer: {
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: 180,
  },
  featuredBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  featuredBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  featuredFavoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredContent: {
    padding: 20,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  featuredTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    flex: 1,
    marginRight: 12,
  },
  featuredDiscount: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featuredDiscountText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  featuredRestaurant: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 16,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuredOriginalPrice: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textDecorationLine: 'line-through',
  },
  featuredPrice: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  featuredRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredRatingText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  // Offers Grid
  offersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
  },
  offerCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  offerImageContainer: {
    position: 'relative',
  },
  offerImage: {
    width: '100%',
    height: 120,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
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
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  offerMeta: {
    marginBottom: 8,
    gap: 4,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  reviewCount: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
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
});
