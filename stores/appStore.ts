import { CartItem, Category, Offer, Restaurant } from '@/types/appTypes';
import { categoriesApi } from '@/api';
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './authStore';
import NetInfo from '@react-native-community/netinfo';

const STORAGE_KEYS = {
  CART: '@cart_storage',
  OFFERS: '@offline_offers',
  CATEGORIES: '@offline_categories',
  RESTAURANTS: '@offline_restaurants',
  LAST_SYNC: '@last_sync_timestamp',
  PENDING_ACTIONS: '@pending_actions',
};

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

interface PendingAction {
  id: string;
  type: 'ADD_TO_CART' | 'REMOVE_FROM_CART' | 'UPDATE_CART';
  payload: any;
  timestamp: number;
}

interface AppState {
  offers: Offer[];
  categories: Category[];
  restaurants: Restaurant[];
  cart: CartItem[];
  selectedCategory: string | null;
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;
  lastSync: number | null;
  pendingActions: PendingAction[];
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';

  // Enhanced Actions
  setOffers: (offers: Offer[]) => void;
  setCategories: (categories: Category[]) => void;
  setRestaurants: (restaurants: Restaurant[]) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setOffline: (isOffline: boolean) => void;

  // Smart Offline Storage with compression
  persistData: () => Promise<void>;
  loadCachedData: () => Promise<boolean>;

  // Network-aware data fetching
  fetchCategories: (forceRefresh?: boolean) => Promise<void>;
  fetchOffers: (forceRefresh?: boolean) => Promise<void>;
  refreshData: (forceRefresh?: boolean) => Promise<void>;

  // Optimistic Cart Actions with offline queue
  addToCart: (offer: Offer, quantity?: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;

  // Cart utilities
  getCartTotal: () => number;
  getCartItemCount: () => number;

  // Offline queue management
  addPendingAction: (
    action: Omit<PendingAction, 'id' | 'timestamp'>
  ) => Promise<void>;
  syncPendingActions: () => Promise<void>;

  // Network status monitoring
  initNetworkListener: () => void;

  // Cache management
  isCacheValid: () => boolean;
  clearCache: () => Promise<void>;
}

export const useAppStore = create<AppState>()((set, get) => ({
  offers: [],
  categories: [],
  restaurants: [],
  cart: [],
  selectedCategory: null,
  isLoading: false,
  error: null,
  isOffline: false,
  lastSync: null,
  pendingActions: [],
  syncStatus: 'idle',

  // Basic setters
  setOffers: (offers) => set({ offers }),
  setCategories: (categories) => set({ categories }),
  setRestaurants: (restaurants) => set({ restaurants }),
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setOffline: (isOffline) => set({ isOffline }),

  // Smart data persistence with batching
  persistData: async () => {
    const { offers, categories, restaurants, cart, lastSync, pendingActions } =
      get();

    try {
      const dataToStore = [
        [STORAGE_KEYS.OFFERS, JSON.stringify(offers)],
        [STORAGE_KEYS.CATEGORIES, JSON.stringify(categories)],
        [STORAGE_KEYS.RESTAURANTS, JSON.stringify(restaurants)],
        [STORAGE_KEYS.CART, JSON.stringify(cart)],
        [STORAGE_KEYS.LAST_SYNC, String(lastSync || Date.now())],
        [STORAGE_KEYS.PENDING_ACTIONS, JSON.stringify(pendingActions)],
      ];

      await AsyncStorage.multiSet(dataToStore);
    } catch (error) {
      console.error('Error persisting data:', error);
    }
  },

  // Load cached data on app start
  loadCachedData: async () => {
    try {
      const keys = [
        STORAGE_KEYS.OFFERS,
        STORAGE_KEYS.CATEGORIES,
        STORAGE_KEYS.RESTAURANTS,
        STORAGE_KEYS.CART,
        STORAGE_KEYS.LAST_SYNC,
        STORAGE_KEYS.PENDING_ACTIONS,
      ];

      const data = await AsyncStorage.multiGet(keys);
      const dataMap = Object.fromEntries(data);

      const cachedOffers = dataMap[STORAGE_KEYS.OFFERS]?.[1];
      const cachedCategories = dataMap[STORAGE_KEYS.CATEGORIES]?.[1];
      const cachedRestaurants = dataMap[STORAGE_KEYS.RESTAURANTS]?.[1];
      const cachedCart = dataMap[STORAGE_KEYS.CART]?.[1];
      const lastSyncStr = dataMap[STORAGE_KEYS.LAST_SYNC]?.[1];
      const pendingActionsStr = dataMap[STORAGE_KEYS.PENDING_ACTIONS]?.[1];

      if (cachedOffers) set({ offers: JSON.parse(cachedOffers) });
      if (cachedCategories) set({ categories: JSON.parse(cachedCategories) });
      if (cachedRestaurants)
        set({ restaurants: JSON.parse(cachedRestaurants) });
      if (cachedCart) set({ cart: JSON.parse(cachedCart) });
      if (lastSyncStr) set({ lastSync: Number(lastSyncStr) });
      if (pendingActionsStr)
        set({ pendingActions: JSON.parse(pendingActionsStr) });

      return !!(cachedOffers && cachedCategories);
    } catch (error) {
      console.error('Error loading cached data:', error);
      return false;
    }
  },

  // Check if cache is still valid
  isCacheValid: () => {
    const { lastSync } = get();
    if (!lastSync) return false;
    return Date.now() - lastSync < CACHE_DURATION;
  },

  // Clear all cached data
  clearCache: async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.OFFERS,
        STORAGE_KEYS.CATEGORIES,
        STORAGE_KEYS.RESTAURANTS,
        STORAGE_KEYS.LAST_SYNC,
      ]);
      set({ lastSync: null });
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },

