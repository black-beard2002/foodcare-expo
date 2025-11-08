import { TRANSACTION_API } from '@/constants/api_constants';
import { TransactionBase, TransactionStatus } from '@/types/appTypes';
import { ApiResponse } from '@/types/apiTypes';
import { createAxiosInstance } from './axiosInstance';

export interface OrdersApi {
  getOrders: (userId?: string) => Promise<ApiResponse<TransactionBase[]>>;
  getOrderById: (id: string) => Promise<ApiResponse<TransactionBase>>;
  createOrder: (
    order: Omit<TransactionBase, 'id' | 'createdAt'>
  ) => Promise<ApiResponse<TransactionBase>>;
  updateOrder: (
    id: string,
    data: Partial<TransactionBase>
  ) => Promise<ApiResponse<TransactionBase>>;
  cancelOrder: (id: string) => Promise<ApiResponse<TransactionBase>>;
}

export type OrderStatus = TransactionStatus;

class OrdersApiImpl implements OrdersApi {
  transaction_api = createAxiosInstance(TRANSACTION_API ?? '');

  async getOrders(userId?: string): Promise<ApiResponse<TransactionBase[]>> {
    try {
      const response_api = await this.transaction_api.get(
        '/transaction/get-all',
        { params: { user_id: userId, transaction_type: 'ORDER' } }
      );
      const responseBody = response_api.data;
      if (responseBody.success) {
        return {
          success: true,
          data: responseBody.data as TransactionBase[],
        };
      } else {
        return {
          success: false,
          error: responseBody.error || 'Failed to fetch orders',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch orders',
      };
    }
  }

  async getOrderById(id: string): Promise<ApiResponse<TransactionBase>> {
    try {
      const response_api = await this.transaction_api.get(`/transaction/${id}`);
      const responseBody = response_api.data;
      if (responseBody.success) {
        return {
          success: true,
          data: responseBody.data as TransactionBase,
        };
      } else {
        return {
          success: false,
          error: responseBody.error || 'Failed to fetch order',
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
    orderData: Omit<TransactionBase, 'id' | 'createdAt'>
  ): Promise<ApiResponse<TransactionBase>> {
    try {
      const response_api = await this.transaction_api.post(
        '/transaction/order',
        orderData
      );
      console.log('createOrder response_api:', response_api);
      const responseBody = response_api.data;
      if (responseBody.success) {
        return {
          success: true,
          data: responseBody.data as TransactionBase,
          message: 'TransactionBase placed successfully',
        };
      } else {
        return {
          success: false,
          error: responseBody.error || 'Failed to create order',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create order',
      };
    }
  }

  async updateOrder(
    id: string,
    data: Partial<TransactionBase>
  ): Promise<ApiResponse<TransactionBase>> {
    try {
      const response_api = await this.transaction_api.put(
        `/transaction/${id}/update`,
        data
      );
      const responseBody = response_api.data;
      if (responseBody.success) {
        const updatedOrder = responseBody.data as TransactionBase;

        return {
          success: true,
          data: updatedOrder,
          message: responseBody.message,
        };
      } else {
        return {
          success: false,
          error: responseBody.error || 'Failed to update order status',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update order status',
      };
    }
  }

  async cancelOrder(id: string): Promise<ApiResponse<TransactionBase>> {
    try {
      const response_api = await this.transaction_api.put('/orders' + id, {
        status: 'CANCELLED',
      });
      const responseBody = response_api.data;
      if (responseBody.success) {
        const updatedOrder = responseBody.data as TransactionBase;

        return {
          success: true,
          data: updatedOrder,
          message: `TransactionBase is cancelled successfully`,
        };
      } else {
        return {
          success: false,
          error: responseBody.error || 'Failed to update order status',
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
