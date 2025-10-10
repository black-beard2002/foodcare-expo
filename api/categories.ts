import { ApiClient, ApiResponse } from './config';
import { Category } from '@/types/appTypes';
import { CATALOG_API } from '@/constants/api_constants';

export interface CategoriesApi {
  getCategories: (token: string) => Promise<ApiResponse<Category[]>>;
  getCategoryById: (id: string) => Promise<ApiResponse<Category>>;
}

class CategoriesApiImpl implements CategoriesApi {
  apiClient = new ApiClient(CATALOG_API);
  async getCategories(token: string): Promise<ApiResponse<Category[]>> {
    try {
      console.log('Fetching categories from API...', CATALOG_API);
      const response = await this.apiClient.get('/category/get-all', {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      });
      console.log('categories:', response);
      if (response.success) {
        return {
          success: true,
          data: response.data as Category[],
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch categories',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch categories',
      };
    }
  }

  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    try {
      const response = await this.apiClient.get('/categories/' + id);
      if (response.success) {
        return {
          success: true,
          data: response.data as Category,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch category',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch category',
      };
    }
  }
}

export const categoriesApi = new CategoriesApiImpl();
