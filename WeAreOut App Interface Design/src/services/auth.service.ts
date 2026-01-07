/**
 * Authentication Service
 * 
 * API functions for user authentication
 * 
 * BACKEND ENDPOINTS NEEDED:
 * - POST   /auth/signup         - Create new user account
 * - POST   /auth/login          - Login user
 * - POST   /auth/logout         - Logout user
 * - POST   /auth/refresh        - Refresh access token
 * - GET    /auth/me             - Get current user info
 * - POST   /auth/forgot-password - Send password reset email
 * - POST   /auth/reset-password  - Reset password with token
 */

import { apiClient } from './api';
import type {
  User,
  LoginRequest,
  SignupRequest,
  AuthResponse,
  ApiResponse,
} from '../types';

export const authService = {
  /**
   * Sign up a new user
   */
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/signup',
      data
    );
    if (!response.data) {
      throw new Error('Signup failed');
    }
    // Store auth token
    apiClient.setToken(response.data.token);
    return response.data;
  },

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      data
    );
    if (!response.data) {
      throw new Error('Login failed');
    }
    // Store auth token
    apiClient.setToken(response.data.token);
    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await apiClient.post<ApiResponse<void>>('/auth/logout');
    // Clear auth token
    apiClient.setToken(null);
  },

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    if (!response.data) {
      throw new Error('Failed to get user info');
    }
    return response.data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/refresh',
      { refreshToken }
    );
    if (!response.data) {
      throw new Error('Token refresh failed');
    }
    apiClient.setToken(response.data.token);
    return response.data;
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    await apiClient.post<ApiResponse<void>>('/auth/forgot-password', {
      email,
    });
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post<ApiResponse<void>>('/auth/reset-password', {
      token,
      newPassword,
    });
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return apiClient.getToken() !== null;
  },
};
