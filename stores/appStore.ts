import { CartItem, Category, Offer, Restaurant } from '@/types/appTypes';
import { categoriesApi, itemsApi } from '@/api';
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_STORAGE_KEY = '@cart_storage';

interface AppState {
  offers: Offer[];
  categories: Category[];
  restaurants: Restaurant[];
  cart: CartItem[];
  selectedCategory: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setOffers: (offers: Offer[]) => void;
  setCategories: (categories: Category[]) => void;
  setRestaurants: (restaurants: Restaurant[]) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API Actions
  fetchCategories: () => Promise<void>;
  fetchOffers: () => Promise<void>;
  refreshData: () => Promise<void>;

  // Cart Actions
  addToCart: (offer: Offer, quantity?: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

export const useAppStore = create<AppState>()((set, get) => ({
  offers: [],
  categories: [],
  restaurants: [],
  cart: [],
  selectedCategory: null,
  isLoading: false,
  error: null,

  setOffers: (offers) => set({ offers }),
  setCategories: (categories) => set({ categories }),
  setRestaurants: (restaurants) => set({ restaurants }),
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoriesApi.getCategories();
      if (response.success && response.data) {
        set({ categories: response.data, isLoading: false });
      } else {
        set({
          error: response.error || 'Failed to fetch categories',
          isLoading: false,
        });
      }
    } catch (error) {
      set({ error: 'Network error occurred', isLoading: false });
    }
  },

  fetchOffers: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, you'd have an offers API
      // For now, we'll use the dummy data
      const { dummyOffers } = await import('@/data/dummyData');
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
      set({ offers: dummyOffers, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch offers', isLoading: false });
    }
  },

  refreshData: async () => {
    const { fetchCategories, fetchOffers } = get();
    await Promise.all([fetchCategories(), fetchOffers()]);
  },

  addToCart: async (offer, quantity = 1) => {
    const { cart } = get();
    const existingItem = cart.find((item) => item.offer.id === offer.id);

    if (existingItem) {
      set({
        cart: cart.map((item) =>
          item.offer.id === offer.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      });
    } else {
      set({
        cart: [
          ...cart,
          {
            id: `${offer.id}-${Date.now()}`,
            offer,
            quantity,
          },
        ],
      });
    }
  },

  updateCartItem: async (itemId, quantity) => {
    const { cart } = get();
    if (quantity <= 0) {
      set({ cart: cart.filter((item) => item.id !== itemId) });
    } else {
      set({
        cart: cart.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        ),
      });
    }
  },

  removeFromCart: async (itemId) => {
    const { cart } = get();
    set({ cart: cart.filter((item) => item.id !== itemId) });
  },

  clearCart: async () => {
    set({ cart: [] });
    try {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  },

  getCartTotal: () => {
    const { cart } = get();
    return cart.reduce(
      (total, item) => total + item.offer.discounted_price * item.quantity,
      0
    );
  },

  getCartItemCount: () => {
    const { cart } = get();
    return cart.reduce((count, item) => count + item.quantity, 0);
  },
}));
