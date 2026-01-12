/**
 * AI Controller
 * Handles AI-powered inventory management features
 * @module controllers/aiController
 */

import {
  processVoiceToInventory,
  processImageToInventory,
  processReceiptToInventory,
} from '../services/geminiService.js';

/**
 * Process voice/text input to inventory items
 * Converts natural language to structured inventory data using Gemini AI
 *
 * @route   POST /api/ai/voice-to-inventory
 * @access  Private (requires authentication)
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body.text - User's voice input (transcribed to text)
 * @param {Object} req.user - Authenticated user from JWT middleware
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @returns {Object} 200 - Success with parsed inventory data
 * @returns {Object} 400 - Validation error (missing text)
 * @returns {Object} 500 - Server error
 */
export const voiceToInventory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { text } = req.body;

    console.log(`🗣️ [AI Controller] Voice input from user ${userId}:`, text);

    // Validate input
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Text input is required',
        code: 'VALIDATION_ERROR',
      });
    }

    // Process with Gemini AI
    const result = await processVoiceToInventory(text);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Voice input processed successfully',
    });
  } catch (error) {
    console.error('❌ [AI Controller] Error in voiceToInventory:', error);
    next(error);
  }
};

/**
 * Process camera image to inventory items
 * Analyzes photo to identify grocery/pantry items using Gemini Vision
 *
 * @route   POST /api/ai/camera-to-inventory
 * @access  Private (requires authentication)
 *
 * @param {Object} req - Express request object
 * @param {Object} req.file - Uploaded image file from multer middleware
 * @param {Buffer} req.file.buffer - Image buffer (memory storage)
 * @param {Object} req.user - Authenticated user from JWT middleware
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @returns {Object} 200 - Success with identified items
 * @returns {Object} 400 - Validation error (missing image)
 * @returns {Object} 500 - Server error
 */
export const cameraToInventory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    console.log(`📷 [AI Controller] Camera upload from user ${userId}`);

    // Validate image upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Image file is required',
        code: 'VALIDATION_ERROR',
      });
    }

    if (!req.file.buffer || req.file.buffer.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Image data is invalid or empty',
        code: 'VALIDATION_ERROR',
      });
    }

    console.log(`📸 [AI Controller] Processing image (${req.file.size} bytes, ${req.file.mimetype})`);

    // Process with Gemini Vision
    const result = await processImageToInventory(req.file.buffer);

    // Image is automatically discarded (memory storage) after response
    console.log(`✅ [AI Controller] Image processed, ${result.items.length} items identified`);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Image processed successfully',
    });
  } catch (error) {
    console.error('❌ [AI Controller] Error in cameraToInventory:', error);
    next(error);
  }
};

/**
 * Process receipt image to purchase history
 * Extracts items, prices, and store info from receipt using Gemini Vision
 *
 * @route   POST /api/ai/receipt-to-inventory
 * @access  Private (requires authentication)
 *
 * @param {Object} req - Express request object
 * @param {Object} req.file - Uploaded receipt image from multer
 * @param {Buffer} req.file.buffer - Image buffer (memory storage)
 * @param {Object} req.user - Authenticated user from JWT middleware
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @returns {Object} 200 - Success with receipt data
 * @returns {Object} 400 - Validation error (missing image)
 * @returns {Object} 500 - Server error
 */
export const receiptToInventory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    console.log(`🧾 [AI Controller] Receipt upload from user ${userId}`);

    // Validate image upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Receipt image is required',
        code: 'VALIDATION_ERROR',
      });
    }

    if (!req.file.buffer || req.file.buffer.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Receipt image data is invalid or empty',
        code: 'VALIDATION_ERROR',
      });
    }

    console.log(`🧾 [AI Controller] Processing receipt (${req.file.size} bytes, ${req.file.mimetype})`);

    // Process with Gemini Vision
    const result = await processReceiptToInventory(req.file.buffer);

    // Image is automatically discarded (memory storage) after response
    console.log(`✅ [AI Controller] Receipt processed from ${result.storeName}, ${result.items.length} items`);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Receipt processed successfully',
    });
  } catch (error) {
    console.error('❌ [AI Controller] Error in receiptToInventory:', error);
    next(error);
  }
};

/**
 * Health check for AI service
 * Verifies Gemini API configuration
 *
 * @route   GET /api/ai/health
 * @access  Private (requires authentication)
 */
export const aiHealthCheck = async (req, res, next) => {
  try {
    const isConfigured = !!process.env.GEMINI_API_KEY;

    res.status(200).json({
      success: true,
      data: {
        configured: isConfigured,
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest',
        status: isConfigured ? 'ready' : 'not_configured',
      },
      message: isConfigured
        ? 'AI service is ready'
        : 'AI service requires configuration',
    });
  } catch (error) {
    console.error('❌ [AI Controller] Error in aiHealthCheck:', error);
    next(error);
  }
};
