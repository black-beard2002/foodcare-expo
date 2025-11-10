import { create } from 'zustand';
import { TransactionBase } from '@/types/appTypes';
import { ordersApi } from '@/api/orders';
import { useAuthStore } from './authStore';

interface OrderStore {
  orders: TransactionBase[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addOrder: (order: Omit<TransactionBase, 'createdAt'>) => void;
  removeOrder: (orderId: string) => void;
  updateOrder: (
    orderId: string,
    updatedFields: Partial<TransactionBase>
  ) => Promise<{ success: boolean; message: string }>;
  clearOrders: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API Actions
  fetchOrders: () => Promise<void>;
  createOrder: (order: Omit<TransactionBase, 'id' | 'createdAt'>) => Promise<{
    success: boolean;
    confirmation_code?: string;
    error?: string;
  }>;
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
  updateOrder: async (orderId, updatedFields) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ordersApi.updateOrder(orderId, updatedFields);

      if (!response.success) {
        set({
          error: response.error || 'Failed to update order',
          isLoading: false,
        });
        return {
          success: false,
          message: response.error || 'Failed to confirm order',
        };
      }
      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === orderId ? { ...o, ...updatedFields } : o
        ),
      }));
      set({ isLoading: false });
      return {
        success: true,
        message: 'Order confirmed successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to confirm order',
      };
    }
  },
  clearOrders: () => set({ orders: [] }),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const { user } = useAuthStore.getState();
      const response = await ordersApi.getOrders(user?.id);
      if (response.success && response.data) {
        set({ orders: response.data, isLoading: false });
      } else {
        set({
          error: response.error || 'Failed to fetch orders',
          isLoading: false,
        });
      }
    } catch (error) {
      set({ error: 'Network error occurred', isLoading: false });
    }
  },

  createOrder: async (orderData: Omit<TransactionBase, 'id' | 'createdAt'>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ordersApi.createOrder(orderData);
      console.log('Create Order Response:', response);
      if (response.success && response.data) {
        const { addOrder } = get();
        addOrder(response.data);
        set({ isLoading: false });
        return {
          success: true,
          confirmation_code: response.data.confirmation_code,
        };
      } else {
        set({
          error: response.error || 'Failed to create order',
          isLoading: false,
        });
        return { success: false, error: response.error };
      }
    } catch (error) {
      set({ error: 'Network error occurred', isLoading: false });
      return { success: false, error: 'Network error occurred' };
    }
  },
}));
