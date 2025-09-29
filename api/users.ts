import { apiClient, ApiResponse } from './config';
import { User } from '@/types/authTypes';

export interface UsersApi {
  getUsers: () => Promise<ApiResponse<User[]>>;
  getUserById: (id: string) => Promise<ApiResponse<User>>;
  updateUser: (id: string, userData: Partial<User>) => Promise<ApiResponse<User>>;
  deleteUser: (id: string) => Promise<ApiResponse<void>>;
  getUserPreferences: (userId: string) => Promise<ApiResponse<UserPreferences>>;
  updateUserPreferences: (userId: string, preferences: Partial<UserPreferences>) => Promise<ApiResponse<UserPreferences>>;
  getUserAddresses: (userId: string) => Promise<ApiResponse<UserAddress[]>>;
  addUserAddress: (userId: string, address: Omit<UserAddress, 'id'>) => Promise<ApiResponse<UserAddress>>;
  updateUserAddress: (userId: string, addressId: string, address: Partial<UserAddress>) => Promise<ApiResponse<UserAddress>>;
  deleteUserAddress: (userId: string, addressId: string) => Promise<ApiResponse<void>>;
}

export interface UserPreferences {
  id: string;
  userId: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    orderUpdates: boolean;
    promotions: boolean;
  };
  dietary: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
    nutFree: boolean;
  };
  spiceLevel: 'mild' | 'medium' | 'hot' | 'very_hot';
  language: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface UserAddress {
  id: string;
  userId: string;
  label: string; // Home, Work, etc.
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  deliveryInstructions?: string;
  created_at: string;
  updated_at: string;
}

class UsersApiImpl implements UsersApi {
  private users: User[] = [];
  private preferences: UserPreferences[] = [];
  private addresses: UserAddress[] = [];

  async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      return {
        success: true,
        data: this.users,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch users',
      };
    }
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const user = this.users.find(u => u.id === id);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch user',
      };
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const userIndex = this.users.findIndex(u => u.id === id);
      if (userIndex === -1) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      this.users[userIndex] = {
        ...this.users[userIndex],
        ...userData,
        updated_at: new Date().toISOString(),
      };

      return {
        success: true,
        data: this.users[userIndex],
        message: 'User updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update user',
      };
    }
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const userIndex = this.users.findIndex(u => u.id === id);
      if (userIndex === -1) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      this.users.splice(userIndex, 1);
      
      // Also remove related data
      this.preferences = this.preferences.filter(p => p.userId !== id);
      this.addresses = this.addresses.filter(a => a.userId !== id);

      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete user',
      };
    }
  }

  async getUserPreferences(userId: string): Promise<ApiResponse<UserPreferences>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let userPrefs = this.preferences.find(p => p.userId === userId);
      
      if (!userPrefs) {
        // Create default preferences
        userPrefs = {
          id: Date.now().toString(),
          userId,
          notifications: {
            email: true,
            push: true,
            sms: false,
            orderUpdates: true,
            promotions: false,
          },
          dietary: {
            vegetarian: false,
            vegan: false,
            glutenFree: false,
            dairyFree: false,
            nutFree: false,
          },
          spiceLevel: 'medium',
          language: 'en',
          currency: 'USD',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        this.preferences.push(userPrefs);
      }

      return {
        success: true,
        data: userPrefs,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch user preferences',
      };
    }
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const prefsIndex = this.preferences.findIndex(p => p.userId === userId);
      if (prefsIndex === -1) {
        return {
          success: false,
          error: 'User preferences not found',
        };
      }

      this.preferences[prefsIndex] = {
        ...this.preferences[prefsIndex],
        ...preferences,
        updated_at: new Date().toISOString(),
      };

      return {
        success: true,
        data: this.preferences[prefsIndex],
        message: 'Preferences updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update preferences',
      };
    }
  }

  async getUserAddresses(userId: string): Promise<ApiResponse<UserAddress[]>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const userAddresses = this.addresses.filter(a => a.userId === userId);
      
      return {
        success: true,
        data: userAddresses,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch user addresses',
      };
    }
  }

  async addUserAddress(userId: string, address: Omit<UserAddress, 'id'>): Promise<ApiResponse<UserAddress>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const newAddress: UserAddress = {
        ...address,
        id: Date.now().toString(),
        userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      this.addresses.push(newAddress);

      return {
        success: true,
        data: newAddress,
        message: 'Address added successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to add address',
      };
    }
  }

  async updateUserAddress(userId: string, addressId: string, address: Partial<UserAddress>): Promise<ApiResponse<UserAddress>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const addressIndex = this.addresses.findIndex(a => a.id === addressId && a.userId === userId);
      if (addressIndex === -1) {
        return {
          success: false,
          error: 'Address not found',
        };
      }

      this.addresses[addressIndex] = {
        ...this.addresses[addressIndex],
        ...address,
        updated_at: new Date().toISOString(),
      };

      return {
        success: true,
        data: this.addresses[addressIndex],
        message: 'Address updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update address',
      };
    }
  }

  async deleteUserAddress(userId: string, addressId: string): Promise<ApiResponse<void>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const addressIndex = this.addresses.findIndex(a => a.id === addressId && a.userId === userId);
      if (addressIndex === -1) {
        return {
          success: false,
          error: 'Address not found',
        };
      }

      this.addresses.splice(addressIndex, 1);

      return {
        success: true,
        message: 'Address deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete address',
      };
    }
  }
}

export const usersApi = new UsersApiImpl();