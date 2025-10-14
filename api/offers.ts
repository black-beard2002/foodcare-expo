import { CATALOG_API } from '@/constants/api_constants';

import { Offer } from '@/types/appTypes';
import { ApiResponse } from '@/types/apiTypes';
import { createAxiosInstance } from './axiosInstance';

export interface OffersApi {
  getOffers: (offerId?: string) => Promise<ApiResponse<Offer[]>>;
  getOfferById: (id: string) => Promise<ApiResponse<Offer>>;
  getOffersByCategory: (category: string) => Promise<ApiResponse<Offer[]>>;
}

class OffersApiImpl implements OffersApi {
  catalog_api = createAxiosInstance(CATALOG_API ?? '');
  async getOffers(): Promise<ApiResponse<Offer[]>> {
    try {
      const response_api = await this.catalog_api.get('/item/get-all', {
        params: {
          item_type: 'OFFER',
        },
      });
      const responseBody = response_api.data;
      console.log('offers:', responseBody.data);
      if (responseBody.success) {
        return {
          success: true,
          data: responseBody.data as Offer[],
        };
      } else {
        return {
          success: false,
          error: responseBody.error || 'Failed to fetch offers',
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
      const response_api = await this.catalog_api.get(`/item/${id}`);
      const responseBody = response_api.data;
      if (responseBody.success) {
        return {
          success: true,
          data: responseBody.data as Offer,
        };
      } else {
        return {
          success: false,
          error: responseBody.error || 'Failed to fetch offer',
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
      const response_api = await this.catalog_api.get('/item/get-all');
      const responseBody = response_api.data;
      if (responseBody.success) {
        const filteredOffers = (responseBody.data as Offer[]).filter(
          (offer) => offer.category_id === categoryId
        );
        return {
          success: true,
          data: filteredOffers,
        };
      } else {
        return {
          success: false,
          error: responseBody.error || 'Failed to fetch categorized offers',
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
