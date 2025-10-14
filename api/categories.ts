import { Category } from '@/types/appTypes';
import { CATALOG_API } from '@/constants/api_constants';
import { ApiResponse } from '@/types/apiTypes';
import { createAxiosInstance } from './axiosInstance';

export interface CategoriesApi {
  getCategories: () => Promise<ApiResponse<Category[]>>;
  getCategoryById: (id: string) => Promise<ApiResponse<Category>>;
}

class CategoriesApiImpl implements CategoriesApi {
  catalog_api = createAxiosInstance(CATALOG_API ?? '');
  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const api_response = await this.catalog_api.get(
        '/configuration/category/get-all'
      );
      const responseBody = api_response.data;
      console.log('categories:', responseBody.data);
      if (responseBody.success) {
        return {
          success: true,
          data: responseBody.data as Category[],
        };
      } else {
        return {
          success: false,
          error: responseBody.error || 'Failed to fetch categories',
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
      const api_response = await this.catalog_api.get('/configuration/' + id);
      const responseBody = api_response.data;
      if (responseBody.success) {
        return {
          success: true,
          data: responseBody.data as Category,
        };
      } else {
        return {
          success: false,
          error: responseBody.error || 'Failed to fetch category',
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
