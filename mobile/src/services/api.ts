import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  RefreshTokenResponse,
  ApiError,
} from '../types/auth';

// Configuration
const API_BASE_URL = __DEV__
  ? 'http://localhost:3001/api'
  : 'https://api.weareout.com/api';

const TOKEN_STORAGE_KEY = '@weareout_access_token';
const REFRESH_TOKEN_STORAGE_KEY = '@weareout_refresh_token';

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management utilities
export const tokenManager = {
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [TOKEN_STORAGE_KEY, accessToken],
        [REFRESH_TOKEN_STORAGE_KEY, refreshToken],
      ]);
    } catch (error) {
      console.error('Error setting tokens:', error);
      throw error;
    }
  },

  async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        TOKEN_STORAGE_KEY,
        REFRESH_TOKEN_STORAGE_KEY,
      ]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
      throw error;
    }
  },
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenManager.getAccessToken();
    console.log('🔒 [API] Request interceptor - URL:', config.url);
    console.log('🔒 [API] Request interceptor - Token:', token ? `${token.substring(0, 30)}...` : 'NO TOKEN');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔒 [API] Request interceptor - Authorization header set');
    } else {
      console.log('⚠️ [API] Request interceptor - NO TOKEN OR NO HEADERS');
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ [API] Request interceptor error:', error);
    return Promise.reject(error);
  },
);

// Response interceptor for token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({resolve, reject});
        })
          .then(token => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = await tokenManager.getRefreshToken();

      if (!refreshToken) {
        processQueue(new Error('No refresh token available'), null);
        isRefreshing = false;
        await tokenManager.clearTokens();
        return Promise.reject(error);
      }

      try {
        console.log('🔄 [API] Attempting token refresh...');
        const response = await axios.post<RefreshTokenResponse>(
          `${API_BASE_URL}/auth/refresh`,
          {
            refreshToken,
          },
        );
        console.log('✅ [API] Token refresh successful');

        const { data } = response.data;
        const { accessToken, refreshToken: newRefreshToken } = data.tokens || data;
        await tokenManager.setTokens(accessToken, newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        processQueue(null, accessToken);
        isRefreshing = false;

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        isRefreshing = false;
        await tokenManager.clearTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Error handler utility
export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    if (axiosError.response?.data) {
      return {
        message:
          axiosError.response.data.message || 'An unexpected error occurred',
        statusCode: axiosError.response.status,
        errors: axiosError.response.data.errors,
      };
    }
    if (axiosError.request) {
      return {
        message: 'Network error. Please check your connection.',
        statusCode: 0,
      };
    }
  }
  return {
    message: 'An unexpected error occurred',
  };
};

// Backend API response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// API endpoints
export const authApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
      const {tokens} = response.data.data;
      await tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post<ApiResponse<RegisterResponse>>(
        '/auth/register',
        data,
      );
      const {tokens} = response.data.data;
      await tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await tokenManager.clearTokens();
    }
  },

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      const response = await apiClient.post<RefreshTokenResponse>(
        '/auth/refresh',
        {
          refreshToken,
        },
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export default apiClient;
