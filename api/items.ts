import { apiClient, ApiResponse } from './config';
import { Item } from '@/types/appTypes';
import { dummyItems } from '@/data/dummyData';

export interface ItemsApi {
  getItems: (offerId?: string) => Promise<ApiResponse<Item[]>>;
  getItemById: (id: string) => Promise<ApiResponse<Item>>;
  createItem: (
    item: Omit<Item, 'id' | 'created_at'>
  ) => Promise<ApiResponse<Item>>;
  updateItem: (id: string, item: Partial<Item>) => Promise<ApiResponse<Item>>;
  deleteItem: (id: string) => Promise<ApiResponse<void>>;
  getItemsByCategory: (category: string) => Promise<ApiResponse<Item[]>>;
}

class ItemsApiImpl implements ItemsApi {
  async getItems(offerId?: string): Promise<ApiResponse<Item[]>> {
    try {
      // const response = await apiClient.get('/items');
      // if(response.success){
      //   return {
      //     success: true,
      //     data: response.data as Item[],
      //   }
      // }
      // else{
      //   return {
      //     success: false,
      //     error: response.error || 'Failed to fetch items',
      //   };
      // }
      await new Promise((resolve) => setTimeout(resolve, 400));
      let items = dummyItems;

      if (offerId) {
        items = dummyItems.filter((item) => item.offer_id === offerId);
      }

      return {
        success: true,
        data: items,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch items',
      };
    }
  }

  async getItemById(id: string): Promise<ApiResponse<Item>> {
    try {
      // const response = await apiClient.get('/items' + id);
      // if(response.success){
      //   return {
      //     success: true,
      //     data: response.data as Item,
      //   }
      // }
      // else{
      //   return {
      //     success: false,
      //     error: response.error || 'Failed to fetch item',
      //   };
      // }
      await new Promise((resolve) => setTimeout(resolve, 300));
      const item = dummyItems.find((i) => i.id === id);

      if (!item) {
        return {
          success: false,
          error: 'Item not found',
        };
      }

      return {
        success: true,
        data: item,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch item',
      };
    }
  }

  async createItem(
    item: Omit<Item, 'id' | 'created_at'>
  ): Promise<ApiResponse<Item>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      const newItem: Item = {
        ...item,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };

      return {
        success: true,
        data: newItem,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create item',
      };
    }
  }

  async updateItem(
    id: string,
    item: Partial<Item>
  ): Promise<ApiResponse<Item>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const existingItem = dummyItems.find((i) => i.id === id);

      if (!existingItem) {
        return {
          success: false,
          error: 'Item not found',
        };
      }

      const updatedItem: Item = {
        ...existingItem,
        ...item,
        id,
      };

      return {
        success: true,
        data: updatedItem,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update item',
      };
    }
  }

  async deleteItem(id: string): Promise<ApiResponse<void>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const itemExists = dummyItems.some((i) => i.id === id);

      if (!itemExists) {
        return {
          success: false,
          error: 'Item not found',
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete item',
      };
    }
  }

  async getItemsByCategory(category: string): Promise<ApiResponse<Item[]>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const items = dummyItems.filter(
        (item) => item.category.toLowerCase() === category.toLowerCase()
      );

      return {
        success: true,
        data: items,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch items by category',
      };
    }
  }
}

export const itemsApi = new ItemsApiImpl();
