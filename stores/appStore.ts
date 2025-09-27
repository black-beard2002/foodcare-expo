import { CartItem, Category, Offer, Restaurant } from '@/types/appTypes';
import { create } from 'zustand';



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