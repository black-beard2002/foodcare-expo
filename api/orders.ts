import { apiClient, ApiResponse } from './config';
import { Order } from '@/types/appTypes';

export interface OrdersApi {
  getOrders: (userId?: string) => Promise<ApiResponse<Order[]>>;
  getOrderById: (id: string) => Promise<ApiResponse<Order>>;
  createOrder: (
    order: Omit<Order, 'id' | 'createdAt'>
  ) => Promise<ApiResponse<Order>>;
  updateOrderStatus: (
    id: string,
    status: OrderStatus
  ) => Promise<ApiResponse<Order>>;
  cancelOrder: (id: string) => Promise<ApiResponse<void>>;
  getOrderHistory: (userId: string) => Promise<ApiResponse<Order[]>>;
}

export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export interface OrderWithStatus extends Order {
  status: OrderStatus;
  estimatedReadyTime?: string;
  notes?: string;
}

class OrdersApiImpl implements OrdersApi {
  private orders: OrderWithStatus[] = [];

  async getOrders(userId?: string): Promise<ApiResponse<Order[]>> {
    try {
      // const response = await apiClient.get('/orders');
      // if(response.success){
      //   return {
      //     success: true,
      //     data: response.data as Order[],
      //   }
      // }
      // else{
      //   return {
      //     success: false,
      //     error: response.error || 'Failed to fetch orders',
      //   };
      // }
      await new Promise((resolve) => setTimeout(resolve, 500));

      let filteredOrders = this.orders;
      if (userId) {
        // In a real app, you'd filter by userId
        filteredOrders = this.orders;
      }

      return {
        success: true,
        data: filteredOrders,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch orders',
      };
    }
  }

  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    // const response = await apiClient.get('/orders' + id);
    // if(response.success){
    //   return {
    //     success: true,
    //     data: response.data as Order,
    //   }
    // }
    // else{
    //   return {
    //     success: false,
    //     error: response.error || 'Failed to fetch order',
    //   };
    // }
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const order = this.orders.find((o) => o.id === id);
      if (!order) {
        return {
          success: false,
          error: 'Order not found',
        };
      }

      return {
        success: true,
        data: order,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch order',
      };
    }
  }

  async createOrder(
    orderData: Omit<Order, 'id' | 'createdAt'>
  ): Promise<ApiResponse<Order>> {
    try {
      // const response = await apiClient.post('/orders', orderData);
      // if(response.success){
      //   const newOrder = response.data as Order;
      //   this.orders.push(newOrder);
      //   return {
      //     success: true,
      //     data: response.data as Order,
      //     message: 'Order placed successfully',
      //   }
      // }
      // else{
      //   return {
      //     success: false,
      //     error: response.error || 'Failed to create order',
      //   };
      // }
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newOrder: OrderWithStatus = {
        ...orderData,
        id: `ORD${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'pending',
        estimatedReadyTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
      };

      this.orders.push(newOrder);

      return {
        success: true,
        data: newOrder,
        message: 'Order created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create order',
      };
    }
  }

  async updateOrderStatus(
    id: string,
    status: OrderStatus
  ): Promise<ApiResponse<Order>> {
    try {
      // const orderIndex = this.orders.findIndex((o) => o.id === id);
      // if (orderIndex === -1) {
      //   return {
      //     success: false,
      //     error: 'Order not found',
      //   };
      // }
      // const response = await apiClient.put('/orders' + id, { status });
      // if(response.success){
      // const updatedOrder = response.data as Order

      // this.orders[orderIndex] = {
      //   ...this.orders[orderIndex],
      //   status: updatedOrder.status,
      // };

      // return {
      //   success: true,
      //   data: this.orders[orderIndex],
      //   message: `Order status updated to ${status}`,
      // };
      //   return {
      //     success: true,
      //     data: response.data as Order,
      //   }
      // }
      // else{
      //   return {
      //     success: false,
      //     error: response.error || 'Failed to update order status',
      //   };
      // }
      await new Promise((resolve) => setTimeout(resolve, 400));

      const orderIndex = this.orders.findIndex((o) => o.id === id);
      if (orderIndex === -1) {
        return {
          success: false,
          error: 'Order not found',
        };
      }

      this.orders[orderIndex] = {
        ...this.orders[orderIndex],
        status,
      };

      return {
        success: true,
        data: this.orders[orderIndex],
        message: `Order status updated to ${status}`,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update order status',
      };
    }
  }

  async cancelOrder(id: string): Promise<ApiResponse<void>> {
    try {
      // const orderIndex = this.orders.findIndex((o) => o.id === id);
      // if (orderIndex === -1) {
      //   return {
      //     success: false,
      //     error: 'Order not found',
      //   };
      // }
      // const response = await apiClient.put('/orders' + id, { status: 'CANCELLED' });
      // if(response.success){
      // const updatedOrder = response.data as Order

      // this.orders[orderIndex] = {
      //   ...this.orders[orderIndex],
      //   status: updatedOrder.status,
      // };

      // return {
      //   success: true,
      //   data: this.orders[orderIndex],
      //   message: `Order status updated to ${status}`,
      // };
      //   return {
      //     success: true,
      //     data: response.data as Order,
      //   }
      // }
      // else{
      //   return {
      //     success: false,
      //     error: response.error || 'Failed to update order status',
      //   };
      // }
      await new Promise((resolve) => setTimeout(resolve, 600));

      const orderIndex = this.orders.findIndex((o) => o.id === id);
      if (orderIndex === -1) {
        return {
          success: false,
          error: 'Order not found',
        };
      }

      this.orders[orderIndex] = {
        ...this.orders[orderIndex],
        status: 'cancelled',
      };

      return {
        success: true,
        message: 'Order cancelled successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to cancel order',
      };
    }
  }

  async getOrderHistory(userId: string): Promise<ApiResponse<Order[]>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Filter completed and cancelled orders
      const historyOrders = this.orders.filter(
        (o) => o.status === 'completed' || o.status === 'cancelled'
      );

      return {
        success: true,
        data: historyOrders,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch order history',
      };
    }
  }
}

export const ordersApi = new OrdersApiImpl();
