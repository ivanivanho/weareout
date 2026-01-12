/**
 * Inventory Controller
 * Handles all inventory-related business logic
 */

import { pool } from '../config/database.js';
import {
  updateItemBurnRate,
  getItemConsumptionStats,
  getDashboardSummary,
  getItemsRunningOutSoon,
} from '../services/consumptionIntelligence.js';

/**
 * Helper function to map database status to app status
 */
const mapStatus = (dbStatus, quantity, lowThreshold) => {
  if (dbStatus === 'out_of_stock' || quantity === 0) return 'critical';
  if (dbStatus === 'low_stock') return 'low';
  return 'good';
};

/**
 * Get all inventory items for a user
 * @route GET /api/inventory
 */
export const getInventoryItems = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
        id,
        user_id as "userId",
        name,
        category,
        location,
        quantity,
        unit,
        status,
        low_stock_threshold as "lowStockThreshold",
        burn_rate as "burnRate",
        days_remaining as "daysRemaining",
        confidence_score as "confidence",
        updated_at as "lastUpdated",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM items
      WHERE user_id = $1
        AND deleted_at IS NULL
      ORDER BY
        CASE
          WHEN status = 'out_of_stock' THEN 1
          WHEN status = 'low_stock' THEN 2
          WHEN status = 'in_stock' THEN 3
          ELSE 4
        END,
        name ASC`,
      [userId]
    );

    // Transform data to match app format
    const transformedData = result.rows.map(item => ({
      ...item,
      status: mapStatus(item.status, parseFloat(item.quantity), parseFloat(item.lowStockThreshold)),
      burnRate: parseFloat(item.burnRate) || 0,
      daysRemaining: item.daysRemaining,
      confidence: parseFloat(item.confidence) || 0,
    }));

    res.status(200).json({
      success: true,
      data: transformedData,
    });
  } catch (error) {
    console.error('Error getting inventory items:', error);
    next(error);
  }
};

/**
 * Get a single inventory item by ID
 * @route GET /api/inventory/:id
 */
export const getInventoryItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        id,
        user_id as "userId",
        name,
        category,
        location,
        quantity,
        unit,
        status,
        low_stock_threshold as "lowStockThreshold",
        burn_rate as "burnRate",
        days_remaining as "daysRemaining",
        confidence_score as "confidence",
        updated_at as "lastUpdated",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM items
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found',
        code: 'ITEM_NOT_FOUND',
      });
    }

    const item = result.rows[0];
    const transformedItem = {
      ...item,
      status: mapStatus(item.status, parseFloat(item.quantity), parseFloat(item.lowStockThreshold)),
      burnRate: parseFloat(item.burnRate) || 0,
      daysRemaining: item.daysRemaining,
      confidence: parseFloat(item.confidence) || 0,
    };

    res.status(200).json({
      success: true,
      data: transformedItem,
    });
  } catch (error) {
    console.error('Error getting inventory item:', error);
    next(error);
  }
};

/**
 * Create a new inventory item
 * @route POST /api/inventory
 */
export const createInventoryItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, category, location, quantity, unit } = req.body;

    // Validation
    if (!name || !category || !location || quantity === undefined || !unit) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        code: 'VALIDATION_ERROR',
        errors: {
          name: !name ? 'Name is required' : undefined,
          category: !category ? 'Category is required' : undefined,
          location: !location ? 'Location is required' : undefined,
          quantity: quantity === undefined ? 'Quantity is required' : undefined,
          unit: !unit ? 'Unit is required' : undefined,
        },
      });
    }

    const result = await pool.query(
      `INSERT INTO items (
        user_id, name, category, location, quantity, unit, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'in_stock')
      RETURNING
        id,
        user_id as "userId",
        name,
        category,
        location,
        quantity,
        unit,
        status,
        low_stock_threshold as "lowStockThreshold",
        updated_at as "lastUpdated",
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      [userId, name, category, location, quantity, unit]
    );

    const item = result.rows[0];

    // Update burn rate for the new item after creation
    try {
      await updateItemBurnRate(item.id);
    } catch (error) {
      console.error('Failed to calculate initial burn rate:', error.message);
      // Continue even if burn rate calculation fails
    }

    const transformedItem = {
      ...item,
      status: mapStatus(item.status, parseFloat(item.quantity), parseFloat(item.lowStockThreshold)),
      burnRate: 0,
      daysRemaining: null,
      confidence: 0,
    };

    res.status(201).json({
      success: true,
      data: transformedItem,
      message: 'Inventory item created successfully',
    });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    next(error);
  }
};

