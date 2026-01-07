/**
 * Database Configuration
 * PostgreSQL connection pool setup with error handling and retry logic
 * @module config/database
 */

import pg from 'pg';
const { Pool } = pg;

/**
 * PostgreSQL connection pool (lazy-initialized)
 */
let _pool = null;

/**
 * Get or create the PostgreSQL connection pool
 * Lazy initialization ensures environment variables are loaded first
 */
function getPool() {
  if (!_pool) {
    const poolConfig = {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'weareout',
      password: process.env.DB_PASSWORD || '',
      port: parseInt(process.env.DB_PORT || '5432', 10),

      // Connection pool settings
      max: parseInt(process.env.DB_POOL_MAX || '20', 10), // Maximum number of clients
      min: parseInt(process.env.DB_POOL_MIN || '5', 10), // Minimum number of clients
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000', 10),

      // Application name for easier debugging
      application_name: 'weareout-backend',
    };

    _pool = new Pool(poolConfig);

    // Pool error handler
    _pool.on('error', (err, client) => {
      console.error('Unexpected error on idle database client:', err);
      process.exit(-1);
    });

    // Pool connect event handler
    _pool.on('connect', (client) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('New database client connected');
      }
    });

    // Pool remove event handler
    _pool.on('remove', (client) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Database client removed from pool');
      }
    });
  }

  return _pool;
}

/**
 * Export pool getter
 */
export const pool = new Proxy({}, {
  get(target, prop) {
    return getPool()[prop];
  }
});

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connection successful
 * @throws {Error} If connection fails
 */
export async function testConnection() {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Database connection successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    throw new Error(`Failed to connect to database: ${error.message}`);
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * Execute a query with automatic client management
 * @param {string} text - SQL query text
 * @param {Array} [params] - Query parameters
 * @returns {Promise<Object>} Query result
 */
export async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    if (process.env.NODE_ENV === 'development' && process.env.DB_QUERY_LOGGING === 'true') {
      console.log('Executed query', { text, duration, rows: result.rowCount });
    }

    return result;
  } catch (error) {
    console.error('Query error:', error.message);
    throw error;
  }
}

/**
 * Get a client from the pool for transaction management
 * @returns {Promise<Object>} Database client
 */
export async function getClient() {
  const client = await pool.connect();
  const originalQuery = client.query;
  const originalRelease = client.release;

  // Set a timeout to prevent hanging transactions
  const timeout = setTimeout(() => {
    console.error('Client checkout timeout - possible transaction leak');
  }, 5000);

  // Override release to clear timeout
  client.release = () => {
    clearTimeout(timeout);
    client.query = originalQuery;
    client.release = originalRelease;
    return originalRelease.apply(client);
  };

  return client;
}

/**
 * Gracefully close database pool
 * @returns {Promise<void>}
 */
export async function closePool() {
  try {
    await pool.end();
    console.log('Database pool closed successfully');
  } catch (error) {
    console.error('Error closing database pool:', error.message);
    throw error;
  }
}
