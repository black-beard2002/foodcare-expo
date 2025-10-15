/* eslint-disable @typescript-eslint/no-explicit-any */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance } from 'axios';
import { router } from 'expo-router';

let isRefreshing = false;

type FailedRequest = {
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
};

let failedQueue: FailedRequest[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// ✅ Create an Axios instance with dynamic baseURL
export const createAxiosInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({ baseURL });

  // ✅ Helper to save tokens asynchronously
  const setTokens = async ({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken?: string;
  }) => {
    await AsyncStorage.setItem('access_token', accessToken);
    if (refreshToken) await AsyncStorage.setItem('refresh_token', refreshToken);
  };

  // ✅ Request Interceptor — Attach token before every request
  instance.interceptors.request.use(
    async (config) => {
      const access_token = await AsyncStorage.getItem('access_token');
      if (access_token) {
        config.headers.Authorization = `Bearer ${access_token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // ✅ Response Interceptor — Handle expired tokens and refresh logic
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response &&
        error.response.status === 401 &&
        !originalRequest._retry
      ) {
        if (isRefreshing) {
          // Queue the request until the refresh is done
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (token) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return instance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refresh_token = await AsyncStorage.getItem('refresh_token');
          if (!refresh_token) throw new Error('No refresh token found');

          // 🔄 Call refresh-token API (use baseURL for consistency)
          const response = await axios.post(
            'https://octosys-api.compugear.store/user/api/v1/auth/refresh-token',
            {
              refresh_token,
            }
          );

          const newToken = response.data?.data?.new_token;
          if (!newToken) throw new Error('No new token returned from API');

          await setTokens({ accessToken: newToken });

          instance.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${newToken}`;
          processQueue(null, newToken);

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);
        } catch (err) {
          processQueue(err, null);
          await AsyncStorage.multiRemove([
            'access_token',
            'refresh_token',
            'user',
          ]);
          router.push('/auth');
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