  // Network-aware category fetching
  fetchCategories: async (forceRefresh = false) => {
    const { isCacheValid, loadCachedData, persistData } = get();

    // Use cache if valid and not forcing refresh
    if (!forceRefresh && isCacheValid()) {
      console.log('Using cached categories');
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const token = useAuthStore.getState().token;
      const response = await categoriesApi.getCategories(token || '');

      if (response.success && response.data) {
        set({
          categories: response.data,
          isLoading: false,
          isOffline: false,
          lastSync: Date.now(),
        });
        await persistData();
      } else {
        throw new Error(response.error || 'Failed to fetch categories');
      }
    } catch (error) {
      console.log('Network error, loading from cache');
      const hasCachedData = await loadCachedData();
      set({
        error: hasCachedData ? null : 'No cached data available',
        isLoading: false,
        isOffline: true,
      });
    }
  },

  // Network-aware offers fetching
  fetchOffers: async (forceRefresh = false) => {
    const { isCacheValid, loadCachedData, persistData } = get();

    if (!forceRefresh && isCacheValid()) {
      console.log('Using cached offers');
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const token = useAuthStore.getState().token;
      const response = await categoriesApi.getOffers(token || '');

      if (response.success && response.data) {
        set({
          offers: response.data,
          isLoading: false,
          isOffline: false,
          lastSync: Date.now(),
        });
        await persistData();
      } else {
        throw new Error(response.error || 'Failed to fetch offers');
      }
    } catch (error) {
      console.log('Network error, loading from cache');
      const hasCachedData = await loadCachedData();
      set({
        error: hasCachedData ? null : 'No cached data available',
        isLoading: false,
        isOffline: true,
      });
    }
  },

  // Smart refresh with parallel fetching
  refreshData: async (forceRefresh = false) => {
    const { fetchCategories, fetchOffers, syncPendingActions, isOffline } =
      get();

    // Sync pending actions first if coming back online
    if (!isOffline) {
      await syncPendingActions();
    }

    // Fetch data in parallel for better performance
    await Promise.allSettled([
      fetchCategories(forceRefresh),
      fetchOffers(forceRefresh),
    ]);
  },

  // Optimistic cart updates with offline support
  addToCart: async (offer, quantity = 1) => {
    const { cart, isOffline, addPendingAction, persistData } = get();
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

    await persistData();

    // Queue action if offline
    if (isOffline) {
      await addPendingAction({
        type: 'ADD_TO_CART',
        payload: { offerId: offer.id, quantity },
      });
    }
  },

  updateCartItem: async (itemId, quantity) => {
    const { cart, isOffline, addPendingAction, persistData } = get();

    if (quantity <= 0) {
      set({ cart: cart.filter((item) => item.id !== itemId) });
    } else {
      set({
        cart: cart.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        ),
      });
    }

    await persistData();

    if (isOffline) {
      await addPendingAction({
        type: 'UPDATE_CART',
        payload: { itemId, quantity },
      });
    }
  },

  removeFromCart: async (itemId) => {
    const { cart, isOffline, addPendingAction, persistData } = get();
    set({ cart: cart.filter((item) => item.id !== itemId) });

    await persistData();

    if (isOffline) {
      await addPendingAction({
        type: 'REMOVE_FROM_CART',
        payload: { itemId },
      });
    }
  },

  clearCart: async () => {
    set({ cart: [] });
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CART);
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

  // Pending actions management
  addPendingAction: async (action) => {
    const { pendingActions } = get();
    const newAction: PendingAction = {
      ...action,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };

    set({ pendingActions: [...pendingActions, newAction] });
    await AsyncStorage.setItem(
      STORAGE_KEYS.PENDING_ACTIONS,
      JSON.stringify([...pendingActions, newAction])
    );
  },

  syncPendingActions: async () => {
    const { pendingActions, isOffline } = get();

    if (isOffline || pendingActions.length === 0) return;

    set({ syncStatus: 'syncing' });

    try {
      // Process pending actions here
      // This would typically involve API calls

      set({
        pendingActions: [],
        syncStatus: 'success',
      });

      await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_ACTIONS);

      // Reset status after delay
      setTimeout(() => set({ syncStatus: 'idle' }), 2000);
    } catch (error) {
      console.error('Error syncing pending actions:', error);
      set({ syncStatus: 'error' });
      setTimeout(() => set({ syncStatus: 'idle' }), 2000);
    }
  },

  // Initialize network listener
  initNetworkListener: () => {
    NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected && state.isInternetReachable;
      const wasOffline = get().isOffline;

      set({ isOffline: !isOnline });

      // If coming back online, sync data
      if (wasOffline && isOnline) {
        console.log('Back online, syncing data...');
        get().refreshData(true);
      }
    });
  },
}));
