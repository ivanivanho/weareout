/**
 * Authentication Configuration
 * JWT and bcrypt settings for secure authentication
 * @module config/auth
 */

/**
 * JWT Configuration
 */
export const jwtConfig = {
  /**
   * Secret key for signing JWT tokens
   * MUST be set via environment variable in production
   */
  secret: process.env.JWT_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production');
    }
    console.warn('WARNING: Using default JWT secret - not suitable for production');
    return 'dev-secret-change-in-production-2024';
  })(),

  /**
   * Access token expiration time
   * Short-lived for security (15 minutes default)
   */
  accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',

  /**
   * Refresh token expiration time
   * Longer-lived for user convenience (7 days default)
   */
  refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',

  /**
   * JWT issuer identifier
   */
  issuer: process.env.JWT_ISSUER || 'weareout-api',

  /**
   * JWT audience identifier
   */
  audience: process.env.JWT_AUDIENCE || 'weareout-client',

  /**
   * Algorithm for signing tokens
   */
  algorithm: 'HS256',

  /**
   * Clock tolerance for token validation (in seconds)
   * Accounts for slight time differences between servers
   */
  clockTolerance: 30,
};

/**
 * Bcrypt Configuration
 */
export const bcryptConfig = {
  /**
   * Number of salt rounds for password hashing
   * Higher = more secure but slower (10-12 recommended for production)
   * @see https://github.com/kelektiv/node.bcrypt.js#a-note-on-rounds
   */
  saltRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),

  /**
   * Maximum password length to prevent DoS attacks
   * Bcrypt has issues with very long passwords
   */
  maxPasswordLength: 72, // Bcrypt limit
};

/**
 * Session Configuration
 */
export const sessionConfig = {
  /**
   * Maximum number of active sessions per user
   * Helps prevent account sharing and token theft
   */
  maxActiveSessions: parseInt(process.env.MAX_SESSIONS || '5', 10),

  /**
   * Session cleanup interval (in milliseconds)
   * How often to clean up expired sessions
   */
  cleanupInterval: parseInt(process.env.SESSION_CLEANUP_INTERVAL || '3600000', 10), // 1 hour
};

/**
 * Rate Limiting Configuration for Auth Endpoints
 */
export const rateLimitConfig = {
  /**
   * Login attempt limits
   */
  login: {
    windowMs: parseInt(process.env.LOGIN_RATE_WINDOW || '900000', 10), // 15 minutes
    maxAttempts: parseInt(process.env.LOGIN_RATE_MAX || '5', 10),
  },

  /**
   * Registration attempt limits
   */
  register: {
    windowMs: parseInt(process.env.REGISTER_RATE_WINDOW || '3600000', 10), // 1 hour
    maxAttempts: parseInt(process.env.REGISTER_RATE_MAX || '3', 10),
  },

  /**
   * Token refresh limits
   */
  refresh: {
    windowMs: parseInt(process.env.REFRESH_RATE_WINDOW || '900000', 10), // 15 minutes
    maxAttempts: parseInt(process.env.REFRESH_RATE_MAX || '10', 10),
  },
};

/**
 * Password Policy Configuration
 */
export const passwordPolicy = {
  /**
   * Minimum password length
   */
  minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8', 10),

  /**
   * Maximum password length (bcrypt limitation)
   */
  maxLength: bcryptConfig.maxPasswordLength,

  /**
   * Require uppercase letters
   */
  requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',

  /**
   * Require lowercase letters
   */
  requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',

  /**
   * Require numbers
   */
  requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS !== 'false',

  /**
   * Require special characters
   */
  requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL !== 'false',
};

/**
 * Token Blacklist Configuration
 */
export const blacklistConfig = {
  /**
   * Enable token blacklisting for logout
   */
  enabled: process.env.TOKEN_BLACKLIST_ENABLED !== 'false',

  /**
   * Cleanup interval for expired blacklist entries (in milliseconds)
   */
  cleanupInterval: parseInt(process.env.BLACKLIST_CLEANUP_INTERVAL || '3600000', 10), // 1 hour
};

/**
 * Validate password against policy
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and errors array
 */
export function validatePassword(password) {
  const errors = [];

  if (!password) {
    return { isValid: false, errors: ['Password is required'] };
  }

  if (password.length < passwordPolicy.minLength) {
    errors.push(`Password must be at least ${passwordPolicy.minLength} characters`);
  }

  if (password.length > passwordPolicy.maxLength) {
    errors.push(`Password must not exceed ${passwordPolicy.maxLength} characters`);
  }

  if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (passwordPolicy.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (passwordPolicy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
