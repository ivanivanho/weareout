/**
 * Consumption Intelligence Service
 * Handles burn rate calculation and consumption predictions
 */

import { pool } from '../config/database.js';

/**
 * Calculate burn rate for a specific item
 * @param {string} itemId - UUID of the item
 * @returns {Promise<{burnRate: number, confidence: number, daysRemaining: number}>}
 */
export async function calculateItemBurnRate(itemId) {
  try {
    const result = await pool.query(
      'SELECT * FROM calculate_burn_rate($1)',
      [itemId]
    );

    if (result.rows.length === 0) {
      return {
        burnRate: 0,
        confidence: 0,
        daysRemaining: null,
      };
    }

    return {
      burnRate: parseFloat(result.rows[0].burn_rate) || 0,
      confidence: parseFloat(result.rows[0].confidence) || 0,
      daysRemaining: result.rows[0].days_remaining,
    };
  } catch (error) {
    console.error(`Error calculating burn rate for item ${itemId}:`, error);
    throw new Error('Failed to calculate burn rate');
  }
}

/**
 * Update burn rate for a specific item
 * @param {string} itemId - UUID of the item
 * @returns {Promise<void>}
 */
export async function updateItemBurnRate(itemId) {
  try {
    const { burnRate, confidence, daysRemaining } = await calculateItemBurnRate(itemId);

    await pool.query(
      `UPDATE items
       SET burn_rate = $1,
           confidence_score = $2,
           days_remaining = $3,
           updated_at = NOW()
       WHERE id = $4`,
      [burnRate, confidence, daysRemaining, itemId]
    );

    return { burnRate, confidence, daysRemaining };
  } catch (error) {
    console.error(`Error updating burn rate for item ${itemId}:`, error);
    throw new Error('Failed to update burn rate');
  }
}

/**
 * Update burn rates for all items belonging to a user
 * @param {string} userId - UUID of the user
 * @returns {Promise<number>} Number of items updated
 */
export async function updateUserBurnRates(userId) {
  try {
    // Get all items for user
    const itemsResult = await pool.query(
      'SELECT id FROM items WHERE user_id = $1 AND deleted_at IS NULL',
      [userId]
    );

    let updatedCount = 0;

    // Update each item
    for (const item of itemsResult.rows) {
      try {
        await updateItemBurnRate(item.id);
        updatedCount++;
      } catch (error) {
        console.error(`Failed to update burn rate for item ${item.id}:`, error.message);
        // Continue with other items
      }
    }

    return updatedCount;
  } catch (error) {
    console.error(`Error updating burn rates for user ${userId}:`, error);
    throw new Error('Failed to update user burn rates');
  }
}

/**
 * Update burn rates for all items in the system
 * @returns {Promise<number>} Number of items updated
 */
export async function updateAllBurnRates() {
  try {
    const result = await pool.query('SELECT update_all_burn_rates()');
    return result.rows[0].update_all_burn_rates;
  } catch (error) {
    console.error('Error updating all burn rates:', error);
    throw new Error('Failed to update all burn rates');
  }
}

/**
 * Get consumption statistics for an item
 * @param {string} itemId - UUID of the item
 * @param {number} days - Number of days to look back (default: 30)
 * @returns {Promise<Object>} Consumption statistics
 */
export async function getItemConsumptionStats(itemId, days = 30) {
  try {
    const result = await pool.query(
      `SELECT
        COUNT(*) as total_events,
        SUM(CASE WHEN action_type = 'consume' THEN ABS(quantity_change) ELSE 0 END) as total_consumed,
        SUM(CASE WHEN action_type = 'restock' THEN quantity_change ELSE 0 END) as total_restocked,
        AVG(CASE WHEN action_type = 'consume' THEN ABS(quantity_change) ELSE NULL END) as avg_consumption_per_event,
        MIN(timestamp) as first_event,
        MAX(timestamp) as last_event
       FROM consumption_logs
       WHERE item_id = $1
         AND timestamp > NOW() - INTERVAL '1 day' * $2
       GROUP BY item_id`,
      [itemId, days]
    );

    if (result.rows.length === 0) {
      return {
        totalEvents: 0,
        totalConsumed: 0,
        totalRestocked: 0,
        avgConsumptionPerEvent: 0,
        firstEvent: null,
        lastEvent: null,
      };
    }

    const row = result.rows[0];
    return {
      totalEvents: parseInt(row.total_events) || 0,
      totalConsumed: parseFloat(row.total_consumed) || 0,
      totalRestocked: parseFloat(row.total_restocked) || 0,
      avgConsumptionPerEvent: parseFloat(row.avg_consumption_per_event) || 0,
      firstEvent: row.first_event,
      lastEvent: row.last_event,
    };
  } catch (error) {
    console.error(`Error getting consumption stats for item ${itemId}:`, error);
    throw new Error('Failed to get consumption statistics');
  }
}

