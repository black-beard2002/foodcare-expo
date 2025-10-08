import { USER_API } from '@/constants/api_constants';
import { ApiClient, ApiResponse } from './config';
import { User } from '@/types/authTypes';

export interface AuthApi {
  signInWithPhone: (
    phoneNumber: string
  ) => Promise<ApiResponse<{ verificationId: string }>>;
  verifyOtp: (
    phone_number: string,
    otp: string
  ) => Promise<ApiResponse<{ user: User; token: string }>>;
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<ApiResponse<{ user: User; token: string }>>;
  signUp: (
    userData: SignUpData
  ) => Promise<ApiResponse<{ user: User; token: string }>>;
  signOut: () => Promise<ApiResponse<void>>;
  refreshToken: (
    refreshToken: string
  ) => Promise<ApiResponse<{ token: string }>>;
  getCurrentUser: () => Promise<ApiResponse<User>>;
  updateProfile: (
    userId: string,
    userData: Partial<User>
  ) => Promise<ApiResponse<User>>;
  deleteAccount: (userId: string) => Promise<ApiResponse<void>>;
}

export interface SignUpData {
  email?: string;
  phone_number?: string;
  full_name: string;
  password?: string;
}

class AuthApiImpl implements AuthApi {
  apiClient = new ApiClient(USER_API);

  async signInWithPhone(phoneNumber: string) {
    try {
      const response = await this.apiClient.post('/register-with-phone', {
        phone_number: phoneNumber,
      });
      if (response.success) {
        return {
          success: true,
          message: response.data.message,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to send OTP',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to send OTP',
      };
    }
  }

  async verifyOtp(
    phone_number: string,
    otp: string
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await this.apiClient.post('/verify-otp', {
        phone_number,
        otp,
      });
      if (response.success) {
        const user: User = {
          id: Date.now().toString(),
          phone_number: '+1234567890',
          has_completed_onboarding: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const token = `token_${Date.now()}`;

        return {
          success: true,
          data: { user, token },
          message: 'OTP verified successfully',
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to verify OTP',
          error: response.error || 'Failed to verify OTP',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to verify OTP',
      };
    }
  }

  async signInWithEmail(
    email: string,
    password: string
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Demo validation
      if (!email || !password) {
        return {
          success: false,
          error: 'Email and password are required',
        };
      }

      const user: User = {
        id: Date.now().toString(),
        phone_number: '+1234567890',
        email,
        full_name: 'Demo User',
        has_completed_onboarding: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const token = `token_${Date.now()}`;

      return {
        success: true,
        data: { user, token },
        message: 'Signed in successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to sign in',
      };
    }
  }

  async signUp(
    userData: SignUpData
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      if (!userData.full_name) {
        return {
          success: false,
          error: 'Full name is required',
        };
      }

      const user: User = {
        id: Date.now().toString(),
        phone_number: userData.phone_number || '',
        email: userData.email,
        full_name: userData.full_name,
        has_completed_onboarding: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const token = `token_${Date.now()}`;

      return {
        success: true,
        data: { user, token },
        message: 'Account created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create account',
      };
    }
  }

  async signOut(): Promise<ApiResponse<void>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        success: true,
        message: 'Signed out successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to sign out',
      };
    }
  }

  async refreshToken(
    refreshToken: string
  ): Promise<ApiResponse<{ token: string }>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const token = `token_${Date.now()}`;

      return {
        success: true,
        data: { token },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to refresh token',
      };
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Return demo user for now
      const user: User = {
        id: '1',
        phone_number: '+1234567890',
        email: 'demo@example.com',
        full_name: 'Demo User',
        has_completed_onboarding: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get current user',
      };
    }
  }

  async updateProfile(
    userId: string,
    userData: Partial<User>
  ): Promise<ApiResponse<User>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const updatedUser: User = {
        id: userId,
        phone_number: userData.phone_number || '+1234567890',
        email: userData.email,
        full_name: userData.full_name,
        address: userData.address,
        latitude: userData.latitude,
        longitude: userData.longitude,
        date_of_birth: userData.date_of_birth,
        avatar_url: userData.avatar_url,
        has_completed_onboarding: userData.has_completed_onboarding,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: new Date().toISOString(),
      };

      return {
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update profile',
      };
    }
  }

  async deleteAccount(userId: string): Promise<ApiResponse<void>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        success: true,
        message: 'Account deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete account',
      };
    }
  }
}

export const authApi = new AuthApiImpl();
