import { apiClient, ApiResponse } from './config';
import { Category } from '@/types/appTypes';
import { dummyCategories } from '@/data/dummyData';

export interface CategoriesApi {
  getCategories: () => Promise<ApiResponse<Category[]>>;
  getCategoryById: (id: string) => Promise<ApiResponse<Category>>;
  createCategory: (
    category: Omit<Category, 'id' | 'created_at'>
  ) => Promise<ApiResponse<Category>>;
  updateCategory: (
    id: string,
    category: Partial<Category>
  ) => Promise<ApiResponse<Category>>;
  deleteCategory: (id: string) => Promise<ApiResponse<void>>;
}

class CategoriesApiImpl implements CategoriesApi {
  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      // const response = await apiClient.get('/categories');
      // if(response.success){
      //   return {
      //     success: true,
      //     data: response.data as Category[],
      //   }
      // }
      // else{
      //   return {
      //     success: false,
      //     error: response.error || 'Failed to fetch categories',
      //   };
      // }

      // For now, return dummy data. Replace with actual API call when backend is ready
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
      return {
        success: true,
        data: dummyCategories,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch categories',
      };
    }
  }

  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    try {
      // const response = await apiClient.get('/categories/' + id);
      // if(response.success){
      //   return {
      //     success: true,
      //     data: response.data as Category,
      //   }
      // }
      // else{
      //   return {
      //     success: false,
      //     error: response.error || 'Failed to fetch category',
      //   };
      // }
      await new Promise((resolve) => setTimeout(resolve, 300));
      const category = dummyCategories.find((c) => c.id === id);

      if (!category) {
        return {
          success: false,
          error: 'Category not found',
        };
      }

      return {
        success: true,
        data: category,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch category',
      };
    }
  }

  async createCategory(
    category: Omit<Category, 'id' | 'created_at'>
  ): Promise<ApiResponse<Category>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const newCategory: Category = {
        ...category,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };

      return {
        success: true,
        data: newCategory,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create category',
      };
    }
  }

  async updateCategory(
    id: string,
    category: Partial<Category>
  ): Promise<ApiResponse<Category>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const existingCategory = dummyCategories.find((c) => c.id === id);

      if (!existingCategory) {
        return {
          success: false,
          error: 'Category not found',
        };
      }

      const updatedCategory: Category = {
        ...existingCategory,
        ...category,
        id,
      };

      return {
        success: true,
        data: updatedCategory,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update category',
      };
    }
  }

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const categoryExists = dummyCategories.some((c) => c.id === id);

      if (!categoryExists) {
        return {
          success: false,
          error: 'Category not found',
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete category',
      };
    }
  }
}

export const categoriesApi = new CategoriesApiImpl();
