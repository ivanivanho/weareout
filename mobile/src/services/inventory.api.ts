import apiClient, { handleApiError } from './api';
import {
  InventoryItem,
  PurchaseHistory,
  ShoppingListItem,
  CreateInventoryItemRequest,
  UpdateInventoryItemRequest,
  CreateShoppingListItemRequest,
  UpdateShoppingListItemRequest,
  InventoryStats,
  ApiResponse,
  PaginatedResponse,
} from '../types/inventory';

/**
 * Inventory API Service
 * Handles all inventory-related API calls
 */
export const inventoryApi = {
  /**
   * Get all inventory items for the current user
   */
  async getInventoryItems(): Promise<InventoryItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<InventoryItem[]>>('/inventory');
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get a single inventory item by ID
   */
  async getInventoryItem(id: string): Promise<InventoryItem> {
    try {
      const response = await apiClient.get<ApiResponse<InventoryItem>>(`/inventory/${id}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Create a new inventory item
   */
  async createInventoryItem(data: CreateInventoryItemRequest): Promise<InventoryItem> {
    try {
      const response = await apiClient.post<ApiResponse<InventoryItem>>('/inventory', data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update an existing inventory item
   */
  async updateInventoryItem(id: string, data: UpdateInventoryItemRequest): Promise<InventoryItem> {
    try {
      const response = await apiClient.put<ApiResponse<InventoryItem>>(`/inventory/${id}`, data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete an inventory item
   */
  async deleteInventoryItem(id: string): Promise<void> {
    try {
      await apiClient.delete(`/inventory/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get inventory statistics
   */
  async getInventoryStats(): Promise<InventoryStats> {
    try {
      const response = await apiClient.get<ApiResponse<InventoryStats>>('/inventory/stats');
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get purchase history for an item
   */
  async getPurchaseHistory(itemId: string): Promise<PurchaseHistory[]> {
    try {
      const response = await apiClient.get<ApiResponse<PurchaseHistory[]>>(
        `/inventory/${itemId}/purchases`
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

/**
 * Shopping List API Service
 * Handles all shopping list-related API calls
 */
export const shoppingListApi = {
  /**
   * Get all shopping list items for the current user
   */
  async getShoppingListItems(): Promise<ShoppingListItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<ShoppingListItem[]>>('/shopping-list');
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get a single shopping list item by ID
   */
  async getShoppingListItem(id: string): Promise<ShoppingListItem> {
    try {
      const response = await apiClient.get<ApiResponse<ShoppingListItem>>(`/shopping-list/${id}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Create a new shopping list item
   */
  async createShoppingListItem(data: CreateShoppingListItemRequest): Promise<ShoppingListItem> {
    try {
      const response = await apiClient.post<ApiResponse<ShoppingListItem>>('/shopping-list', data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update an existing shopping list item
   */
  async updateShoppingListItem(
    id: string,
    data: UpdateShoppingListItemRequest
  ): Promise<ShoppingListItem> {
    try {
      const response = await apiClient.put<ApiResponse<ShoppingListItem>>(
        `/shopping-list/${id}`,
        data
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete a shopping list item
   */
  async deleteShoppingListItem(id: string): Promise<void> {
    try {
      await apiClient.delete(`/shopping-list/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Mark a shopping list item as completed
   */
  async completeShoppingListItem(id: string): Promise<ShoppingListItem> {
    try {
      const response = await apiClient.patch<ApiResponse<ShoppingListItem>>(
        `/shopping-list/${id}/complete`
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Mark a shopping list item as incomplete
   */
  async uncompleteShoppingListItem(id: string): Promise<ShoppingListItem> {
    try {
      const response = await apiClient.patch<ApiResponse<ShoppingListItem>>(
        `/shopping-list/${id}/uncomplete`
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Clear all completed items from shopping list
   */
  async clearCompletedItems(): Promise<void> {
    try {
      await apiClient.delete('/shopping-list/completed');
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