/**
 * Get items that are predicted to run out soon
 * @param {string} userId - UUID of the user
 * @param {number} daysThreshold - Alert if item will run out within this many days
 * @returns {Promise<Array>} Array of items that will run out soon
 */
export async function getItemsRunningOutSoon(userId, daysThreshold = 7) {
  try {
    const result = await pool.query(
      `SELECT
        id,
        name,
        quantity,
        unit,
        days_remaining,
        burn_rate,
        confidence_score,
        status,
        category,
        location
       FROM items
       WHERE user_id = $1
         AND deleted_at IS NULL
         AND days_remaining IS NOT NULL
         AND days_remaining <= $2
         AND days_remaining > 0
       ORDER BY days_remaining ASC, confidence_score DESC`,
      [userId, daysThreshold]
    );

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      quantity: parseFloat(row.quantity),
      unit: row.unit,
      daysRemaining: row.days_remaining,
      burnRate: parseFloat(row.burn_rate),
      confidence: parseFloat(row.confidence_score),
      status: row.status,
      category: row.category,
      location: row.location,
    }));
  } catch (error) {
    console.error(`Error getting items running out soon for user ${userId}:`, error);
    throw new Error('Failed to get items running out soon');
  }
}

/**
 * Get consumption trends for a user
 * @param {string} userId - UUID of the user
 * @param {number} days - Number of days to analyze
 * @returns {Promise<Object>} Consumption trends
 */
export async function getUserConsumptionTrends(userId, days = 30) {
  try {
    const result = await pool.query(
      `SELECT
        DATE(timestamp) as date,
        COUNT(*) as events,
        SUM(CASE WHEN action_type = 'consume' THEN ABS(quantity_change) ELSE 0 END) as consumed,
        SUM(CASE WHEN action_type = 'restock' THEN quantity_change ELSE 0 END) as restocked
       FROM consumption_logs
       WHERE user_id = $1
         AND timestamp > NOW() - INTERVAL '1 day' * $2
       GROUP BY DATE(timestamp)
       ORDER BY date DESC`,
      [userId, days]
    );

    return result.rows.map(row => ({
      date: row.date,
      events: parseInt(row.events),
      consumed: parseFloat(row.consumed) || 0,
      restocked: parseFloat(row.restocked) || 0,
    }));
  } catch (error) {
    console.error(`Error getting consumption trends for user ${userId}:`, error);
    throw new Error('Failed to get consumption trends');
  }
}

/**
 * Get dashboard summary for user
 * @param {string} userId - UUID of the user
 * @returns {Promise<Object>} Dashboard summary with key metrics
 */
export async function getDashboardSummary(userId) {
  try {
    const result = await pool.query(
      `SELECT
        COUNT(*) as total_items,
        SUM(CASE WHEN status = 'out_of_stock' THEN 1 ELSE 0 END) as out_of_stock_count,
        SUM(CASE WHEN status = 'low_stock' THEN 1 ELSE 0 END) as low_stock_count,
        SUM(CASE WHEN days_remaining IS NOT NULL AND days_remaining <= 3 THEN 1 ELSE 0 END) as urgent_count,
        AVG(CASE WHEN confidence_score > 0 THEN confidence_score ELSE NULL END) as avg_confidence
       FROM items
       WHERE user_id = $1
         AND deleted_at IS NULL`,
      [userId]
    );

    const summary = result.rows[0];

    return {
      totalItems: parseInt(summary.total_items) || 0,
      outOfStock: parseInt(summary.out_of_stock_count) || 0,
      lowStock: parseInt(summary.low_stock_count) || 0,
      urgentItems: parseInt(summary.urgent_count) || 0,
      avgConfidence: parseFloat(summary.avg_confidence) || 0,
    };
  } catch (error) {
    console.error(`Error getting dashboard summary for user ${userId}:`, error);
    throw new Error('Failed to get dashboard summary');
  }
}

export default {
  calculateItemBurnRate,
  updateItemBurnRate,
  updateUserBurnRates,
  updateAllBurnRates,
  getItemConsumptionStats,
  getItemsRunningOutSoon,
  getUserConsumptionTrends,
  getDashboardSummary,
};
