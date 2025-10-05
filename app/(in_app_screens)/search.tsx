import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Search, X, Clock, Star } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/appStore';
import { spacing, borderRadius, fontSize, shadows } from '@/constants/theme';

export default function SearchScreen() {
  const { theme } = useTheme();
  const { offers, restaurants } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Pizza',
    'Sushi',
    'Burgers',
    'Pasta',
    'Donuts',
  ]);

  const performSearch = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);

      // Simulate search delay
      setTimeout(() => {
        const lowerQuery = query.toLowerCase();

        // Search in offers
        const offerResults = offers
          .filter(
            (offer: any) =>
              offer.title.toLowerCase().includes(lowerQuery) ||
              offer.description.toLowerCase().includes(lowerQuery) ||
              offer.restaurant.name.toLowerCase().includes(lowerQuery)
          )
          .map((offer: any) => ({ ...offer, type: 'offer' }));

        // Search in restaurants
        const restaurantResults = restaurants
          .filter(
            (restaurant: any) =>
              restaurant.name.toLowerCase().includes(lowerQuery) ||
              restaurant.cuisine.toLowerCase().includes(lowerQuery)
          )
          .map((restaurant: any) => ({ ...restaurant, type: 'restaurant' }));

        setSearchResults([...offerResults, ...restaurantResults]);
        setIsSearching(false);
      }, 300);
    },
    [offers, restaurants]
  );

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, performSearch]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleRecentSearch = (query: string) => {
    setSearchQuery(query);
    if (!recentSearches.includes(query)) {
      setRecentSearches([query, ...recentSearches.slice(0, 4)]);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const removeRecentSearch = (query: string) => {
    setRecentSearches(recentSearches.filter((q) => q !== query));
  };

  const renderSearchResult = ({ item }: { item: any }) => {
    if (item.type === 'offer') {
      return (
        <TouchableOpacity
          style={[
            styles.resultCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
          onPress={() =>
            router.push(`/(in_app_screens)/offer-details?id=${item.id}`)
          }
        >
          <Image source={item.image_url} style={styles.resultImage} />
          <View style={styles.resultContent}>
            <Text
              style={[styles.resultTitle, { color: theme.text }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text
              style={[styles.resultSubtitle, { color: theme.textSecondary }]}
            >
              {item.restaurant.name}
            </Text>
            <View style={styles.resultMeta}>
              <View style={styles.resultRating}>
                <Star color="#F59E0B" size={12} fill="#F59E0B" />
                <Text style={[styles.resultRatingText, { color: theme.text }]}>
                  {item.rating}
                </Text>
              </View>
              <Text style={[styles.resultPrice, { color: theme.primary }]}>
                ${item.discounted_price.toFixed(2)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[
          styles.resultCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
        // onPress={() => router.push(`/restaurants?id=${item.id}`)}
      >
        <Image source={item.image_url} style={styles.resultImage} />
        <View style={styles.resultContent}>
          <Text
            style={[styles.resultTitle, { color: theme.text }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={[styles.resultSubtitle, { color: theme.textSecondary }]}>
            {item.cuisine}
          </Text>
          <View style={styles.resultMeta}>
            <View style={styles.resultRating}>
              <Star color="#F59E0B" size={12} fill="#F59E0B" />
              <Text style={[styles.resultRatingText, { color: theme.text }]}>
                {item.rating}
              </Text>
            </View>
            <Text
              style={[styles.resultDelivery, { color: theme.textSecondary }]}
            >
              {item.delivery_time}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <View
          style={[
            styles.searchInputContainer,
            {
              backgroundColor: theme.inputBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <Search color={theme.textSecondary} size={20} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search for food, restaurants..."
            placeholderTextColor={theme.inputPlaceholder}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X color={theme.textSecondary} size={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {searchQuery.length === 0 ? (
        <View style={styles.content}>
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Clock color={theme.textSecondary} size={18} />
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Recent Searches
                  </Text>
                </View>
                <TouchableOpacity onPress={clearRecentSearches}>
                  <Text style={[styles.clearText, { color: theme.primary }]}>
                    Clear
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.chipContainer}>
                {recentSearches.map((query, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() => handleRecentSearch(query)}
                  >
                    <Text style={[styles.chipText, { color: theme.text }]}>
                      {query}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeRecentSearch(query)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <X color={theme.textSecondary} size={14} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text
                style={[styles.loadingText, { color: theme.textSecondary }]}
              >
                Searching...
              </Text>
            </View>
          ) : searchResults.length > 0 ? (
            <>
              <Text
                style={[styles.resultsCount, { color: theme.textSecondary }]}
              >
                Found {searchResults.length} results
              </Text>
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item, index) =>
                  `${item.type}-${item.id}-${index}`
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.resultsList}
              />
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Search color={theme.textTertiary} size={64} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No results found
              </Text>
              <Text
                style={[styles.emptySubtitle, { color: theme.textSecondary }]}
              >
                Try searching with different keywords
              </Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.base,
    fontFamily: 'Inter-Regular',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-SemiBold',
  },
  clearText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: spacing.sm,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsCount: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  resultsList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  resultCard: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  resultImage: {
    width: 120,
    height: '100%',
  },
  resultContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  resultTitle: {
    fontSize: fontSize.base,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    marginBottom: spacing.sm,
  },
  resultMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultRatingText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-SemiBold',
  },
  resultPrice: {
    fontSize: fontSize.base,
    fontFamily: 'Inter-Bold',
  },
  resultDelivery: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.base,
    fontFamily: 'Inter-Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontFamily: 'Inter-SemiBold',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSize.base,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});
