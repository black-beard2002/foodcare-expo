import { ApiResponse, HttpMethod } from '@/types/apiTypes'; // optional if you have a separate file

export class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = '', timeout: number = 10000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  // 🔄 Centralized fetch method with auto-refresh support
  private async request<T>(
    endpoint: string,
    method: HttpMethod = 'GET',
    data?: any,
    headers?: Record<string, string>,
    params?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    // ✅ Lazy import - only import when needed, not at module level
    const { useAuthStore } = await import('@/stores/authStore');
    const { token, refresh_token, setToken, signOut } = useAuthStore.getState();
    const url = `${this.baseURL}${endpoint}`;

    try {
      let response = await this.sendRequest(
        url,
        method,
        data,
        token ?? '',
        headers,
        params
      );
      console.log('responseeee:', response);

      // 🧩 If access token expired, attempt refresh
      if (response.status === 401 && refresh_token) {
        console.log('Access token expired — refreshing...');
        const newToken = await this.refreshAccessToken(refresh_token, token!);

        if (newToken) {
          // ✅ Update Zustand auth store
          setToken(newToken);

          // Retry the original request with the new token
          response = await this.sendRequest(
            url,
            method,
            data,
            newToken,
            headers
          );
        } else {
          // ❌ Refresh failed — logout
          console.warn('Token refresh failed, logging out.');
          signOut?.();
          return {
            success: false,
            error: 'Session expired. Please log in again.',
            statusCode: 401,
          };
        }
      }

      // 🚦 Handle non-success responses
      if (!response.ok) {
        const errorData = await this.safeJson(response);
        return {
          success: false,
          error: errorData?.error || `HTTP ${response.status}`,
          message: errorData?.message,
          statusCode: response.status,
        };
      }

      // ✅ Successful response
      const result = await this.safeJson(response);
      console.log(`API Response [${method} ${url}]:`, result);
      return {
        success: true,
        data: result?.data,
        message: result?.message,
        statusCode: response.status,
      };
    } catch (error) {
      console.error(`API Error [${method} ${url}]:`, error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // 🔧 Helper to send a request
  private async sendRequest(
    url: string,
    method: HttpMethod,
    data: any,
    token?: string,
    headers?: Record<string, string>,
    params?: Record<string, string>
  ): Promise<Response> {
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      config.body = JSON.stringify(data);
    }
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    config.signal = controller.signal;
    console.log(`API Request [${method} ${url}]`);

    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    return response;
  }

  // 🧠 Graceful JSON parsing
  private async safeJson(response: Response) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  // ♻️ Refresh the token centrally
  private async refreshAccessToken(
    refresh_token: string,
    token: string
  ): Promise<string | null> {
    try {
      const res = await fetch(
        `${this.baseURL}/auth/refresh-token/${refresh_token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) return null;
      const data = await res.json();

      // Adjust according to backend response
      return data?.data?.refresh_token || data?.refresh_token || null;
    } catch (error) {
      console.error('Failed to refresh access token:', error);
      return null;
    }
  }

  // 🌐 Public methods
  async get<T>(
    endpoint: string,
    headers?: Record<string, string>,
    params?: Record<string, string>
  ) {
    return this.request<T>(endpoint, 'GET', undefined, headers, params);
  }

  async post<T>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>,
    params?: Record<string, string>
  ) {
    return this.request<T>(endpoint, 'POST', data, headers, params);
  }

  async put<T>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>,
    params?: Record<string, string>
  ) {
    return this.request<T>(endpoint, 'PUT', data, headers, params);
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>,
    params?: Record<string, string>
  ) {
    return this.request<T>(endpoint, 'PATCH', data, headers, params);
  }

  async delete<T>(
    endpoint: string,
    headers?: Record<string, string>,
    params?: Record<string, string>
  ) {
    return this.request<T>(endpoint, 'DELETE', undefined, headers, params);
  }
}

// Export shared instance
export const apiClient = new ApiClient();
