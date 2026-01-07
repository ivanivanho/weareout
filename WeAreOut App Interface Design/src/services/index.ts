/**
 * Services Index
 * 
 * Centralized export of all API services
 */

export { apiClient, ApiError } from './api';
export { inventoryService } from './inventory.service';
export { categoryService } from './category.service';
export { locationService } from './location.service';
export { authService } from './auth.service';
export { receiptService } from './receipt.service';
export { shoppingService } from './shopping.service';

// Re-export types
export type * from '../types';
