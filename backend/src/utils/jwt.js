/**
 * JWT Utility Functions
 * Token generation, verification, and refresh functionality
 * @module utils/jwt
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { jwtConfig } from '../config/auth.js';
import { query } from '../config/database.js';

/**
 * Generate a unique JWT ID (jti)
 * @returns {string} Unique identifier
 */
function generateJti() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Generate an access token for a user
 *
 * @param {Object} user - User object
 * @param {string} user.id - User ID (UUID)
 * @param {string} user.email - User email
 * @returns {Object} Token object with token and expiry
 * @throws {Error} If token generation fails
 */
export function generateToken(user) {
  try {
    if (!user || !user.id || !user.email) {
      throw new Error('Invalid user object: id and email are required');
    }

    const jti = generateJti();
    const now = Math.floor(Date.now() / 1000);

    const payload = {
      userId: user.id,
      email: user.email,
      type: 'access',
      jti,
      iat: now,
    };

    const token = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.accessTokenExpiry,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
      algorithm: jwtConfig.algorithm,
    });

    // Calculate actual expiry timestamp
    const decoded = jwt.decode(token);
    const expiresAt = new Date(decoded.exp * 1000);

    return {
      token,
      expiresIn: jwtConfig.accessTokenExpiry,
      expiresAt,
      type: 'Bearer',
      jti,
    };
  } catch (error) {
    console.error('Error generating access token:', error);
    throw new Error(`Failed to generate access token: ${error.message}`);
  }
}

/**
 * Generate a refresh token for a user
 * Stores the token hash in the database for validation
 *
 * @param {Object} user - User object
 * @param {string} user.id - User ID (UUID)
 * @param {string} user.email - User email
 * @param {Object} [metadata] - Optional metadata
 * @param {string} [metadata.deviceInfo] - Device information
 * @param {string} [metadata.ipAddress] - IP address
 * @param {Object} [client] - Optional database client for transactions
 * @returns {Promise<Object>} Token object with token and expiry
 * @throws {Error} If token generation or storage fails
 */
export async function generateRefreshToken(user, metadata = {}, client = null) {
  try {
    if (!user || !user.id || !user.email) {
      throw new Error('Invalid user object: id and email are required');
    }

    const jti = generateJti();
    const now = Math.floor(Date.now() / 1000);

    const payload = {
      userId: user.id,
      email: user.email,
      type: 'refresh',
      jti,
      iat: now,
    };

    const token = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.refreshTokenExpiry,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
      algorithm: jwtConfig.algorithm,
    });

    // Hash the token for storage (never store plain tokens)
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Calculate expiry timestamp
    const decoded = jwt.decode(token);
    const expiresAt = new Date(decoded.exp * 1000);

    // Store refresh token in database
    if (client) {
      // Use transaction client if provided
      await client.query(
        `INSERT INTO refresh_tokens (user_id, token_hash, device_info, ip_address, expires_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          user.id,
          tokenHash,
          metadata.deviceInfo || null,
          metadata.ipAddress || null,
          expiresAt,
        ]
      );
    } else {
      // Use pool query if no client provided
      await query(
        `INSERT INTO refresh_tokens (user_id, token_hash, device_info, ip_address, expires_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          user.id,
          tokenHash,
          metadata.deviceInfo || null,
          metadata.ipAddress || null,
          expiresAt,
        ]
      );
    }

    return {
      token,
      expiresIn: jwtConfig.refreshTokenExpiry,
      expiresAt,
      type: 'refresh',
      jti,
    };
  } catch (error) {
    console.error('Error generating refresh token:', error);
    throw new Error(`Failed to generate refresh token: ${error.message}`);
  }
}

/**
 * Verify and decode a JWT token
 *
 * @param {string} token - JWT token to verify
 * @param {string} [expectedType] - Expected token type ('access' or 'refresh')
 * @returns {Promise<Object>} Decoded token payload
 * @throws {Error} If token is invalid or verification fails
 */
export async function verifyToken(token, expectedType = 'access') {
  try {
    if (!token) {
      throw new Error('Token is required');
    }

    // Verify token signature and expiration
    const decoded = jwt.verify(token, jwtConfig.secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
      algorithms: [jwtConfig.algorithm],
      clockTolerance: jwtConfig.clockTolerance,
    });

    // Verify token type
    if (expectedType && decoded.type !== expectedType) {
      throw new Error(`Invalid token type: expected ${expectedType}, got ${decoded.type}`);
    }

    // For refresh tokens, verify it exists in database and is not revoked
    if (decoded.type === 'refresh') {
      const tokenHash = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      const result = await query(
        `SELECT id, revoked FROM refresh_tokens
         WHERE token_hash = $1 AND user_id = $2 AND expires_at > NOW()`,
        [tokenHash, decoded.userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Refresh token not found or expired');
      }

      if (result.rows[0].revoked) {
        throw new Error('Refresh token has been revoked');
      }
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const expiredError = new Error('Token has expired');
      expiredError.name = 'TokenExpiredError';
      expiredError.expiredAt = error.expiredAt;
      throw expiredError;
    }

    if (error.name === 'JsonWebTokenError') {
      const jwtError = new Error('Invalid token');
      jwtError.name = 'JsonWebTokenError';
      throw jwtError;
    }

    throw error;
  }
}

