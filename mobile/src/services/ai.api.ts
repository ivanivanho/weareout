/**
 * AI API Service
 * Handles all AI-powered inventory features
 */

import apiClient, { handleApiError } from './api';

/**
 * Voice to inventory result structure
 */
export interface VoiceToInventoryResult {
  action: 'add' | 'update' | 'remove';
  items: AIInventoryItem[];
}

/**
 * AI-identified inventory item
 */
export interface AIInventoryItem {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  confidence: number;
}

/**
 * Camera/Image to inventory result structure
 */
export interface ImageToInventoryResult {
  items: AIInventoryItem[];
}

/**
 * Receipt processing result structure
 */
export interface ReceiptToInventoryResult {
  storeName: string;
  purchaseDate: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    price: number;
    category: string;
  }>;
}

/**
 * Backend API response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * AI API methods
 */
export const aiApi = {
  /**
   * Process voice/text input to structured inventory data
   * @param text - User's voice input (transcribed to text)
   * @returns Parsed inventory items with action
   */
  async processVoiceToInventory(
    text: string
  ): Promise<VoiceToInventoryResult> {
    try {
      console.log('🗣️ [AI API] Sending voice input:', text);

      const response = await apiClient.post<
        ApiResponse<VoiceToInventoryResult>
      >('/ai/voice-to-inventory', { text });

      console.log('✅ [AI API] Voice processed:', response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('❌ [AI API] Voice processing failed:', error);
      throw handleApiError(error);
    }
  },

  /**
   * Process camera image to identify inventory items
   * @param imageUri - Local URI of captured image
   * @returns Identified items with quantities
   */
  async processCameraToInventory(
    imageUri: string
  ): Promise<ImageToInventoryResult> {
    try {
      console.log('📸 [AI API] Sending camera image:', imageUri);

      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'camera-photo.jpg',
      } as any);

      const response = await apiClient.post<
        ApiResponse<ImageToInventoryResult>
      >('/ai/camera-to-inventory', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds for image processing
      });

      console.log(
        `✅ [AI API] Camera processed: ${response.data.data.items.length} items`
      );
      return response.data.data;
    } catch (error) {
      console.error('❌ [AI API] Camera processing failed:', error);
      throw handleApiError(error);
    }
  },

  /**
   * Process receipt image to extract purchase data
   * @param imageUri - Local URI of receipt image
   * @returns Receipt data with store info and items
   */
  async processReceiptToInventory(
    imageUri: string
  ): Promise<ReceiptToInventoryResult> {
    try {
      console.log('🧾 [AI API] Sending receipt image:', imageUri);

      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'receipt.jpg',
      } as any);

      const response = await apiClient.post<
        ApiResponse<ReceiptToInventoryResult>
      >('/ai/receipt-to-inventory', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds for receipt processing
      });

      console.log(
        `✅ [AI API] Receipt processed: ${response.data.data.storeName}, ${response.data.data.items.length} items`
      );
      return response.data.data;
    } catch (error) {
      console.error('❌ [AI API] Receipt processing failed:', error);
      throw handleApiError(error);
    }
  },

  /**
   * Check AI service health and configuration
   * @returns AI service status
   */
  async checkHealth(): Promise<{
    configured: boolean;
    model: string;
    status: string;
  }> {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          configured: boolean;
          model: string;
          status: string;
        }>
      >('/ai/health');

      return response.data.data;
    } catch (error) {
      console.error('❌ [AI API] Health check failed:', error);
      throw handleApiError(error);
    }
  },
};
