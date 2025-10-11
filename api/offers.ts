import { CATALOG_API } from '@/constants/api_constants';
import { ApiClient, ApiResponse } from './config';
import { Offer } from '@/types/appTypes';

export interface OffersApi {
  getOffers: (offerId?: string) => Promise<ApiResponse<Offer[]>>;
  getOfferById: (id: string) => Promise<ApiResponse<Offer>>;
  getOffersByCategory: (category: string) => Promise<ApiResponse<Offer[]>>;
}

class OffersApiImpl implements OffersApi {
  apiClient = new ApiClient(CATALOG_API);
  async getOffers(): Promise<ApiResponse<Offer[]>> {
    try {
      const response = await this.apiClient.get('/offers');
      if (response.success) {
        return {
          success: true,
          data: response.data as Offer[],
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch offers',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch offers',
      };
    }
  }

  async getOfferById(id: string): Promise<ApiResponse<Offer>> {
    try {
      const response = await this.apiClient.get('/offers' + id);
      if (response.success) {
        return {
          success: true,
          data: response.data as Offer,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch offer',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch offer',
      };
    }
  }

  async getOffersByCategory(categoryId: string): Promise<ApiResponse<Offer[]>> {
    try {
      const response = await this.apiClient.get('/offers');
      if (response.success) {
        const filteredOffers = (response.data as Offer[]).filter(
          (offer) => offer.category_id === categoryId
        );
        return {
          success: true,
          data: filteredOffers,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch categorized offers',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch categorized offers',
      };
    }
  }
}

export const offersApi = new OffersApiImpl();
