/**
 * AI Routes
 * Endpoints for AI-powered inventory features
 * @module routes/ai
 */

import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import {
  voiceToInventory,
  cameraToInventory,
  receiptToInventory,
  aiHealthCheck,
} from '../controllers/aiController.js';

const router = express.Router();

// Configure multer for memory storage (images processed and discarded)
// No persistent storage - privacy-friendly approach
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 1, // Single file upload
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type: ${file.mimetype}. Only JPEG, PNG, WebP, and HEIC images are allowed.`
        ),
        false
      );
    }
  },
});

// All AI routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/ai/health
 * @desc    Check AI service health and configuration
 * @access  Private
 */
router.get('/health', aiHealthCheck);

/**
 * @route   POST /api/ai/voice-to-inventory
 * @desc    Process voice/text input to inventory items
 * @access  Private
 * @body    { text: string } - Transcribed voice input or text
 * @returns { success: boolean, data: { action, items }, message: string }
 */
router.post('/voice-to-inventory', voiceToInventory);

/**
 * @route   POST /api/ai/camera-to-inventory
 * @desc    Process camera image to identify items
 * @access  Private
 * @body    FormData with 'image' file (JPEG/PNG/WebP/HEIC)
 * @returns { success: boolean, data: { items }, message: string }
 */
router.post('/camera-to-inventory', upload.single('image'), cameraToInventory);

/**
 * @route   POST /api/ai/receipt-to-inventory
 * @desc    Process receipt image to extract purchase data
 * @access  Private
 * @body    FormData with 'image' file (JPEG/PNG/WebP/HEIC)
 * @returns { success: boolean, data: { storeName, purchaseDate, totalAmount, items }, message: string }
 */
router.post('/receipt-to-inventory', upload.single('image'), receiptToInventory);

// Error handler for multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size exceeds 10MB limit',
        code: 'FILE_TOO_LARGE',
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Only one file can be uploaded at a time',
        code: 'TOO_MANY_FILES',
      });
    }
    return res.status(400).json({
      success: false,
      error: error.message,
      code: 'UPLOAD_ERROR',
    });
  }

  // Pass other errors to global error handler
  next(error);
});

export default router;
