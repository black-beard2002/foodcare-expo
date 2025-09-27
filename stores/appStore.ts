import { create } from 'zustand';

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image_url: string;
  rating: number;
  delivery_time: string;
  delivery_fee: number;
  minimum_order: number;
  cuisine_type: string;
  address: string;
  phone: string;
  is_open: boolean;
  opening_hours: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
  icon: string;
  color: string;
  created_at: string;
}

export interface Item {
  id: string;
  offer_id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  category: string;
  ingredients: string[];
  allergens: string[];
  calories: number;
  prep_time: number;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  spice_level: 'mild' | 'medium' | 'hot' | 'very_hot';
  nutrition_facts: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  created_at: string;
}

export interface Offer {
  id: string;
  restaurant_id: string;
  restaurant: Restaurant;
  title: string;
  description: string;
  image_url: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  category_id: string;
  category: Category;
  items: Item[];
  rating: number;
  review_count: number;
  tags: string[];
  is_featured: boolean;
  is_available: boolean;
  expires_at: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  offer: Offer;
  quantity: number;
  customizations?: string[];
  special_instructions?: string;
}

interface AppState {
  offers: Offer[];
  categories: Category[];
  restaurants: Restaurant[];
  cart: CartItem[];
  selectedCategory: string | null;
  isLoading: boolean;
  setOffers: (offers: Offer[]) => void;
  setCategories: (categories: Category[]) => void;
  setRestaurants: (restaurants: Restaurant[]) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  setLoading: (loading: boolean) => void;
  addToCart: (offer: Offer, quantity?: number) => void;
  updateCartItem: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
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
  setOffers: (offers) => set({ offers }),
  setCategories: (categories) => set({ categories }),
  setRestaurants: (restaurants) => set({ restaurants }),
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
  setLoading: (loading) => set({ isLoading: loading }),
  addToCart: (offer, quantity = 1) => {
    const { cart } = get();
    const existingItem = cart.find(item => item.offer.id === offer.id);
    
    if (existingItem) {
      set({
        cart: cart.map(item =>
          item.offer.id === offer.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      });
    } else {
      set({
        cart: [...cart, {
          id: `${offer.id}-${Date.now()}`,
          offer,
          quantity,
        }],
      });
    }
  },
  updateCartItem: (itemId, quantity) => {
    const { cart } = get();
    if (quantity <= 0) {
      set({ cart: cart.filter(item => item.id !== itemId) });
    } else {
      set({
        cart: cart.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        ),
      });
    }
  },
  removeFromCart: (itemId) => {
    const { cart } = get();
    set({ cart: cart.filter(item => item.id !== itemId) });
  },
  clearCart: () => set({ cart: [] }),
  getCartTotal: () => {
    const { cart } = get();
    return cart.reduce((total, item) => total + (item.offer.discounted_price * item.quantity), 0);
  },
  getCartItemCount: () => {
    const { cart } = get();
    return cart.reduce((count, item) => count + item.quantity, 0);
  },
}));