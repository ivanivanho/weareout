/**
 * Authentication Controller
 * Handles user registration, login, logout, and token refresh
 * @module controllers/authController
 */

import bcrypt from 'bcrypt';
import { query } from '../config/database.js';
import { validatePassword } from '../config/auth.js';
import {
  generateToken,
  generateRefreshToken,
  verifyToken,
  refreshAccessToken,
  blacklistToken,
} from '../utils/jwt.js';

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Extract device info and IP from request
 * @param {Object} req - Express request object
 * @returns {Object} Device metadata
 */
function extractMetadata(req) {
  return {
    deviceInfo: req.headers['user-agent'] || 'unknown',
    ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
  };
}

/**
 * Register a new user
 * POST /api/auth/register
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User email
 * @param {string} req.body.password - User password
 * @param {string} req.body.fullName - User full name
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export async function register(req, res) {
  const client = await import('../config/database.js').then(m => m.getClient());

  try {
    const { email, password, fullName } = req.body;

    // Input validation
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        code: 'MISSING_FIELDS',
        details: {
          email: !email ? 'Email is required' : undefined,
          password: !password ? 'Password is required' : undefined,
          fullName: !fullName ? 'Full name is required' : undefined,
        },
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        code: 'INVALID_EMAIL',
      });
    }

    // Validate password against policy
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Password does not meet requirements',
        code: 'WEAK_PASSWORD',
        details: passwordValidation.errors,
      });
    }

    // Validate full name
    if (fullName.trim().length < 2 || fullName.trim().length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Full name must be between 2 and 100 characters',
        code: 'INVALID_NAME',
      });
    }

    // Begin transaction
    await client.query('BEGIN');

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists',
        code: 'EMAIL_EXISTS',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, full_name, is_active, is_verified)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, is_active, is_verified, created_at`,
      [email.toLowerCase().trim(), passwordHash, fullName.trim(), true, false]
    );

    const user = userResult.rows[0];

    // Generate tokens
    const metadata = extractMetadata(req);
    const accessToken = generateToken(user);
    const refreshToken = await generateRefreshToken(user, metadata, client);

    // Commit transaction
    await client.query('COMMIT');

    // Log registration event
    console.log(`New user registered: ${user.email} (${user.id})`);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          isVerified: user.is_verified,
          isActive: user.is_active,
          createdAt: user.created_at,
        },
        tokens: {
          accessToken: accessToken.token,
          refreshToken: refreshToken.token,
          expiresIn: accessToken.expiresIn,
          tokenType: 'Bearer',
        },
      },
    });
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');

    console.error('Registration error:', error);

    // Handle specific database errors
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists',
        code: 'EMAIL_EXISTS',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Registration failed',
      code: 'REGISTRATION_ERROR',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  } finally {
    client.release();
  }
}

/**
 * Login user
 * POST /api/auth/login
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User email
 * @param {string} req.body.password - User password
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS',
      });
    }

    // Fetch user from database
    const userResult = await query(
      `SELECT id, email, password_hash, full_name, is_active, is_verified,
              failed_login_attempts, locked_until
       FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
      });
    }

    const user = userResult.rows[0];

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const lockExpiry = new Date(user.locked_until);
      return res.status(423).json({
        success: false,
        error: 'Account is temporarily locked due to too many failed login attempts',
        code: 'ACCOUNT_LOCKED',
        lockedUntil: lockExpiry.toISOString(),
      });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Account has been deactivated',
        code: 'ACCOUNT_INACTIVE',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      // Increment failed login attempts
      const failedAttempts = (user.failed_login_attempts || 0) + 1;
      const lockDuration = failedAttempts >= 5 ? 15 : null; // Lock for 15 minutes after 5 attempts

      await query(
        `UPDATE users
         SET failed_login_attempts = $1,
             locked_until = CASE WHEN $2 IS NOT NULL THEN NOW() + INTERVAL '$2 minutes' ELSE NULL END,
             last_login_attempt = NOW()
         WHERE id = $3`,
        [failedAttempts, lockDuration, user.id]
      );

      if (failedAttempts >= 5) {
        return res.status(423).json({
          success: false,
          error: 'Account locked due to too many failed login attempts. Try again in 15 minutes.',
          code: 'ACCOUNT_LOCKED',
        });
      }

      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
        attemptsRemaining: 5 - failedAttempts,
      });
    }

    // Reset failed login attempts on successful login
    await query(
      `UPDATE users
       SET failed_login_attempts = 0,
           locked_until = NULL,
           last_login = NOW(),
           last_login_attempt = NOW()
       WHERE id = $1`,
      [user.id]
    );

    // Generate tokens
    const metadata = extractMetadata(req);
    const accessToken = generateToken(user);
    const refreshToken = await generateRefreshToken(user, metadata);

    // Log successful login
    console.log(`User logged in: ${user.email} (${user.id})`);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          isVerified: user.is_verified,
          isActive: user.is_active,
        },
        tokens: {
          accessToken: accessToken.token,
          refreshToken: refreshToken.token,
          expiresIn: accessToken.expiresIn,
          tokenType: 'Bearer',
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      code: 'LOGIN_ERROR',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Logout user
 * POST /api/auth/logout
 * Requires authentication
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export async function logout(req, res) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
        code: 'NO_TOKEN',
      });
    }

    const token = authHeader.split(' ')[1];

    // Blacklist the access token
    await blacklistToken(token, 'user_logout');

    // Optionally revoke refresh token if provided
    const { refreshToken } = req.body;
    if (refreshToken) {
      const { revokeRefreshToken } = await import('../utils/jwt.js');
      await revokeRefreshToken(refreshToken);
    }

    // Log logout event
    console.log(`User logged out: ${req.user.email} (${req.user.id})`);

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
      code: 'LOGOUT_ERROR',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Refresh access token
 * POST /api/auth/refresh
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.refreshToken - Refresh token
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;

    // Input validation
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required',
        code: 'MISSING_REFRESH_TOKEN',
      });
    }

    // Extract metadata for new tokens
    const metadata = {
      ...extractMetadata(req),
      rotateRefreshToken: true, // Enable refresh token rotation for security
    };

    // Refresh tokens
    const result = await refreshAccessToken(refreshToken, metadata);

    // Log token refresh
    console.log(`Token refreshed for user: ${result.user.email} (${result.user.id})`);

    // Return new tokens
    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user: result.user,
        tokens: {
          accessToken: result.accessToken.token,
          refreshToken: result.refreshToken.token,
          expiresIn: result.accessToken.expiresIn,
          tokenType: 'Bearer',
        },
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error);

    // Handle specific errors
    if (error.message.includes('expired')) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token has expired',
        code: 'TOKEN_EXPIRED',
      });
    }

    if (error.message.includes('revoked')) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token has been revoked',
        code: 'TOKEN_REVOKED',
      });
    }

    if (error.message.includes('not found')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
        code: 'INVALID_TOKEN',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Token refresh failed',
      code: 'REFRESH_ERROR',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Get current user profile
 * GET /api/auth/me
 * Requires authentication
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export async function getCurrentUser(req, res) {
  try {
    // User is already attached by auth middleware
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile',
      code: 'GET_USER_ERROR',
    });
  }
}

/**
 * Verify email with verification token
 * POST /api/auth/verify-email
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.token - Verification token
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export async function verifyEmail(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required',
        code: 'MISSING_TOKEN',
      });
    }

    // Verify the token and update user
    const result = await query(
      `UPDATE users
       SET is_verified = true, email_verified_at = NOW()
       WHERE id = (
         SELECT user_id FROM email_verifications
         WHERE token = $1 AND expires_at > NOW() AND used = false
       )
       RETURNING id, email, full_name`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token',
        code: 'INVALID_TOKEN',
      });
    }

    // Mark verification token as used
    await query(
      'UPDATE email_verifications SET used = true, used_at = NOW() WHERE token = $1',
      [token]
    );

    const user = result.rows[0];
    console.log(`Email verified for user: ${user.email} (${user.id})`);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
        },
      },
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Email verification failed',
      code: 'VERIFICATION_ERROR',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
