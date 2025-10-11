// ============================
// ✅ API Configuration
// ============================

// ============================
// ✅ Generic API Response Type
// ============================

/**
 * Represents the standard response shape returned by the API.
 *
 * @template T - The expected data type inside the response.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

// ============================
// ✅ Supported HTTP Methods
// ============================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
