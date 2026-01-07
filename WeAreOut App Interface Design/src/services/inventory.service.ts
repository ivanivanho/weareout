/**
 * Inventory Service
 * 
 * API functions for managing inventory items
 * 
 * BACKEND ENDPOINTS NEEDED:
 * - GET    /inventory           - Get all inventory items
 * - GET    /inventory/:id       - Get single item
 * - POST   /inventory           - Create new item
 * - PUT    /inventory/:id       - Update item
 * - DELETE /inventory/:id       - Delete item
 * - GET    /inventory/search    - Search inventory
 * - POST   /inventory/bulk      - Bulk update items
 */

import { apiClient } from './api';
import type {
  InventoryItem,
  CreateItemRequest,
  UpdateItemRequest,
  ApiResponse,
  PaginatedResponse,
} from '../types';

export const inventoryService = {
  /**
   * Get all inventory items
   */
  async getAll(params?: {
    category?: string;
    location?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<InventoryItem[]> {
    const response = await apiClient.get<ApiResponse<InventoryItem[]>>(
      '/inventory',
      { params }
    );
    return response.data || [];
  },

  /**
   * Get a single inventory item by ID
   */
  async getById(id: string): Promise<InventoryItem> {
    const response = await apiClient.get<ApiResponse<InventoryItem>>(
      `/inventory/${id}`
    );
    if (!response.data) {
      throw new Error('Item not found');
    }
    return response.data;
  },

  /**
   * Create a new inventory item
   */
  async create(data: CreateItemRequest): Promise<InventoryItem> {
    const response = await apiClient.post<ApiResponse<InventoryItem>>(
      '/inventory',
      data
    );
    if (!response.data) {
      throw new Error('Failed to create item');
    }
    return response.data;
  },

  /**
   * Update an existing inventory item
   */
  async update(id: string, data: UpdateItemRequest): Promise<InventoryItem> {
    const response = await apiClient.put<ApiResponse<InventoryItem>>(
      `/inventory/${id}`,
      data
    );
    if (!response.data) {
      throw new Error('Failed to update item');
    }
    return response.data;
  },

  /**
   * Delete an inventory item
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/inventory/${id}`);
  },

  /**
   * Search inventory items
   */
  async search(query: string): Promise<InventoryItem[]> {
    const response = await apiClient.get<ApiResponse<InventoryItem[]>>(
      '/inventory/search',
      { params: { q: query } }
    );
    return response.data || [];
  },

  /**
   * Bulk update inventory items (e.g., after receipt scanning)
   */
  async bulkUpdate(
    updates: Array<{ id?: string; data: CreateItemRequest | UpdateItemRequest }>
  ): Promise<InventoryItem[]> {
    const response = await apiClient.post<ApiResponse<InventoryItem[]>>(
      '/inventory/bulk',
      { updates }
    );
    return response.data || [];
  },

  /**
   * Get AI-generated summary and insights
   */
  async getAISummary(): Promise<{
    criticalItems: number;
    lowItems: number;
    totalItems: number;
    insights: { daily: string[]; weekly: string[] };
    recommendations: string[];
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        criticalItems: number;
        lowItems: number;
        totalItems: number;
        insights: { daily: string[]; weekly: string[] };
        recommendations: string[];
      }>
    >('/inventory/ai-summary');
    if (!response.data) {
      throw new Error('Failed to get AI summary');
    }
    return response.data;
  },
};
