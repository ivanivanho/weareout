/**
 * Authentication Routes
 * Routes for user authentication and authorization
 * @module routes/auth
 */

import express from 'express';
import {
  register,
  login,
  logout,
  refresh,
  getCurrentUser,
  verifyEmail,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    {email, password, fullName}
 * @returns {user, tokens}
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return tokens
 * @access  Public
 * @body    {email, password}
 * @returns {user, tokens}
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and blacklist current token
 * @access  Protected
 * @headers {Authorization: Bearer <token>}
 * @body    {refreshToken} (optional)
 * @returns {message}
 */
router.post('/logout', authenticate, logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 * @body    {refreshToken}
 * @returns {user, tokens}
 */
router.post('/refresh', refresh);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Protected
 * @headers {Authorization: Bearer <token>}
 * @returns {user}
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify user email with verification token
 * @access  Public
 * @body    {token}
 * @returns {user}
 */
router.post('/verify-email', verifyEmail);

/**
 * Health check endpoint for auth routes
 * @route   GET /api/auth/health
 * @desc    Check if auth service is running
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth service is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
