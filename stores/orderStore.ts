import {create} from 'zustand';
import { CartItem, Offer } from './appStore';

export interface Order {
  id: string; // unique order id
  customerName: string;
  customerPhone: string;
  pickupTime?: string;
  specialInstructions?: string;
  offers: CartItem[];
  total: number;
  createdAt: string;
}

interface OrderStore {
  orders: Order[];
  addOrder: (order: Omit<Order, 'createdAt'>) => void;
  removeOrder: (orderId: string) => void;
  clearOrders: () => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],

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
}));
