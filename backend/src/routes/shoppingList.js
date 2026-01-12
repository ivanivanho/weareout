/**
 * Shopping List Routes
 * @module routes/shoppingList
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getShoppingListItems,
  getShoppingListItem,
  createShoppingListItem,
  updateShoppingListItem,
  deleteShoppingListItem,
  completeShoppingListItem,
  uncompleteShoppingListItem,
  clearCompletedItems,
} from '../controllers/shoppingListController.js';

const router = express.Router();

// All shopping list routes require authentication
router.use(authenticate);

/**
 * @route   DELETE /api/shopping-list/completed
 * @desc    Clear all completed items from shopping list
 * @access  Private
 */
router.delete('/completed', clearCompletedItems);

/**
 * @route   GET /api/shopping-list
 * @desc    Get all shopping list items for the current user
 * @access  Private
 */
router.get('/', getShoppingListItems);

/**
 * @route   GET /api/shopping-list/:id
 * @desc    Get a single shopping list item by ID
 * @access  Private
 */
router.get('/:id', getShoppingListItem);

/**
 * @route   POST /api/shopping-list
 * @desc    Create a new shopping list item
 * @access  Private
 */
router.post('/', createShoppingListItem);

/**
 * @route   PUT /api/shopping-list/:id
 * @desc    Update a shopping list item
 * @access  Private
 */
router.put('/:id', updateShoppingListItem);

/**
 * @route   PATCH /api/shopping-list/:id/complete
 * @desc    Mark a shopping list item as completed
 * @access  Private
 */
router.patch('/:id/complete', completeShoppingListItem);

/**
 * @route   PATCH /api/shopping-list/:id/uncomplete
 * @desc    Mark a shopping list item as incomplete
 * @access  Private
 */
router.patch('/:id/uncomplete', uncompleteShoppingListItem);

/**
 * @route   DELETE /api/shopping-list/:id
 * @desc    Delete a shopping list item (soft delete)
 * @access  Private
 */
router.delete('/:id', deleteShoppingListItem);

export default router;