/**
 * Update an inventory item
 * @route PUT /api/inventory/:id
 */
export const updateInventoryItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, category, location, quantity, unit } = req.body;

    // Check if item exists and belongs to user
    const checkResult = await pool.query(
      'SELECT id FROM items WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found',
        code: 'ITEM_NOT_FOUND',
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let valueIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${valueIndex++}`);
      values.push(name);
    }
    if (category !== undefined) {
      updates.push(`category = $${valueIndex++}`);
      values.push(category);
    }
    if (location !== undefined) {
      updates.push(`location = $${valueIndex++}`);
      values.push(location);
    }
    if (quantity !== undefined) {
      updates.push(`quantity = $${valueIndex++}`);
      values.push(quantity);
    }
    if (unit !== undefined) {
      updates.push(`unit = $${valueIndex++}`);
      values.push(unit);
    }

    updates.push(`last_updated = NOW()`);
    updates.push(`updated_at = NOW()`);

    values.push(id, userId);

    const result = await pool.query(
      `UPDATE items
      SET ${updates.join(', ')}
      WHERE id = $${valueIndex++} AND user_id = $${valueIndex++} 
      RETURNING
        id,
        user_id as "userId",
        name,
        category,
        location,
        quantity,
        unit,
        days_remaining as "daysRemaining",
        status,
        last_updated as "lastUpdated",
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      values
    );

    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Inventory item updated successfully',
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    next(error);
  }
};

/**
 * Delete an inventory item (soft delete)
 * @route DELETE /api/inventory/:id
 */
export const deleteInventoryItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE items
      SET deleted_at = NOW()
      WHERE id = $1 AND user_id = $2 
      RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found',
        code: 'ITEM_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inventory item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    next(error);
  }
};

/**
 * Get inventory statistics
 * @route GET /api/inventory/stats
 */
export const getInventoryStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'out_of_stock') as critical,
        COUNT(*) FILTER (WHERE status = 'low_stock') as low,
        COUNT(*) FILTER (WHERE status = 'in_stock') as good
      FROM items
      WHERE user_id = $1`,
      [userId]
    );

    const stats = {
      total: parseInt(result.rows[0].total),
      critical: parseInt(result.rows[0].critical),
      low: parseInt(result.rows[0].low),
      good: parseInt(result.rows[0].good),
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting inventory stats:', error);
    next(error);
  }
};

/**
 * Get purchase history for an item
 * @route GET /api/inventory/:id/purchases
 */
export const getPurchaseHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if item exists and belongs to user
    const checkResult = await pool.query(
      'SELECT id FROM items WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found',
        code: 'ITEM_NOT_FOUND',
      });
    }

    const result = await pool.query(
      `SELECT
        id,
        item_id as "itemId",
        purchase_date as date,
        quantity,
        unit,
        created_at as "createdAt"
      FROM purchase_history
      WHERE item_id = $1
      ORDER BY purchase_date DESC
      LIMIT 50`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error getting purchase history:', error);
    next(error);
  }
};

/**
 * Get consumption intelligence data for an item
 * @route GET /api/inventory/:id/consumption
 */
export const getItemConsumption = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const days = parseInt(req.query.days) || 30;

    // Check if item exists and belongs to user
    const checkResult = await pool.query(
      'SELECT id FROM items WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found',
        code: 'ITEM_NOT_FOUND',
      });
    }

    // Get consumption stats
    const stats = await getItemConsumptionStats(id, days);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting item consumption:', error);
    next(error);
  }
};

/**
 * Get dashboard summary with consumption intelligence
 * @route GET /api/inventory/dashboard/summary
 */
export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get summary statistics
    const summary = await getDashboardSummary(userId);

    // Get items running out soon
    const runningOutSoon = await getItemsRunningOutSoon(userId, 7);

    res.status(200).json({
      success: true,
      data: {
        summary,
        runningOutSoon,
      },
    });
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    next(error);
  }
};

/**
 * Get items running out soon
 * @route GET /api/inventory/running-out
 */
export const getRunningOutSoon = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 7;

    const items = await getItemsRunningOutSoon(userId, days);

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Error getting items running out soon:', error);
    next(error);
  }
};
