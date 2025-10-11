import { TRANSACTION_API } from '@/constants/api_constants';
import { ApiClient, ApiResponse } from './config';
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
  cancelOrder: (id: string) => Promise<ApiResponse<Order>>;
}

export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export interface OrderWithStatus extends Order {
  status: OrderStatus;
  estimatedReadyTime?: string;
  notes?: string;
}

class OrdersApiImpl implements OrdersApi {
  apiClient = new ApiClient(TRANSACTION_API);

  async getOrders(userId?: string): Promise<ApiResponse<Order[]>> {
    try {
      const response = await this.apiClient.get('/orders');
      if (response.success) {
        return {
          success: true,
          data: response.data as Order[],
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch orders',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch orders',
      };
    }
  }

  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    try {
      const response = await this.apiClient.get('/orders' + id);
      if (response.success) {
        return {
          success: true,
          data: response.data as Order,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch order',
        };
      }
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
      const response = await this.apiClient.post('/orders', orderData);
      if (response.success) {
        return {
          success: true,
          data: response.data as Order,
          message: 'Order placed successfully',
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to create order',
        };
      }
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
      const response = await this.apiClient.put('/orders' + id, { status });
      if (response.success) {
        const updatedOrder = response.data as Order;

        return {
          success: true,
          data: updatedOrder,
          message: `Order status updated to ${status}`,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to update order status',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update order status',
      };
    }
  }

  async cancelOrder(id: string): Promise<ApiResponse<Order>> {
    try {
      const response = await this.apiClient.put('/orders' + id, {
        status: 'CANCELLED',
      });
      if (response.success) {
        const updatedOrder = response.data as Order;

        return {
          success: true,
          data: updatedOrder,
          message: `Order is cancelled successfully`,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to update order status',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to cancel order',
      };
    }
  }
}

export const ordersApi = new OrdersApiImpl();
