import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { FavoriteItem, Item, Offer } from '@/types/appTypes';

const FAVORITES_STORAGE_KEY = '@favorites_storage';

interface FavoritesState {
  favorites: FavoriteItem[];
  isLoading: boolean;
  isNewFavoritedAdded: boolean;
  setIsNewFavoritedAdded: (value: boolean) => void;
  addToFavorites: (offer: Offer, enablePriceAlert?: boolean) => Promise<void>;
  removeFromFavorites: (offerId: string) => Promise<void>;
  togglePriceAlert: (favoriteId: string) => Promise<void>;
  isFavorite: (offerId: string) => boolean;
  checkPriceDrops: () => FavoriteItem[];
  loadFavorites: () => Promise<void>;
  clearFavorites: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  isLoading: false,
  isNewFavoritedAdded: false,
  setIsNewFavoritedAdded: (value: boolean) =>
    set({ isNewFavoritedAdded: value }),
  loadFavorites: async () => {
    try {
      set({ isLoading: true });
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const favorites = JSON.parse(stored);
        set({ favorites, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      set({ isLoading: false });
    }
  },

  addToFavorites: async (offer, enablePriceAlert = false) => {
    set({ isLoading: true });
    const { favorites } = get();
    const existing = favorites.find((fav) => fav.favorited.id === offer.id);

    if (existing) {
      set({ isLoading: false });
      return;
    }

    const newFavorite: FavoriteItem = {
      id: `fav_${offer.id}_${Date.now()}`,
      favorited: offer,
      added_at: new Date().toISOString(),
      price_alert_enabled: enablePriceAlert,
      original_price_tracked:
        offer.discounted_price || offer.original_price || 0,
    };

    const updated = [...favorites, newFavorite];
    set({ favorites: updated });
    set({ isNewFavoritedAdded: true });

    try {
      await AsyncStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error('Error saving favorites:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  removeFromFavorites: async (offerId) => {
    const { favorites } = get();
    const updated = favorites.filter((fav) => fav.favorited.id !== offerId);
    set({ favorites: updated });

    try {
      await AsyncStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  },

  togglePriceAlert: async (favoriteId) => {
    const { favorites } = get();
    const updated = favorites.map((fav) =>
      fav.id === favoriteId
        ? { ...fav, price_alert_enabled: !fav.price_alert_enabled }
        : fav
    );
    set({ favorites: updated });

    try {
      await AsyncStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error('Error toggling price alert:', error);
    }
  },

  isFavorite: (offerId) => {
    const { favorites } = get();
    return favorites.some((fav) => fav.favorited.id === offerId);
  },

  checkPriceDrops: () => {
    const { favorites } = get();
    return favorites.filter(
      (fav) =>
        fav.price_alert_enabled &&
        fav.favorited.discounted_price < fav.original_price_tracked
    );
  },

  clearFavorites: async () => {
    set({ favorites: [] });
    try {
      await AsyncStorage.removeItem(FAVORITES_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing favorites:', error);
    }
  },
}));
