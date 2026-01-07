/**
 * Core Data Types for WeAreOut
 * 
 * These types should match your backend API models
 */

export type ItemStatus = 'good' | 'low' | 'critical';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  unit: string;
  daysRemaining: number;
  status: ItemStatus;
  lastUpdated: string;
  burnRate?: number; // Items consumed per day
  autoReorderEnabled?: boolean;
  reorderThreshold?: number; // Days remaining to trigger reorder
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  name: string;
  icon?: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  lastLogin: string;
}

export interface Receipt {
  id: string;
  userId: string;
  source: 'email' | 'photo';
  imageUrl?: string;
  parsedItems: ReceiptItem[];
  storeName?: string;
  purchaseDate: string;
  totalAmount?: number;
  processed: boolean;
  createdAt: string;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  unit?: string;
  price?: number;
  matchedInventoryId?: string; // If matched to existing inventory item
  category?: string;
}

export interface ShoppingListItem {
  id: string;
  inventoryItemId: string;
  itemName: string;
  category: string;
  suggestedQuantity: number;
  unit: string;
  priority: 'critical' | 'high' | 'medium';
  addedAt: string;
  purchased: boolean;
}

export interface AISummary {
  date: string;
  criticalItems: number;
  lowItems: number;
  totalItems: number;
  insights: {
    daily: string[];
    weekly: string[];
  };
  recommendations: string[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// API Request types
export interface CreateItemRequest {
  name: string;
  category: string;
  location: string;
  quantity: number;
  unit: string;
  burnRate?: number;
  autoReorderEnabled?: boolean;
  reorderThreshold?: number;
}

export interface UpdateItemRequest {
  name?: string;
  category?: string;
  location?: string;
  quantity?: number;
  unit?: string;
  burnRate?: number;
  autoReorderEnabled?: boolean;
  reorderThreshold?: number;
}

export interface UploadReceiptRequest {
  source: 'email' | 'photo';
  image?: File;
  emailData?: {
    from: string;
    subject: string;
    body: string;
    attachments: string[];
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}
