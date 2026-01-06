import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { useAuthStore } from "@/stores/auth";

// API Base URL from environment or default
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * API Response format from backend
 */
export interface ApiResponse<T> {
  code: number;
  msg: string | null;
  message?: string | null; // legacy field
  data: T;
}

/**
 * API Error type
 */
export interface ApiError {
  code: number;
  message: string;
  status?: number;
}

/**
 * Axios instance with default configuration
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Track if we're refreshing token to prevent multiple refresh calls
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

/**
 * Request interceptor - Add auth token
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Token expired error code
const TOKEN_EXPIRED_CODE = 1103;

/**
 * Response interceptor - Unwrap data and handle token refresh
 */
apiClient.interceptors.response.use(
  (response) => {
    // Unwrap the data from { code, message, data } format
    const apiResponse = response.data as ApiResponse<unknown>;

    if (
      apiResponse &&
      typeof apiResponse === "object" &&
      "code" in apiResponse
    ) {
      if (apiResponse.code === 0) {
        // Return the unwrapped data
        response.data = apiResponse.data;
      } else if (apiResponse.code === TOKEN_EXPIRED_CODE) {
        // Token expired, logout and reject
        const { logout } = useAuthStore.getState();
        logout();

        return Promise.reject({
          code: apiResponse.code,
          message: apiResponse.msg || apiResponse.message || "Token expired, please login again",
          status: response.status,
        } as ApiError);
      } else {
        // Backend returned an error code
        return Promise.reject({
          code: apiResponse.code,
          message: apiResponse.msg || apiResponse.message || "Unknown error",
          status: response.status,
        } as ApiError);
      }
    }

    return response;
  },
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      const { refreshToken, refresh, logout } = useAuthStore.getState();

      if (!refreshToken) {
        logout();

        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Wait for the refresh to complete
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await refresh();
        const { accessToken } = useAuthStore.getState();

        if (accessToken) {
          onTokenRefreshed(accessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          return apiClient(originalRequest);
        }
      } catch {
        logout();

        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    // Extract error message from response
    const apiError: ApiError = {
      code: error.response?.data?.code ?? -1,
      message:
        error.response?.data?.msg || error.response?.data?.message || error.message || "Network error",
      status: error.response?.status,
    };

    return Promise.reject(apiError);
  },
);

export { API_BASE_URL };
