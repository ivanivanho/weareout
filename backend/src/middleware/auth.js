/**
 * Authentication Middleware
 * JWT verification and route protection
 * @module middleware/auth
 */

import { verifyToken } from '../utils/jwt.js';
import { query } from '../config/database.js';

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and attaches user to request object
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export async function authenticate(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header missing',
        code: 'NO_TOKEN',
      });
    }

    // Check if header follows "Bearer <token>" format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: 'Invalid authorization header format. Expected: Bearer <token>',
        code: 'INVALID_TOKEN_FORMAT',
      });
    }

    const token = parts[1];

    // Verify token
    const decoded = await verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN',
      });
    }

    // Check if token is blacklisted
    const blacklistCheck = await query(
      'SELECT id FROM token_blacklist WHERE token_jti = $1 AND expires_at > NOW()',
      [decoded.jti]
    );

    if (blacklistCheck.rows.length > 0) {
      return res.status(401).json({
        success: false,
        error: 'Token has been revoked',
        code: 'TOKEN_REVOKED',
      });
    }

    // Fetch user from database to ensure they still exist and are active
    const userResult = await query(
      'SELECT id, email, full_name, is_active, is_verified FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    const user = userResult.rows[0];

    // Check if user account is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Account has been deactivated',
        code: 'ACCOUNT_INACTIVE',
      });
    }

    // Attach user and token info to request object
    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      isVerified: user.is_verified,
      isActive: user.is_active,
    };

    req.token = {
      jti: decoded.jti,
      iat: decoded.iat,
      exp: decoded.exp,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token has expired',
        code: 'TOKEN_EXPIRED',
        expiredAt: error.expiredAt,
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      error: 'Authentication failed',
      code: 'AUTH_ERROR',
    });
  }
}

/**
 * Optional authentication middleware
 * Verifies token if present but doesn't fail if missing
 * Useful for endpoints that have optional authentication
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export async function optionalAuthenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // If no auth header, just continue without user
    if (!authHeader) {
      req.user = null;
      return next();
    }

    // If auth header exists, try to authenticate
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      req.user = null;
      return next();
    }

    const token = parts[1];
    const decoded = await verifyToken(token);

    if (decoded) {
      // Fetch user from database
      const userResult = await query(
        'SELECT id, email, full_name, is_active, is_verified FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (userResult.rows.length > 0 && userResult.rows[0].is_active) {
        const user = userResult.rows[0];
        req.user = {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          isVerified: user.is_verified,
          isActive: user.is_active,
        };
      } else {
        req.user = null;
      }
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // On any error, just continue without user
    req.user = null;
    next();
  }
}

/**
 * Middleware to require email verification
 * Must be used after authenticate middleware
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export function requireVerified(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED',
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      error: 'Email verification required',
      code: 'EMAIL_NOT_VERIFIED',
    });
  }

  next();
}

/**
 * Middleware to check if user owns the resource
 * Compares user ID with resource user_id parameter
 *
 * @param {string} paramName - Name of the parameter to check (default: 'userId')
 * @returns {Function} Express middleware function
 */
export function requireOwnership(paramName = 'userId') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    const resourceUserId = req.params[paramName] || req.body[paramName] || req.query[paramName];

    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        error: `Missing ${paramName} parameter`,
        code: 'MISSING_PARAMETER',
      });
    }

    if (req.user.id !== resourceUserId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You do not own this resource',
        code: 'ACCESS_DENIED',
      });
    }

    next();
  };
}

/**
 * Middleware to extract user ID from token for database queries
 * Provides a consistent way to get the current user's ID
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export function attachUserId(req, res, next) {
  if (req.user && req.user.id) {
    req.userId = req.user.id;
  }
  next();
}

/**
 * Error handler for authentication errors
 * Provides consistent error responses
 *
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export function authErrorHandler(err, req, res, next) {
  console.error('Auth error:', err);

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      code: 'INVALID_TOKEN',
    });
  }

  next(err);
}
