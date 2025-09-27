import {create} from 'zustand';
import { Order } from '@/types/appTypes';



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
