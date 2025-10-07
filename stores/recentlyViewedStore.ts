import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { RecentlyViewedItem, Offer } from '@/types/appTypes';

const RECENTLY_VIEWED_STORAGE_KEY = '@recently_viewed_storage';
const MAX_RECENTLY_VIEWED = 10;

interface RecentlyViewedState {
  recentlyViewed: RecentlyViewedItem[];
  isLoading: boolean;

  addToRecentlyViewed: (offer: Offer) => Promise<void>;
  clearRecentlyViewed: () => Promise<void>;
  loadRecentlyViewed: () => Promise<void>;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>(
  (set, get) => ({
    recentlyViewed: [],
    isLoading: false,

    loadRecentlyViewed: async () => {
      try {
        set({ isLoading: true });
        const stored = await AsyncStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
        if (stored) {
          const recentlyViewed = JSON.parse(stored);
          set({ recentlyViewed, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      } catch (error) {
        console.error('Error loading recently viewed:', error);
        set({ isLoading: false });
      }
    },

    addToRecentlyViewed: async (offer) => {
      const { recentlyViewed } = get();

      const filtered = recentlyViewed.filter(
        (item) => item.offer.id !== offer.id
      );

      const newItem: RecentlyViewedItem = {
        id: `recent_${offer.id}_${Date.now()}`,
        offer,
        viewed_at: new Date().toISOString(),
      };

      const updated = [newItem, ...filtered].slice(0, MAX_RECENTLY_VIEWED);
      set({ recentlyViewed: updated });

      try {
        await AsyncStorage.setItem(
          RECENTLY_VIEWED_STORAGE_KEY,
          JSON.stringify(updated)
        );
      } catch (error) {
        console.error('Error saving recently viewed:', error);
      }
    },

    clearRecentlyViewed: async () => {
      set({ recentlyViewed: [] });
      try {
        await AsyncStorage.removeItem(RECENTLY_VIEWED_STORAGE_KEY);
      } catch (error) {
        console.error('Error clearing recently viewed:', error);
      }
    },
  })
);
