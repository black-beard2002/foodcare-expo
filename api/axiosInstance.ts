/* eslint-disable @typescript-eslint/no-explicit-any */
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance } from 'axios';
import { emitAuthEvent, AUTH_EVENTS } from '@/utils/authEvents';

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// ✅ Function that creates a new Axios instance with the given baseURL
export const createAxiosInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 30000,
  });

  // Attach access token before every request
  instance.interceptors.request.use(
    async (config) => {
      const token = await AsyncStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Handle token expiry and refresh logic
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return instance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = await AsyncStorage.getItem('refresh_token');
          if (!refreshToken) throw new Error('No refresh token found');

          console.log('🔄 Attempting to refresh token...');

          // 🔄 Call refresh-token API
          const response = await axios.post(`${baseURL}/auth/refresh-token`, {
            refresh_token: refreshToken, // Changed from 'token' to 'refresh_token'
          });

          const newToken =
            response.data?.data?.new_token || response.data?.new_token;

          if (!newToken) {
            throw new Error('No new token received from refresh endpoint');
          }

          await AsyncStorage.setItem('access_token', newToken);

          instance.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${newToken}`;

          // ✅ Emit token refresh event
          emitAuthEvent(AUTH_EVENTS.TOKEN_REFRESHED, { token: newToken });

          processQueue(null, newToken);

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);
        } catch (err) {
          console.error('❌ Token refresh failed:', err);
          processQueue(err, null);

          // Clear all auth data
          await AsyncStorage.multiRemove([
            'access_token',
            'refresh_token',
            'user',
          ]);

          // ✅ Emit logout event
          emitAuthEvent(AUTH_EVENTS.LOGOUT, { reason: 'token_refresh_failed' });

          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};
