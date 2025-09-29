import React, { JSX, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import {
  Star,
  Search,
  Bell,
  Filter,
  TrendingUp,
  ChefHat,
  Sparkles,
  User,
} from 'lucide-react-native';
import { useAppStore } from '@/stores/appStore';
import { useTheme } from '@/hooks/useTheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, borderRadius, fontSize, shadows } from '@/constants/theme';
import { FilterOptions, Offer } from '@/types/appTypes';
import FilterModal from '@/components/HomeScreenFilter';

export default function HomeScreen(): JSX.Element {
  const { theme } = useTheme();
  const {
    offers,
    categories,
    isLoading,
    error,
    fetchCategories,
    fetchOffers,
    refreshData,
  } = useAppStore();

  const [refreshing, setRefreshing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions | null>(
    null
  );
  const [filteredOffers, setFilteredOffers] = useState(offers);

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    setFilteredOffers(offers);
  }, [offers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const featuredOffers = useMemo(
    () => offers.filter((offer) => offer.is_featured),
    [offers]
  );

  const autoRotate = () => {
    const nextIndex = (currentIndex + 1) % featuredOffers.length;

    if (nextIndex >= 0 && nextIndex < featuredOffers.length) {
      const nextItemOffset = (Dimensions.get('window').width + 10) * nextIndex;
      flatListRef?.current?.scrollToOffset({
        animated: true,
        offset: nextItemOffset,
      });
      setCurrentIndex(nextIndex);
    } else {
      setCurrentIndex(0);
    }
  };

  useEffect(() => {
    const interval = setInterval(autoRotate, 4000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleFilterApply = (filters: FilterOptions) => {
    setActiveFilters(filters);
    // Apply filters to offers
    let filtered = [...offers];

    // Filter by price range
    if (filters.priceRange.length > 0) {
      filtered = filtered.filter((offer: Offer) => {
        const price = offer.discounted_price;
        return filters.priceRange.some((range) => {
          if (range === '$') return price < 10;
          if (range === '$$') return price >= 10 && price < 20;
          if (range === '$$$') return price >= 20 && price < 30;
          if (range === '$$$$') return price >= 30;
          return false;
        });
      });
    }

    // Filter by rating
    if (filters.rating) {
      filtered = filtered.filter(
        (offer: Offer) => offer.rating >= filters.rating!
      );
    }

    // Sort
    if (filters.sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (filters.sortBy === 'price_low') {
      filtered.sort((a, b) => a.discounted_price - b.discounted_price);
    } else if (filters.sortBy === 'price_high') {
      filtered.sort((a, b) => b.discounted_price - a.discounted_price);
    }

    setFilteredOffers(filtered);
  };

  const hasActiveFilters =
    activeFilters &&
    (activeFilters.priceRange.length > 0 ||
      activeFilters.rating !== null ||
      activeFilters.deliveryTime.length > 0 ||
      activeFilters.sortBy !== 'recommended' ||
      activeFilters.cuisine.length > 0);

  const renderFeaturedHero = ({ item }: { item: Offer }) => (
    <TouchableOpacity
      style={[
        styles.heroCard,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.shadow,
        },
      ]}
      onPress={() => router.push(`/offer-details?id=${item.id}`)}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={item.image_url}
        style={styles.heroBackground}
        imageStyle={styles.heroBackgroundImage}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']}
          style={styles.heroGradient}
        >
          <View style={styles.heroContent}>
            <Text style={[styles.heroTitle, { color: theme.primary }]}>
              {item.title}
            </Text>
            <View
              style={[
                styles.heroInfo,
                { backgroundColor: theme.tabBarBackground, opacity: 0.7 },
              ]}
            >
              <View style={styles.heroInfoItem}>
                <ChefHat color={theme.primary} size={16} />
                <Text style={[styles.heroInfoText, { color: theme.text }]}>
                  {item.restaurant.name}
                </Text>
              </View>
              <View style={styles.heroInfoItem}>
                <Star color={theme.primary} size={16} fill={theme.primary} />
                <Text style={[styles.heroInfoText, { color: theme.text }]}>
                  {item.restaurant.cuisine_type}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );

  const renderCategoryChip = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        { backgroundColor: theme.card, borderColor: theme.border },
        item.name === 'Pizza' && {
          backgroundColor: theme.primary,
          borderColor: theme.primary,
        },
        ,
      ]}
      activeOpacity={0.7}
      onPress={() => router.push(`/(tabs)/categories?category=${item.id}`)}
    >
      <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
        <Image
          source={item.image_url}
          style={[{ width: 40, height: 40, borderRadius: 15 }]}
          resizeMode="cover"
        />
        <Text
          style={[
            styles.categoryChipText,
            { color: theme.text },
            item.name === 'Dinner' && { backgroundColor: theme.background },
          ]}
        >
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
      activeOpacity={0.85}
    >
      {/* Circular Image Container - Positioned to overlap */}
      <View style={styles.imageContainer}>
        <Image
          source={offer.image_url}
          style={[
            styles.offerImage,
            {
              shadowColor: 'red',
              borderColor: theme.inputBorder,
              backgroundColor: theme.card,
            },
          ]}
          resizeMode="cover"
        />
      </View>

      {/* Card Content */}
      <View style={styles.offerCardContent}>
        {/* Title and Rating Row */}
        <View style={styles.offerHeader}>
          <Text
            style={[styles.offerTitle, { color: theme.text }]}
            numberOfLines={1}
          >
            {offer.title}
          </Text>
        </View>
        <View style={styles.ratingContainer}>
          <Star color={theme.primary} size={12} fill={theme.primary} />
          <Text
            style={[
              styles.ratingText,
              { flexDirection: 'row', alignItems: 'center' },
              { color: theme.primary },
            ]}
          >
            {offer.rating} |{' '}
            <User color={theme.primary} size={12} fill={theme.primary} />{' '}
            {offer.review_count}
          </Text>
        </View>

        <View style={styles.metaItem}>
          <ChefHat color={theme.primary} size={12} fill={theme.primary} />
          <Text style={[styles.restaurantText, { color: theme.textSecondary }]}>
            {offer.restaurant.name}
          </Text>
        </View>

        {/* Price and Tag Row */}
        <View style={styles.offerFooter}>
          <View style={styles.priceContainer}>
            <Text
              style={[styles.originalPrice, { color: theme.textSecondary }]}
            >
              ${offer.original_price.toFixed(2)}
            </Text>
            <Text style={[styles.discountedPrice, { color: theme.text }]}>
              ${offer.discounted_price.toFixed(2)}
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
      <LinearGradient
        style={styles.scrollView}
        colors={[theme.background, theme.backgroundSecondary]}
        start={{ x: 0, y: 0 }} // top-left
        end={{ x: 1, y: 1 }} // bottom-right
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: 'https://i.pinimg.com/1200x/9d/ef/ca/9defcae8073bb0d0b028d3cba17ed828.jpg',
                }}
                style={styles.avatar}
              />
            </View>
            <View>
              <Text style={[styles.greeting, { color: theme.text }]}>
                Hi, Arnold
              </Text>
              <Text
                style={[styles.subGreeting, { color: theme.textSecondary }]}
              >
                Hungry for your favorites?
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.notificationButton,
              { borderColor: theme.border, backgroundColor: theme.card },
            ]}
            onPress={() => router.push('/notifications')}
          >
            <Bell color={theme.textSecondary} size={22} />
            <View
              style={[styles.notificationDot, { backgroundColor: theme.error }]}
            />
          </TouchableOpacity>
        </View>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TouchableOpacity
            style={[
              styles.searchBar,
              {
                backgroundColor: theme.overlay,
                opacity: 0.4,
                borderColor: theme.border,
              },
              shadows.sm,
            ]}
            onPress={() => router.push('/search')}
            activeOpacity={0.7}
          >
            <Search color={theme.textSecondary} size={20} />
            <Text
              style={[styles.searchPlaceholder, { color: theme.textSecondary }]}
            >
              Search for food, restaurants...
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.headerButton,
              {
                backgroundColor: hasActiveFilters ? theme.primary : theme.card,
                borderColor: hasActiveFilters ? theme.primary : theme.border,
              },
              shadows.sm,
            ]}
            onPress={() => setFilterVisible(true)}
          >
            <Filter
              color={hasActiveFilters ? theme.text : theme.textSecondary}
              size={20}
            />
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
        >
          <View
            style={[
              {
                paddingHorizontal: spacing.lg,
                marginBottom: 10,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
              },
            ]}
          >
            <Sparkles color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Featured Offers
            </Text>
          </View>
          {/* Hero Featured Card */}
          <FlatList
            ref={flatListRef}
            data={featuredOffers}
            keyExtractor={(item) => item.id}
            renderItem={renderFeaturedHero}
            contentContainerStyle={styles.featuredOffersList}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled={true}
            snapToInterval={Dimensions.get('window').width}
            decelerationRate="fast"
          />

          {/* Meal Category Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[{ flexDirection: 'row', alignItems: 'center', gap: 5 }]}
              >
                <TrendingUp color={theme.primary} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Latest Offers
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/categories')}
              >
                <Text
                  style={[styles.seeAllText, { color: theme.textSecondary }]}
                >
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={categories}
              renderItem={renderCategoryChip}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryChipsList}
            />

            {/* Offer Grid */}
            <View style={styles.offerGrid}>
              {filteredOffers.map((offer: Offer) => (
                <View key={offer.id} style={styles.offerGridItem}>
                  {renderOfferCard({ item: offer })}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={handleFilterApply}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'fixed',
    top: 0,
    right: 0,
    left: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerButton: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 350,
    marginHorizontal: 'auto',
    gap: 7,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 300,
    height: 50,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    gap: spacing.md,
  },
  searchPlaceholder: {
    fontSize: fontSize.base,
    fontFamily: 'Inter-Regular',
    height: 25,
    flex: 1,
  },
  greeting: {
    fontSize: fontSize.xl,
    fontFamily: 'Inter-Bold',
  },
  subGreeting: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  heroCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    borderRadius: 24,
    overflow: 'hidden',
    height: 200,
    width: 350,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroBackground: {
    width: '100%',
    height: '100%',
  },
  heroBackgroundImage: {
    borderRadius: 24,
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  heroContent: {
    gap: spacing.sm,
  },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  heroTagText: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-SemiBold',
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
  },
  heroInfo: {
    flexDirection: 'row',
    gap: spacing.lg,
    justifyContent: 'center',
    paddingVertical: 3,
    borderRadius: 10,
  },
  heroInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroInfoText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-SemiBold',
  },
  section: {
    paddingBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontFamily: 'Inter-Bold',
  },
  seeAllText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-SemiBold',
  },
  categoryChipsList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  featuredOffersList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  categoryChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-SemiBold',
  },
  offerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  offerGridItem: {
    width: '47.5%',
  },
  offerCard: {
    borderRadius: 20,
    overflow: 'visible',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 75, // Space for the overlapping image
  },
  imageContainer: {
    position: 'absolute',
    top: -75, // Positioned above the card
    left: 0,
    right: 0,
    shadowOffset: { width: 0, height: 20 },
    alignItems: 'center',
    zIndex: 10,
  },
  offerImage: {
    width: 130,
    height: 130,
    borderRadius: 55, // Circular image
    borderWidth: 1,
  },
  offerCardContent: {
    padding: spacing.md,
    paddingTop: 60, // Extra padding to account for the image
    gap: 8,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerTitle: {
    fontSize: fontSize.base,
    fontFamily: 'Inter-Bold',
    flex: 1,
    marginRight: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-SemiBold',
  },
  offerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Regular',
  },
  restaurantText: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-SemiBold',
  },
  offerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  originalPrice: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Regular',
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: fontSize.base,
    fontFamily: 'Inter-Bold',
  },
  tagContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  tagText: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-SemiBold',
  },
});
