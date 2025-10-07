import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Search,
  X,
  Clock,
  Star,
  ChefHat,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/stores/appStore';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { useSearchHistoryStore } from '@/stores/searchHistoryStore';
import { SearchHistory } from '@/types/appTypes';

export default function SearchScreen() {
  const { theme } = useTheme();
  const { offers, restaurants } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { clearRecentlyViewed, recentlyViewed } = useRecentlyViewedStore();
  const {
    addSearchQuery,
    clearSearchHistory,
    loadSearchHistory,
    loadTrendingSearches,
    removeSearchQuery,
    searchHistory,
    trendingSearches,
  } = useSearchHistoryStore();
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] =
    useState<SearchHistory[]>(searchHistory);

  const performSearch = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);

      setTimeout(() => {
        const lowerQuery = query.toLowerCase();

        const recentResults = offers
          .filter(
            (recent: any) =>
              recent.title.toLowerCase().includes(lowerQuery) ||
              recent.description.toLowerCase().includes(lowerQuery) ||
              recent.restaurant.name.toLowerCase().includes(lowerQuery)
          )
          .map((recent: any) => ({ ...recent, type: 'recent' }));

        const restaurantResults = restaurants
          .filter(
            (restaurant: any) =>
              restaurant.name.toLowerCase().includes(lowerQuery) ||
              restaurant.cuisine.toLowerCase().includes(lowerQuery)
          )
          .map((restaurant: any) => ({ ...restaurant, type: 'restaurant' }));

        setSearchResults([...recentResults, ...restaurantResults]);
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
    performSearch(query);
    addSearchQuery(query);
    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (item) => item.query.toLowerCase() !== query.toLowerCase()
      );
      const newItem: SearchHistory = {
        id: `search_${Date.now()}`,
        query: query.trim(),
        searched_at: new Date().toISOString(),
      };
      return [newItem, ...filtered].slice(0, 10);
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const removeRecentSearch = (id: string) => {
    removeSearchQuery(id);
    const query = recentSearches.find((item) => item.id === id)?.query;
    setRecentSearches((prev) =>
      prev.filter((item) => item.query.toLowerCase() !== query?.toLowerCase())
    );
  };

  const renderSearchResult = ({ item }: { item: any }) => {
    if (item.type === 'recent') {
      return (
        <TouchableOpacity
          className="flex-row rounded-lg border mb-3 overflow-hidden"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
          onPress={() =>
            router.push(`/(in_app_screens)/offer-details?id=${item.id}`)
          }
        >
          <Image source={item.image_url} className="w-[120px] h-full" />
          <View className="flex-1 p-3 justify-between">
            <Text
              className="text-base font-semibold mb-1"
              style={{ color: theme.text }}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text
              className="text-sm mb-2"
              style={{ color: theme.textSecondary }}
            >
              {item.restaurant.name}
            </Text>
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-1">
                <Star color="#F59E0B" size={12} fill="#F59E0B" />
                <Text
                  className="text-sm font-semibold"
                  style={{ color: theme.text }}
                >
                  {item.rating}
                </Text>
              </View>
              <Text
                className="text-base font-bold"
                style={{ color: theme.primary }}
              >
                ${item.discounted_price.toFixed(2)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        className="flex-row rounded-lg border mb-3 overflow-hidden"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}
      >
        <Image source={item.image_url} className="w-[120px] h-full" />
        <View className="flex-1 p-3 justify-between">
          <Text
            className="text-base font-semibold mb-1"
            style={{ color: theme.text }}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text className="text-sm mb-2" style={{ color: theme.textSecondary }}>
            {item.cuisine}
          </Text>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-1">
              <Star color="#F59E0B" size={12} fill="#F59E0B" />
              <Text
                className="text-sm font-semibold"
                style={{ color: theme.text }}
              >
                {item.rating}
              </Text>
            </View>
            <Text className="text-sm" style={{ color: theme.textSecondary }}>
              {item.delivery_time}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-4 gap-4 border-b"
        style={{ borderBottomColor: theme.border }}
      >
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ArrowLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <View
          className="flex-1 flex-row items-center px-4 py-2 rounded-lg border gap-2"
          style={{
            backgroundColor: theme.inputBackground,
            borderColor: theme.border,
          }}
        >
          <Search color={theme.textSecondary} size={20} />
          <TextInput
            className="flex-1 text-base"
            style={{ color: theme.text }}
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
        <View className="flex-1">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View className="py-4 px-4">
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center gap-2">
                  <Clock color={theme.textSecondary} size={18} />
                  <Text
                    className="text-lg font-semibold"
                    style={{ color: theme.text }}
                  >
                    Recent Searches
                  </Text>
                </View>
                <TouchableOpacity onPress={clearRecentSearches}>
                  <Text
                    className="text-sm font-medium"
                    style={{ color: theme.primary }}
                  >
                    Clear
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {recentSearches.map((query, index) => (
                  <TouchableOpacity
                    key={index}
                    className="flex-row items-center px-4 py-2 rounded-full border gap-2"
                    style={{
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                    }}
                    onPress={() => handleRecentSearch(query.query)}
                  >
                    <Text
                      className="text-sm font-medium"
                      style={{ color: theme.text }}
                    >
                      {query.query}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeRecentSearch(query.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <X color={theme.textSecondary} size={14} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Recent Views */}
          {recentlyViewed.length > 0 && (
            <View className="py-4 px-4">
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center gap-2">
                  <Clock color={theme.textSecondary} size={18} />
                  <Text
                    className="text-lg font-semibold"
                    style={{ color: theme.text }}
                  >
                    Recent Views
                  </Text>
                  <Text
                    className="text-sm"
                    style={{ color: theme.textSecondary }}
                  >
                    ({recentlyViewed.length})
                  </Text>
                </View>
                <TouchableOpacity onPress={clearRecentlyViewed}>
                  <Text
                    className="text-sm font-medium"
                    style={{ color: theme.primary }}
                  >
                    Clear
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {recentlyViewed.map((recent) => (
                  <TouchableOpacity
                    key={recent.id}
                    className="flex-row items-center pr-2 rounded-full border gap-2"
                    style={{
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                    }}
                    onPress={() =>
                      router.push(
                        `/(in_app_screens)/offer-details?id=${recent.offer.id}`
                      )
                    }
                  >
                    <Image
                      source={recent.offer.image_url}
                      className="w-14 h-14 rounded-full"
                    />
                    <View>
                      <Text
                        className="text-sm font-medium"
                        style={{ color: theme.text }}
                      >
                        {recent.offer.title}
                      </Text>
                      <View className="flex-row items-center gap-1">
                        <ChefHat size={12} color={theme.text} />
                        <Text
                          className="text-xs"
                          style={{ color: theme.textSecondary }}
                        >
                          {recent.offer.restaurant.name}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      ) : (
        <View className="flex-1">
          {isSearching ? (
            <View className="flex-1 justify-center items-center gap-4">
              <ActivityIndicator size="large" color={theme.primary} />
              <Text
                className="text-base"
                style={{ color: theme.textSecondary }}
              >
                Searching...
              </Text>
            </View>
          ) : searchResults.length > 0 ? (
            <>
              <Text
                className="text-sm px-4 pt-3 pb-2"
                style={{ color: theme.textSecondary }}
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
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingBottom: 24,
                }}
              />
            </>
          ) : (
            <View className="flex-1 justify-center items-center px-6">
              <Search color={theme.textTertiary} size={64} />
              <Text
                className="text-xl font-semibold mt-4 mb-2"
                style={{ color: theme.text }}
              >
                No results found
              </Text>
              <Text
                className="text-base text-center"
                style={{ color: theme.textSecondary }}
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
