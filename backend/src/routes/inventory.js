/**
 * Inventory Routes
 * @module routes/inventory
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getInventoryStats,
  getPurchaseHistory,
  getItemConsumption,
  getDashboard,
  getRunningOutSoon,
} from '../controllers/inventoryController.js';

const router = express.Router();

// All inventory routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/inventory/dashboard/summary
 * @desc    Get dashboard summary with consumption intelligence
 * @access  Private
 */
router.get('/dashboard/summary', getDashboard);

/**
 * @route   GET /api/inventory/running-out
 * @desc    Get items running out soon
 * @access  Private
 */
router.get('/running-out', getRunningOutSoon);

/**
 * @route   GET /api/inventory/stats
 * @desc    Get inventory statistics
 * @access  Private
 */
router.get('/stats', getInventoryStats);

/**
 * @route   GET /api/inventory
 * @desc    Get all inventory items for the current user
 * @access  Private
 */
router.get('/', getInventoryItems);

/**
 * @route   GET /api/inventory/:id
 * @desc    Get a single inventory item by ID
 * @access  Private
 */
router.get('/:id', getInventoryItem);

/**
 * @route   GET /api/inventory/:id/purchases
 * @desc    Get purchase history for an item
 * @access  Private
 */
router.get('/:id/purchases', getPurchaseHistory);

/**
 * @route   GET /api/inventory/:id/consumption
 * @desc    Get consumption intelligence for an item
 * @access  Private
 */
router.get('/:id/consumption', getItemConsumption);

/**
 * @route   POST /api/inventory
 * @desc    Create a new inventory item
 * @access  Private
 */
router.post('/', createInventoryItem);

/**
 * @route   PUT /api/inventory/:id
 * @desc    Update an inventory item
 * @access  Private
 */
router.put('/:id', updateInventoryItem);

/**
 * @route   DELETE /api/inventory/:id
 * @desc    Delete an inventory item (soft delete)
 * @access  Private
 */
router.delete('/:id', deleteInventoryItem);

export default router;
