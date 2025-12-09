import { USER_API } from '@/constants/api_constants';
import { User } from '@/types/authTypes';
import { ApiResponse } from '@/types/apiTypes';
import { createAxiosInstance } from './axiosInstance';

export interface AuthApi {
  signInWithPhone: (phoneNumber: string) => Promise<ApiResponse>;
  verifyOtp: (
    phone_number: string,
    otp: string
  ) => Promise<
    ApiResponse<{
      user: Partial<User>;
      access_token: string;
      refresh_token: string;
      attempts: number;
    }>
  >;
  // signInWithEmail: (
  //   email: string,
  //   password: string
  // ) => Promise<ApiResponse<{ user: Partial<User>; token: string }>>;
  // signUp: (
  //   userData: SignUpData
  // ) => Promise<ApiResponse<{ user: Partial<User>; token: string }>>;
  signOut: () => Promise<ApiResponse>;
  getUser: (id: string) => Promise<ApiResponse<Partial<User>>>;
  updateProfile: (
    userId: string,
    userData: Partial<Partial<User>>
  ) => Promise<ApiResponse<Partial<User>>>;
  deleteAccount: (userId: string) => Promise<ApiResponse>;
}

export interface SignUpData {
  email?: string;
  phone_number?: string;
  full_name: string;
  password?: string;
}

class AuthApiImpl implements AuthApi {
  auth_api = createAxiosInstance(USER_API ?? '');

  async signInWithPhone(phoneNumber: string) {
    try {
      const api_response = await this.auth_api.post(
        '/user/register-with-phone',
        {
          phone_number: phoneNumber,
        }
      );
      const responseBody = api_response.data;
      return {
        success: true,
        data: responseBody.data,
      };
    } catch (error) {
      console.log('signInWithPhone Error', error);
      return {
        success: false,
        message: 'unexpected error occured',
        error: 'unexpected error occured',
      };
    }
  }

  async verifyOtp(
    phone_number: string,
    otp: string
  ): Promise<
    ApiResponse<{
      user: Partial<User>;
      access_token: string;
      refresh_token: string;
      attempts: number;
    }>
  > {
    try {
      const api_response = await this.auth_api.post('/user/verify-otp', {
        phone_number,
        otp,
      });
      const responseBody = api_response.data;
      if (responseBody.data) {
        // replace id in type User by user_id
        const apiUser = responseBody.data.user;
        const user: Partial<User> = {
          ...apiUser,
          id: apiUser.user_id, // map to the expected field
        };
        const access_token: string = responseBody.data.token.access_token;
        const refresh_token: string = responseBody.data.token.refresh_token;
        const attempts = responseBody.data.attempts;

        return {
          success: true,
          data: { user, access_token, refresh_token, attempts },
          message: responseBody.message ?? 'OTP verified successfully',
        };
      } else {
        return {
          success: false,
          message: responseBody.message || 'Failed to verify OTP',
          error: responseBody.error || 'Failed to verify OTP',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to verify OTP',
      };
    }
  }

  // async signInWithEmail(
  //   email: string,
  //   password: string
  // ): Promise<ApiResponse<{ user: Partial<User>; token: string }>> {
  //   try {
  //     await new Promise((resolve) => setTimeout(resolve, 1000));

  //     // Demo validation
  //     if (!email || !password) {
  //       return {
  //         success: false,
  //         error: 'Email and password are required',
  //       };
  //     }

  //     const user: Partial<User> = {
  //       id: Date.now().toString(),
  //       phone_number: '+1234567890',
  //       email_address: email,
  //       first_name: 'Demo User',
  //     };

  //     const token = `token_${Date.now()}`;

  //     return {
  //       success: true,
  //       data: { user, token },
  //       message: 'Signed in successfully',
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       error: 'Failed to sign in',
  //     };
  //   }
  // }

  // async signUp(
  //   userData: SignUpData
  // ): Promise<ApiResponse<{ user: Partial<User>; token: string }>> {
  //   try {
  //     await new Promise((resolve) => setTimeout(resolve, 1200));

  //     if (!userData.full_name) {
  //       return {
  //         success: false,
  //         error: 'Full name is required',
  //       };
  //     }

  //     const user: Partial<User> = {
  //       id: Date.now().toString(),
  //       phone_number: userData.phone_number || '',
  //       email_address: userData.email,
  //       first_name: userData.full_name,
  //     };

  //     const token = `token_${Date.now()}`;

  //     return {
  //       success: true,
  //       data: { user, token },
  //       message: 'Account created successfully',
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       error: 'Failed to create account',
  //     };
  //   }
  // }

  async signOut(): Promise<ApiResponse> {
    try {
      const api_response = await this.auth_api.post('/auth/logout');
      const responseBody = api_response.data;
      if (responseBody.success) {
        return {
          success: true,
          message: 'Signed out successfully',
        };
      } else {
        return {
          success: false,
          error: 'Failed to sign out',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to sign out',
      };
    }
  }

  async getUser(id: string): Promise<ApiResponse<Partial<User>>> {
    try {
      const api_response = await this.auth_api.get(`/user/${id}`);
      const responseBody = api_response.data;
      if (responseBody.success && responseBody.data) {
        return {
          success: true,
          message: 'user retrieved successfully',
          data: responseBody.data,
        };
      } else {
        return {
          success: false,
          error: 'Failed to get user',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get user',
      };
    }
  }

  async updateProfile(
    userId: string,
    userData: Partial<Partial<User>>
  ): Promise<ApiResponse<Partial<User>>> {
    try {
      const api_response = await this.auth_api.put(
        `/user/${userId}/update`,
        userData
      );

      const responseBody = api_response.data;
      console.log('update response:', responseBody);
      if (responseBody.success) {
        return {
          success: true,
          data: responseBody.data as Partial<User>,
          message: 'Profile updated successfully',
        };
      } else {
        return {
          success: false,
          error: responseBody.error || 'Failed to update profile',
        };
      }
    } catch (error) {
      console.log('user update error:', error);
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
