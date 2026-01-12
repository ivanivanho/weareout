export interface InventoryItem {
  id: string;
  userId: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  unit: string;
  daysRemaining: number | null;
  status: 'critical' | 'low' | 'good';
  lastUpdated: string;
  burnRate?: number;
  estimatedEmptyDate?: string;
  confidence?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseHistory {
  id: string;
  itemId: string;
  date: string;
  quantity: number;
  unit: string;
  daysAgo?: number;
  createdAt: string;
}

export interface ShoppingListItem {
  id: string;
  userId?: string;
  itemName: string;
  category?: string;
  location?: string;
  quantity?: number;
  unit?: string;
  priority: 'urgent' | 'critical' | 'low' | 'high' | 'medium';
  notes?: string;
  completed?: boolean;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  currentStock?: number;
  burnRate?: number;
  daysRemaining?: number | null;
  store?: string;
}

export interface CreateInventoryItemRequest {
  name: string;
  category: string;
  location: string;
  quantity: number;
  unit: string;
}

export interface UpdateInventoryItemRequest {
  name?: string;
  category?: string;
  location?: string;
  quantity?: number;
  unit?: string;
}

export interface CreateShoppingListItemRequest {
  itemName: string;
  category?: string;
  quantity?: number;
  unit?: string;
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
}

export interface UpdateShoppingListItemRequest {
  itemName?: string;
  category?: string;
  quantity?: number;
  unit?: string;
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
  completed?: boolean;
}

export interface InventoryStats {
  total: number;
  critical: number;
  low: number;
  good: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
