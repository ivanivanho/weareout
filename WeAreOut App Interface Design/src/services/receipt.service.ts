/**
 * Receipt Service
 * 
 * API functions for receipt scanning and processing
 * 
 * BACKEND ENDPOINTS NEEDED:
 * - POST   /receipts/upload      - Upload receipt image
 * - GET    /receipts/:id         - Get receipt details
 * - GET    /receipts             - Get all receipts
 * - POST   /receipts/:id/process - Process/parse receipt with AI
 * - POST   /receipts/:id/confirm - Confirm parsed items and add to inventory
 * - DELETE /receipts/:id         - Delete receipt
 * 
 * INTEGRATION NOTES:
 * - Uses Gemini Vision API for parsing receipt images
 * - Backend should handle email receipt scraping
 * - Should return structured data (items, quantities, prices)
 */

import { apiClient } from './api';
import type { Receipt, ReceiptItem, ApiResponse } from '../types';

export const receiptService = {
  /**
   * Upload a receipt photo for processing
   */
  async uploadPhoto(file: File): Promise<Receipt> {
    const formData = new FormData();
    formData.append('receipt', file);
    formData.append('source', 'photo');

    const response = await apiClient.upload<ApiResponse<Receipt>>(
      '/receipts/upload',
      formData
    );
    if (!response.data) {
      throw new Error('Failed to upload receipt');
    }
    return response.data;
  },

  /**
   * Process receipt from email
   */
  async processEmail(emailData: {
    from: string;
    subject: string;
    body: string;
    attachmentUrls: string[];
  }): Promise<Receipt> {
    const response = await apiClient.post<ApiResponse<Receipt>>(
      '/receipts/email',
      emailData
    );
    if (!response.data) {
      throw new Error('Failed to process email receipt');
    }
    return response.data;
  },

  /**
   * Get all receipts
   */
  async getAll(params?: {
    processed?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<Receipt[]> {
    const response = await apiClient.get<ApiResponse<Receipt[]>>(
      '/receipts',
      { params }
    );
    return response.data || [];
  },

  /**
   * Get a single receipt by ID
   */
  async getById(id: string): Promise<Receipt> {
    const response = await apiClient.get<ApiResponse<Receipt>>(
      `/receipts/${id}`
    );
    if (!response.data) {
      throw new Error('Receipt not found');
    }
    return response.data;
  },

  /**
   * Trigger AI processing of a receipt
   */
  async processReceipt(id: string): Promise<Receipt> {
    const response = await apiClient.post<ApiResponse<Receipt>>(
      `/receipts/${id}/process`
    );
    if (!response.data) {
      throw new Error('Failed to process receipt');
    }
    return response.data;
  },

  /**
   * Confirm parsed items and add to inventory
   */
  async confirmItems(
    id: string,
    items: ReceiptItem[]
  ): Promise<{ receipt: Receipt; inventoryUpdates: number }> {
    const response = await apiClient.post<
      ApiResponse<{ receipt: Receipt; inventoryUpdates: number }>
    >(`/receipts/${id}/confirm`, { items });
    if (!response.data) {
      throw new Error('Failed to confirm items');
    }
    return response.data;
  },

  /**
   * Delete a receipt
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/receipts/${id}`);
  },
};
