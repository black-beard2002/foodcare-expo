import {create} from 'zustand';
import { Order } from '@/types/appTypes';
import { ordersApi } from '@/api/orders';



interface OrderStore {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addOrder: (order: Omit<Order, 'createdAt'>) => void;
  removeOrder: (orderId: string) => void;
  clearOrders: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // API Actions
  fetchOrders: (userId?: string) => Promise<void>;
  createOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Promise<{ success: boolean; orderId?: string; error?: string }>;
  cancelOrder: (orderId: string) => Promise<{ success: boolean; error?: string }>;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  isLoading: false,
  error: null,

  addOrder: (order) =>
    set((state) => ({
      orders: [
        ...state.orders,
        {
          ...order,
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  removeOrder: (orderId) =>
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== orderId),
    })),

  clearOrders: () => set({ orders: [] }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  fetchOrders: async (userId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ordersApi.getOrders(userId);
      if (response.success && response.data) {
        set({ orders: response.data, isLoading: false });
      } else {
        set({ error: response.error || 'Failed to fetch orders', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Network error occurred', isLoading: false });
    }
  },
  
  createOrder: async (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ordersApi.createOrder(orderData);
      if (response.success && response.data) {
        const { addOrder } = get();
        addOrder(response.data);
        set({ isLoading: false });
        return { success: true, orderId: response.data.id };
      } else {
        set({ error: response.error || 'Failed to create order', isLoading: false });
        return { success: false, error: response.error };
      }
    } catch (error) {
      set({ error: 'Network error occurred', isLoading: false });
      return { success: false, error: 'Network error occurred' };
    }
  },
  
  cancelOrder: async (orderId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ordersApi.cancelOrder(orderId);
      if (response.success) {
        const { removeOrder } = get();
        removeOrder(orderId);
        set({ isLoading: false });
        return { success: true };
      } else {
        set({ error: response.error || 'Failed to cancel order', isLoading: false });
        return { success: false, error: response.error };
      }
    } catch (error) {
      set({ error: 'Network error occurred', isLoading: false });
      return { success: false, error: 'Network error occurred' };
    }
  },
}));
