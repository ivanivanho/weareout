/**
 * Mock Data for Development
 * 
 * ⚠️ IMPORTANT: REMOVE THIS FILE IN PRODUCTION
 * 
 * This file contains all mock data used throughout the app.
 * When connecting to your backend API:
 * 
 * 1. Replace all usages of this mock data with API calls from /src/services/
 * 2. Update components to use React Query or your preferred data fetching library
 * 3. Handle loading and error states properly
 * 
 * Example migration:
 * 
 * BEFORE (using mock data):
 * ```
 * import { mockInventory } from '../data/mockData';
 * const [inventory, setInventory] = useState(mockInventory);
 * ```
 * 
 * AFTER (using API):
 * ```
 * import { inventoryService } from '../services';
 * const [inventory, setInventory] = useState<InventoryItem[]>([]);
 * const [loading, setLoading] = useState(true);
 * 
 * useEffect(() => {
 *   const fetchData = async () => {
 *     try {
 *       const data = await inventoryService.getAll();
 *       setInventory(data);
 *     } catch (error) {
 *       console.error('Failed to fetch inventory:', error);
 *     } finally {
 *       setLoading(false);
 *     }
 *   };
 *   fetchData();
 * }, []);
 * ```
 */

import type { InventoryItem, Category, Location } from '../types';

export const mockInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Milk',
    category: 'Dairy',
    location: 'Refrigerator',
    quantity: 1,
    unit: 'gallon',
    daysRemaining: 2,
    status: 'critical',
    lastUpdated: new Date().toISOString(),
    burnRate: 0.5,
  },
  {
    id: '2',
    name: 'Eggs',
    category: 'Dairy',
    location: 'Refrigerator',
    quantity: 6,
    unit: 'count',
    daysRemaining: 5,
    status: 'low',
    lastUpdated: new Date().toISOString(),
    burnRate: 1.2,
  },
  {
    id: '3',
    name: 'Bread',
    category: 'Bakery',
    location: 'Pantry',
    quantity: 1,
    unit: 'loaf',
    daysRemaining: 3,
    status: 'low',
    lastUpdated: new Date().toISOString(),
    burnRate: 0.33,
  },
  {
    id: '4',
    name: 'Coffee',
    category: 'Beverages',
    location: 'Pantry',
    quantity: 8,
    unit: 'oz',
    daysRemaining: 12,
    status: 'good',
    lastUpdated: new Date().toISOString(),
    burnRate: 0.67,
  },
  {
    id: '5',
    name: 'Butter',
    category: 'Dairy',
    location: 'Refrigerator',
    quantity: 2,
    unit: 'sticks',
    daysRemaining: 15,
    status: 'good',
    lastUpdated: new Date().toISOString(),
    burnRate: 0.13,
  },
  {
    id: '6',
    name: 'Orange Juice',
    category: 'Beverages',
    location: 'Refrigerator',
    quantity: 32,
    unit: 'oz',
    daysRemaining: 4,
    status: 'low',
    lastUpdated: new Date().toISOString(),
    burnRate: 8,
  },
  {
    id: '7',
    name: 'Chicken Breast',
    category: 'Meat',
    location: 'Freezer',
    quantity: 4,
    unit: 'lbs',
    daysRemaining: 1,
    status: 'critical',
    lastUpdated: new Date().toISOString(),
    burnRate: 4,
  },
  {
    id: '8',
    name: 'Pasta',
    category: 'Pantry Staples',
    location: 'Pantry',
    quantity: 3,
    unit: 'boxes',
    daysRemaining: 20,
    status: 'good',
    lastUpdated: new Date().toISOString(),
    burnRate: 0.15,
  },
  {
    id: '9',
    name: 'Tomato Sauce',
    category: 'Canned Goods',
    location: 'Pantry',
    quantity: 2,
    unit: 'jars',
    daysRemaining: 30,
    status: 'good',
    lastUpdated: new Date().toISOString(),
    burnRate: 0.067,
  },
  {
    id: '10',
    name: 'Spinach',
    category: 'Produce',
    location: 'Refrigerator',
    quantity: 5,
    unit: 'oz',
    daysRemaining: 2,
    status: 'critical',
    lastUpdated: new Date().toISOString(),
    burnRate: 2.5,
  },
  {
    id: '11',
    name: 'Apples',
    category: 'Produce',
    location: 'Counter',
    quantity: 6,
    unit: 'count',
    daysRemaining: 7,
    status: 'good',
    lastUpdated: new Date().toISOString(),
    burnRate: 0.86,
  },
  {
    id: '12',
    name: 'Greek Yogurt',
    category: 'Dairy',
    location: 'Refrigerator',
    quantity: 3,
    unit: 'cups',
    daysRemaining: 8,
    status: 'good',
    lastUpdated: new Date().toISOString(),
    burnRate: 0.375,
  },
];

export const mockCategories: Category[] = [
  { id: '1', name: 'Dairy', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', name: 'Produce', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', name: 'Meat', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '4', name: 'Bakery', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '5', name: 'Beverages', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '6', name: 'Pantry Staples', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '7', name: 'Canned Goods', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '8', name: 'Frozen Foods', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const mockLocations: Location[] = [
  { id: '1', name: 'Refrigerator', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', name: 'Freezer', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', name: 'Pantry', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '4', name: 'Counter', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '5', name: 'Garage', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

/**
 * Helper function to simulate API delay
 * Remove this when using real APIs
 */
export const simulateApiDelay = (ms: number = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Mock authentication user
 * Replace with actual auth from authService
 */
export const mockUser = {
  id: 'user-1',
  email: 'demo@weareout.app',
  name: 'Demo User',
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
};
