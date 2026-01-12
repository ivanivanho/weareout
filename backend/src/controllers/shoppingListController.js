/**
 * Shopping List Controller
 * Handles all shopping list-related business logic
 */

import { pool } from '../config/database.js';

/**
 * Get all shopping list items for a user
 * @route GET /api/shopping-list
 */
export const getShoppingListItems = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Generate shopping list from low-stock and out-of-stock inventory items
    const result = await pool.query(
      `SELECT
        id,
        name as "itemName",
        category,
        location,
        quantity as "currentStock",
        unit,
        CASE
          WHEN status = 'out_of_stock' THEN 'urgent'
          WHEN status = 'low_stock' THEN 'critical'
          ELSE 'low'
        END as "priority",
        COALESCE(burn_rate, 0) as "burnRate",
        days_remaining as "daysRemaining"
      FROM items
      WHERE user_id = $1
        AND status IN ('out_of_stock', 'low_stock')
        AND deleted_at IS NULL
      ORDER BY
        CASE status
          WHEN 'out_of_stock' THEN 1
          WHEN 'low_stock' THEN 2
          ELSE 3
        END,
        days_remaining ASC NULLS LAST,
        name ASC`,
      [userId]
    );

    // Add suggested quantity based on burn rate
    const itemsWithSuggestions = result.rows.map(item => ({
      ...item,
      quantity: item.burnRate > 0 ? Math.ceil(item.burnRate * 7) : 100, // 1 week supply or default
    }));

    res.status(200).json({
      success: true,
      data: itemsWithSuggestions,
    });
  } catch (error) {
    console.error('Error getting shopping list items:', error);
    next(error);
  }
};

/**
 * Get a single shopping list item by ID
 * @route GET /api/shopping-list/:id
 */
export const getShoppingListItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        id,
        user_id as "userId",
        item_name as "itemName",
        category,
        quantity,
        unit,
        priority,
        notes,
        completed,
        completed_at as "completedAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM shopping_list
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Shopping list item not found',
        code: 'ITEM_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error getting shopping list item:', error);
    next(error);
  }
};

/**
 * Create a new shopping list item
 * @route POST /api/shopping-list
 */
export const createShoppingListItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { itemName, category, quantity, unit, priority = 'medium', notes } = req.body;

    // Validation
    if (!itemName) {
      return res.status(400).json({
        success: false,
        error: 'Item name is required',
        code: 'VALIDATION_ERROR',
        errors: {
          itemName: 'Item name is required',
        },
      });
    }

    const result = await pool.query(
      `INSERT INTO shopping_list (
        user_id, item_name, category, quantity, unit, priority, notes, completed
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, false)
      RETURNING
        id,
        user_id as "userId",
        item_name as "itemName",
        category,
        quantity,
        unit,
        priority,
        notes,
        completed,
        completed_at as "completedAt",
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      [userId, itemName, category, quantity, unit, priority, notes]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Shopping list item created successfully',
    });
  } catch (error) {
    console.error('Error creating shopping list item:', error);
    next(error);
  }
};

/**
 * Update a shopping list item
 * @route PUT /api/shopping-list/:id
 */
export const updateShoppingListItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { itemName, category, quantity, unit, priority, notes, completed } = req.body;

    // Check if item exists and belongs to user
    const checkResult = await pool.query(
      'SELECT id FROM shopping_list WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Shopping list item not found',
        code: 'ITEM_NOT_FOUND',
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let valueIndex = 1;

    if (itemName !== undefined) {
      updates.push(`item_name = $${valueIndex++}`);
      values.push(itemName);
    }
    if (category !== undefined) {
      updates.push(`category = $${valueIndex++}`);
      values.push(category);
    }
    if (quantity !== undefined) {
      updates.push(`quantity = $${valueIndex++}`);
      values.push(quantity);
    }
    if (unit !== undefined) {
      updates.push(`unit = $${valueIndex++}`);
      values.push(unit);
    }
    if (priority !== undefined) {
      updates.push(`priority = $${valueIndex++}`);
      values.push(priority);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${valueIndex++}`);
      values.push(notes);
    }
    if (completed !== undefined) {
      updates.push(`completed = $${valueIndex++}`);
      values.push(completed);
      if (completed) {
        updates.push(`completed_at = NOW()`);
      } else {
        updates.push(`completed_at = NULL`);
      }
    }

    updates.push(`updated_at = NOW()`);

    values.push(id, userId);

    const result = await pool.query(
      `UPDATE shopping_list
      SET ${updates.join(', ')}
      WHERE id = $${valueIndex++} AND user_id = $${valueIndex++} AND deleted_at IS NULL
      RETURNING
        id,
        user_id as "userId",
        item_name as "itemName",
        category,
        quantity,
        unit,
        priority,
        notes,
        completed,
        completed_at as "completedAt",
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      values
    );

    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Shopping list item updated successfully',
    });
  } catch (error) {
    console.error('Error updating shopping list item:', error);
    next(error);
  }
};

/**
 * Delete a shopping list item (soft delete)
 * @route DELETE /api/shopping-list/:id
 */
export const deleteShoppingListItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE shopping_list
      SET deleted_at = NOW()
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
      RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Shopping list item not found',
        code: 'ITEM_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Shopping list item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting shopping list item:', error);
    next(error);
  }
};

/**
 * Mark a shopping list item as completed
 * @route PATCH /api/shopping-list/:id/complete
 */
export const completeShoppingListItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE shopping_list
      SET completed = true, completed_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
      RETURNING
        id,
        user_id as "userId",
        item_name as "itemName",
        category,
        quantity,
        unit,
        priority,
        notes,
        completed,
        completed_at as "completedAt",
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Shopping list item not found',
        code: 'ITEM_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Shopping list item marked as completed',
    });
  } catch (error) {
    console.error('Error completing shopping list item:', error);
    next(error);
  }
};

/**
 * Mark a shopping list item as incomplete
 * @route PATCH /api/shopping-list/:id/uncomplete
 */
export const uncompleteShoppingListItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE shopping_list
      SET completed = false, completed_at = NULL, updated_at = NOW()
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
      RETURNING
        id,
        user_id as "userId",
        item_name as "itemName",
        category,
        quantity,
        unit,
        priority,
        notes,
        completed,
        completed_at as "completedAt",
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Shopping list item not found',
        code: 'ITEM_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Shopping list item marked as incomplete',
    });
  } catch (error) {
    console.error('Error uncompleting shopping list item:', error);
    next(error);
  }
};

/**
 * Clear all completed items from shopping list
 * @route DELETE /api/shopping-list/completed
 */
export const clearCompletedItems = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE shopping_list
      SET deleted_at = NOW()
      WHERE user_id = $1 AND completed = true AND deleted_at IS NULL
      RETURNING id`,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: `${result.rows.length} completed items removed from shopping list`,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error clearing completed items:', error);
    next(error);
  }
};
