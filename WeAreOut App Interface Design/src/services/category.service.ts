/**
 * Category Service
 * 
 * API functions for managing categories
 * 
 * BACKEND ENDPOINTS NEEDED:
 * - GET    /categories           - Get all categories
 * - POST   /categories           - Create new category
 * - PUT    /categories/:id       - Update category
 * - DELETE /categories/:id       - Delete category
 * - PUT    /categories/reorder   - Reorder categories
 */

import { apiClient } from './api';
import type { Category, ApiResponse } from '../types';

export const categoryService = {
  /**
   * Get all categories
   */
  async getAll(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return response.data || [];
  },

  /**
   * Create a new category
   */
  async create(data: { name: string; icon?: string }): Promise<Category> {
    const response = await apiClient.post<ApiResponse<Category>>(
      '/categories',
      data
    );
    if (!response.data) {
      throw new Error('Failed to create category');
    }
    return response.data;
  },

  /**
   * Update a category
   */
  async update(
    id: string,
    data: { name?: string; icon?: string }
  ): Promise<Category> {
    const response = await apiClient.put<ApiResponse<Category>>(
      `/categories/${id}`,
      data
    );
    if (!response.data) {
      throw new Error('Failed to update category');
    }
    return response.data;
  },

  /**
   * Delete a category
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/categories/${id}`);
  },

  /**
   * Reorder categories (for custom sorting)
   */
  async reorder(categoryIds: string[]): Promise<Category[]> {
    const response = await apiClient.put<ApiResponse<Category[]>>(
      '/categories/reorder',
      { order: categoryIds }
    );
    return response.data || [];
  },
};