/**
 * Refresh access token using a valid refresh token
 *
 * @param {string} refreshToken - Valid refresh token
 * @param {Object} [metadata] - Optional metadata for the new tokens
 * @returns {Promise<Object>} New access and refresh tokens
 * @throws {Error} If refresh token is invalid or refresh fails
 */
export async function refreshAccessToken(refreshToken, metadata = {}) {
  try {
    // Verify the refresh token
    const decoded = await verifyToken(refreshToken, 'refresh');

    // Fetch user from database
    const userResult = await query(
      'SELECT id, email, full_name, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      throw new Error('User account is inactive');
    }

    // Generate new access token
    const newAccessToken = generateToken(user);

    // Optionally rotate refresh token (recommended for security)
    let newRefreshToken = null;
    if (metadata.rotateRefreshToken !== false) {
      // Revoke old refresh token
      const oldTokenHash = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');

      await query(
        'UPDATE refresh_tokens SET revoked = TRUE, revoked_at = NOW() WHERE token_hash = $1',
        [oldTokenHash]
      );

      // Generate new refresh token
      newRefreshToken = await generateRefreshToken(user, metadata);
    }

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
      },
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw new Error(`Failed to refresh access token: ${error.message}`);
  }
}

/**
 * Revoke a refresh token
 *
 * @param {string} refreshToken - Refresh token to revoke
 * @returns {Promise<boolean>} True if successful
 * @throws {Error} If revocation fails
 */
export async function revokeRefreshToken(refreshToken) {
  try {
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const result = await query(
      'UPDATE refresh_tokens SET revoked = TRUE, revoked_at = NOW() WHERE token_hash = $1',
      [tokenHash]
    );

    return result.rowCount > 0;
  } catch (error) {
    console.error('Error revoking refresh token:', error);
    throw new Error(`Failed to revoke refresh token: ${error.message}`);
  }
}

/**
 * Revoke all refresh tokens for a user
 *
 * @param {string} userId - User ID (UUID)
 * @returns {Promise<number>} Number of tokens revoked
 * @throws {Error} If revocation fails
 */
export async function revokeAllUserTokens(userId) {
  try {
    const result = await query(
      'UPDATE refresh_tokens SET revoked = TRUE, revoked_at = NOW() WHERE user_id = $1 AND revoked = FALSE',
      [userId]
    );

    return result.rowCount;
  } catch (error) {
    console.error('Error revoking all user tokens:', error);
    throw new Error(`Failed to revoke user tokens: ${error.message}`);
  }
}

/**
 * Blacklist an access token (for logout)
 *
 * @param {string} token - Access token to blacklist
 * @param {string} [reason] - Reason for blacklisting
 * @returns {Promise<boolean>} True if successful
 * @throws {Error} If blacklisting fails
 */
export async function blacklistToken(token, reason = 'user_logout') {
  try {
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.jti) {
      throw new Error('Invalid token: missing jti');
    }

    await query(
      `INSERT INTO token_blacklist (token_jti, user_id, expires_at, reason)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (token_jti) DO NOTHING`,
      [
        decoded.jti,
        decoded.userId,
        new Date(decoded.exp * 1000),
        reason,
      ]
    );

    return true;
  } catch (error) {
    console.error('Error blacklisting token:', error);
    throw new Error(`Failed to blacklist token: ${error.message}`);
  }
}

/**
 * Check if a token is blacklisted
 *
 * @param {string} jti - JWT ID to check
 * @returns {Promise<boolean>} True if blacklisted
 */
export async function isTokenBlacklisted(jti) {
  try {
    const result = await query(
      'SELECT id FROM token_blacklist WHERE token_jti = $1 AND expires_at > NOW()',
      [jti]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking token blacklist:', error);
    return false;
  }
}

/**
 * Decode token without verification (for inspection only)
 *
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded token payload or null
 */
export function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Clean up expired tokens from database
 * Should be run periodically (e.g., via cron job)
 *
 * @returns {Promise<Object>} Cleanup statistics
 */
export async function cleanupExpiredTokens() {
  try {
    // Clean up expired refresh tokens
    const refreshResult = await query(
      'DELETE FROM refresh_tokens WHERE expires_at < NOW()'
    );

    // Clean up expired blacklisted tokens
    const blacklistResult = await query(
      'DELETE FROM token_blacklist WHERE expires_at < NOW()'
    );

    const stats = {
      refreshTokensDeleted: refreshResult.rowCount,
      blacklistedTokensDeleted: blacklistResult.rowCount,
      timestamp: new Date().toISOString(),
    };

    console.log('Token cleanup completed:', stats);
    return stats;
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
    throw new Error(`Failed to cleanup expired tokens: ${error.message}`);
  }
}
