import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { SearchHistory } from '@/types/appTypes';

const SEARCH_HISTORY_STORAGE_KEY = '@search_history_storage';
const MAX_HISTORY_ITEMS = 20;

interface SearchHistoryState {
  searchHistory: SearchHistory[];
  trendingSearches: string[];
  isLoading: boolean;

  loadSearchHistory: () => Promise<void>;
  addSearchQuery: (query: string) => Promise<void>;
  clearSearchHistory: () => Promise<void>;
  removeSearchQuery: (id: string) => Promise<void>;
  loadTrendingSearches: () => Promise<void>;
}

export const useSearchHistoryStore = create<SearchHistoryState>((set, get) => ({
  searchHistory: [],
  trendingSearches: [],
  isLoading: false,

  loadSearchHistory: async () => {
    try {
      set({ isLoading: true });
      const stored = await AsyncStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
      if (stored) {
        set({ searchHistory: JSON.parse(stored), isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading search history:', error);
      set({ isLoading: false });
    }
  },

  addSearchQuery: async (query) => {
    if (!query.trim()) return;

    const { searchHistory } = get();
    const filtered = searchHistory.filter(
      (item) => item.query.toLowerCase() !== query.toLowerCase()
    );

    const newItem: SearchHistory = {
      id: `search_${Date.now()}`,
      query: query.trim(),
      searched_at: new Date().toISOString(),
    };

    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    set({ searchHistory: updated });

    try {
      await AsyncStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving search query:', error);
    }
  },

  removeSearchQuery: async (id) => {
    const { searchHistory } = get();
    const updated = searchHistory.filter((item) => item.id !== id);
    set({ searchHistory: updated });

    try {
      await AsyncStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error removing search query:', error);
    }
  },

  clearSearchHistory: async () => {
    set({ searchHistory: [] });
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  },

  loadTrendingSearches: async () => {
    const trending = [
      'Pizza',
      'Burger',
      'Sushi',
      'Pasta',
      'Salad',
      'Dessert',
      'Coffee',
      'Healthy',
    ];
    set({ trendingSearches: trending });
  },
}));
