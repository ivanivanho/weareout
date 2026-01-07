/**
 * Location Service
 * 
 * API functions for managing locations
 * 
 * BACKEND ENDPOINTS NEEDED:
 * - GET    /locations           - Get all locations
 * - POST   /locations           - Create new location
 * - PUT    /locations/:id       - Update location
 * - DELETE /locations/:id       - Delete location
 * - PUT    /locations/reorder   - Reorder locations
 */

import { apiClient } from './api';
import type { Location, ApiResponse } from '../types';

export const locationService = {
  /**
   * Get all locations
   */
  async getAll(): Promise<Location[]> {
    const response = await apiClient.get<ApiResponse<Location[]>>('/locations');
    return response.data || [];
  },

  /**
   * Create a new location
   */
  async create(data: { name: string; icon?: string }): Promise<Location> {
    const response = await apiClient.post<ApiResponse<Location>>(
      '/locations',
      data
    );
    if (!response.data) {
      throw new Error('Failed to create location');
    }
    return response.data;
  },

  /**
   * Update a location
   */
  async update(
    id: string,
    data: { name?: string; icon?: string }
  ): Promise<Location> {
    const response = await apiClient.put<ApiResponse<Location>>(
      `/locations/${id}`,
      data
    );
    if (!response.data) {
      throw new Error('Failed to update location');
    }
    return response.data;
  },

  /**
   * Delete a location
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/locations/${id}`);
  },

  /**
   * Reorder locations (for custom sorting)
   */
  async reorder(locationIds: string[]): Promise<Location[]> {
    const response = await apiClient.put<ApiResponse<Location[]>>(
      '/locations/reorder',
      { order: locationIds }
    );
    return response.data || [];
  },
};
