/**
 * Shopping List Service
 * 
 * API functions for managing shopping list
 * 
 * BACKEND ENDPOINTS NEEDED:
 * - GET    /shopping-list        - Get shopping list items
 * - POST   /shopping-list        - Add item to shopping list
 * - PUT    /shopping-list/:id    - Update shopping list item
 * - DELETE /shopping-list/:id    - Remove item from list
 * - POST   /shopping-list/:id/purchase - Mark item as purchased
 * - POST   /shopping-list/generate     - Auto-generate list from low stock items
 */

import { apiClient } from './api';
import type { ShoppingListItem, ApiResponse } from '../types';

export const shoppingService = {
  /**
   * Get all shopping list items
   */
  async getAll(params?: {
    purchased?: boolean;
  }): Promise<ShoppingListItem[]> {
    const response = await apiClient.get<ApiResponse<ShoppingListItem[]>>(
      '/shopping-list',
      { params }
    );
    return response.data || [];
  },

  /**
   * Add item to shopping list
   */
  async addItem(data: {
    inventoryItemId: string;
    suggestedQuantity: number;
  }): Promise<ShoppingListItem> {
    const response = await apiClient.post<ApiResponse<ShoppingListItem>>(
      '/shopping-list',
      data
    );
    if (!response.data) {
      throw new Error('Failed to add item to shopping list');
    }
    return response.data;
  },

  /**
   * Update shopping list item
   */
  async updateItem(
    id: string,
    data: { suggestedQuantity?: number }
  ): Promise<ShoppingListItem> {
    const response = await apiClient.put<ApiResponse<ShoppingListItem>>(
      `/shopping-list/${id}`,
      data
    );
    if (!response.data) {
      throw new Error('Failed to update shopping list item');
    }
    return response.data;
  },

  /**
   * Remove item from shopping list
   */
  async removeItem(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/shopping-list/${id}`);
  },

  /**
   * Mark item as purchased
   */
  async markPurchased(id: string, purchased: boolean = true): Promise<ShoppingListItem> {
    const response = await apiClient.post<ApiResponse<ShoppingListItem>>(
      `/shopping-list/${id}/purchase`,
      { purchased }
    );
    if (!response.data) {
      throw new Error('Failed to mark item as purchased');
    }
    return response.data;
  },

  /**
   * Auto-generate shopping list from low/critical stock items
   */
  async generateList(): Promise<ShoppingListItem[]> {
    const response = await apiClient.post<ApiResponse<ShoppingListItem[]>>(
      '/shopping-list/generate'
    );
    return response.data || [];
  },
};
