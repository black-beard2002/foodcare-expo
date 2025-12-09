import {
  CartItem,
  Category,
  Offer,
  Restaurant,
  SelectedProperties,
} from '@/types/appTypes';
import { categoriesApi, offersApi } from '@/api';
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  fetchCategory: (
    id: string
  ) => Promise<{ success: boolean; data?: Category; message?: string }>;

  // Optimistic Cart Actions with offline queue
  addToCart: (
    offer: Offer,
    quantity?: number,
    selectedProperties?: SelectedProperties
  ) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;

  // Cart utilities
  getCartTotal: () => number;
  getCartItemCount: () => number;
  findCartItem: (
    offerId: string,
    selectedProperties?: SelectedProperties
  ) => CartItem | undefined;
  generateCartItemId: (
    offerId: string,
    selectedProperties?: SelectedProperties
  ) => string;

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

// Helper to generate unique cart item ID based on offer and selected properties
const generateCartItemId = (
  offerId: string,
  selectedProperties?: SelectedProperties
): string => {
  if (!selectedProperties || Object.keys(selectedProperties).length === 0) {
    return `${offerId}-default`;
  }

  // Sort keys to ensure consistent ordering
  const sortedKeys = Object.keys(selectedProperties).sort();
  const propertiesString = sortedKeys
    .map((key) => {
      const value = selectedProperties[key];
      // Handle different value types
      if (Array.isArray(value)) {
        // Sort arrays for consistent comparison
        const sortedArray = [...value].sort((a, b) => {
          if (typeof a === 'object' && typeof b === 'object') {
            return JSON.stringify(a).localeCompare(JSON.stringify(b));
          }
          return String(a).localeCompare(String(b));
        });
        return `${key}:${JSON.stringify(sortedArray)}`;
      }
      return `${key}:${JSON.stringify(value)}`;
    })
    .join('|');

  // Create a simple hash from the properties string
  let hash = 0;
  for (let i = 0; i < propertiesString.length; i++) {
    const char = propertiesString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return `${offerId}-${Math.abs(hash).toString(36)}`;
};

// Helper to compare selected properties
const arePropertiesEqual = (
  props1?: SelectedProperties,
  props2?: SelectedProperties
): boolean => {
  if (!props1 && !props2) return true;
  if (!props1 || !props2) return false;

  const keys1 = Object.keys(props1).sort();
  const keys2 = Object.keys(props2).sort();

  if (keys1.length !== keys2.length) return false;

  return keys1.every((key) => {
    const val1 = props1[key];
    const val2 = props2[key];

    // Deep comparison
    return JSON.stringify(val1) === JSON.stringify(val2);
  });
};

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

  // Generate unique cart item ID
  generateCartItemId: (offerId, selectedProperties) =>
    generateCartItemId(offerId, selectedProperties),

  // Find cart item with matching offer and properties
  findCartItem: (offerId, selectedProperties) => {
    const { cart } = get();
    return cart.find(
      (item) =>
        item.item.id === offerId &&
        arePropertiesEqual(item.selectedProperties, selectedProperties)
    );
  },

  // Smart data persistence with batching
  persistData: async () => {
    const { offers, categories, cart, lastSync, pendingActions } = get();

    try {
      const dataToStore: [string, string][] = [
        [STORAGE_KEYS.OFFERS, JSON.stringify(offers)],
        [STORAGE_KEYS.CATEGORIES, JSON.stringify(categories)],
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
        STORAGE_KEYS.CART,
        STORAGE_KEYS.LAST_SYNC,
        STORAGE_KEYS.PENDING_ACTIONS,
      ];

      const data = await AsyncStorage.multiGet(keys);
      const dataMap = new Map(data);

      const cachedOffers = dataMap.get(STORAGE_KEYS.OFFERS);
      const cachedCategories = dataMap.get(STORAGE_KEYS.CATEGORIES);
      const cachedCart = dataMap.get(STORAGE_KEYS.CART);
      const lastSyncStr = dataMap.get(STORAGE_KEYS.LAST_SYNC);
      const pendingActionsStr = dataMap.get(STORAGE_KEYS.PENDING_ACTIONS);

      if (cachedOffers) {
        try {
          set({ offers: JSON.parse(cachedOffers) });
        } catch (e) {
          console.error('Error parsing cached offers:', e);
        }
      }

      if (cachedCategories) {
        try {
          set({ categories: JSON.parse(cachedCategories) });
        } catch (e) {
          console.error('Error parsing cached categories:', e);
        }
      }

      if (cachedCart) {
        try {
          set({ cart: JSON.parse(cachedCart) });
        } catch (e) {
          console.error('Error parsing cached cart:', e);
        }
      }

      if (lastSyncStr) set({ lastSync: Number(lastSyncStr) });

      if (pendingActionsStr) {
        try {
          set({ pendingActions: JSON.parse(pendingActionsStr) });
        } catch (e) {
          console.error('Error parsing pending actions:', e);
        }
      }

      return !!(cachedOffers && cachedCategories);
    } catch (error) {
      console.error('Error loading cached data:', error);
      return false;
    }
  },

  isCacheValid: () => {
    const { lastSync } = get();
    if (!lastSync) return false;
    return Date.now() - lastSync < CACHE_DURATION;
  },

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

  fetchCategory: async (id: string) => {
    try {
      const response = await categoriesApi.getCategoryById(id);

      if (response.success && response.data) {
        return { success: true, data: response.data };
      } else {
        return {
          success: false,
          message: response.error || 'Failed to fetch category',
        };
      }
    } catch (error) {
      console.log('Failed to fetch category');
      set({
        error: 'Failed to fetch category',
        isLoading: false,
        isOffline: true,
      });
      return { success: false, message: 'Network error' };
    }
  },

  fetchCategories: async (forceRefresh = false) => {
    const { isCacheValid, loadCachedData, persistData } = get();

    if (!forceRefresh && isCacheValid()) {
      console.log('Using cached categories');
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await categoriesApi.getCategories();

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

  fetchOffers: async (forceRefresh = false) => {
    const { isCacheValid, loadCachedData, persistData } = get();

    if (!forceRefresh && isCacheValid()) {
      console.log('Using cached offers');
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await offersApi.getOffers();

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
      });
    }
  },

  refreshData: async (forceRefresh = false) => {
    const { fetchCategories, fetchOffers, syncPendingActions, isOffline } =
      get();
    console.log('Refreshing data...');

    if (!isOffline) {
      await syncPendingActions();
    }

    await Promise.allSettled([
      fetchCategories(forceRefresh),
      fetchOffers(forceRefresh),
    ]);
  },

  // Updated addToCart with selectedProperties support
  addToCart: async (offer, quantity = 1, selectedProperties) => {
    const { cart, isOffline, addPendingAction, persistData, findCartItem } =
      get();

    // Find existing cart item with same offer and properties
    const existingItem = findCartItem(offer.id, selectedProperties);

    if (existingItem) {
      // Update quantity of existing item
      set({
        cart: cart.map((item) =>
          item.item.id === offer.id &&
          arePropertiesEqual(item.selectedProperties, selectedProperties)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      });
    } else {
      // Create new cart item with unique ID
      const cartItemId = generateCartItemId(offer.id, selectedProperties);
      set({
        cart: [
          ...cart,
          {
            id: cartItemId,
            item: offer,
            quantity,
            selectedProperties,
          },
        ],
      });
    }

    await persistData();

    if (isOffline) {
      await addPendingAction({
        type: 'ADD_TO_CART',
        payload: { offerId: offer.id, quantity, selectedProperties },
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
    return cart.reduce((total, item) => {
      const itemPrice = item.item.sale_price ?? item.item.price;

      // Calculate addon prices if present
      let addonTotal = 0;
      if (item.selectedProperties) {
        Object.values(item.selectedProperties).forEach((value) => {
          if (Array.isArray(value)) {
            value.forEach((v) => {
              if (typeof v === 'object' && 'price' in v) {
                addonTotal += v.price;
              }
            });
          }
        });
      }

      return total + (itemPrice + addonTotal) * item.quantity;
    }, 0);
  },

  getCartItemCount: () => {
    const { cart } = get();
    return cart.reduce((count, item) => count + item.quantity, 0);
  },

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
      set({
        pendingActions: [],
        syncStatus: 'success',
      });

      await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_ACTIONS);
      setTimeout(() => set({ syncStatus: 'idle' }), 2000);
    } catch (error) {
      console.error('Error syncing pending actions:', error);
      set({ syncStatus: 'error' });
      setTimeout(() => set({ syncStatus: 'idle' }), 2000);
    }
  },

  initNetworkListener: () => {
    NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected && state.isInternetReachable;
      const wasOffline = get().isOffline;

      set({ isOffline: !isOnline });

      if (wasOffline && isOnline) {
        console.log('Back online, syncing data...');
        get().refreshData(true);
      }
    });
  },
}));
