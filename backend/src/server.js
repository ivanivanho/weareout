/**
 * WeAreOut Backend Server
 * Main application entry point with Express server setup
 * @module server
 */

// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root (one level up from src/)
const envPath = join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

import express from 'express';
import cors from 'cors';
import { testConnection, closePool } from './config/database.js';
import authRoutes from './routes/auth.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * CORS Configuration
 * Configure allowed origins based on environment
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'];

    if (allowedOrigins.indexOf(origin) !== -1 || NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Number'],
};

/**
 * Middleware Setup
 */
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

/**
 * Request Logging Middleware (Development only)
 */
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
  });
}

/**
 * Security Headers Middleware
 */
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Remove X-Powered-By header for security
  res.removeHeader('X-Powered-By');

  next();
});

/**
 * Health Check Endpoint
 * @route GET /health
 * @access Public
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'WeAreOut Backend API is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * API Information Endpoint
 * @route GET /
 * @access Public
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'WeAreOut Backend API',
    version: '0.1.0',
    description: 'Personal Inventory Concierge - AI-powered household inventory management',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      documentation: '/api/docs',
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);

/**
 * 404 Not Found Handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    path: req.path,
    method: req.method,
  });
});

/**
 * Global Error Handler
 */
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS policy: Origin not allowed',
      code: 'CORS_ERROR',
    });
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON in request body',
      code: 'JSON_PARSE_ERROR',
    });
  }

  // Handle payload too large errors
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'Request payload too large',
      code: 'PAYLOAD_TOO_LARGE',
    });
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
});

/**
 * Graceful Shutdown Handler
 */
async function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async (err) => {
    if (err) {
      console.error('Error during server shutdown:', err);
      process.exit(1);
    }

    console.log('HTTP server closed');

    // Close database connections
    try {
      await closePool();
      console.log('Database connections closed');
      console.log('Graceful shutdown complete');
      process.exit(0);
    } catch (error) {
      console.error('Error closing database pool:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
}

/**
 * Start Server
 */
let server;

async function startServer() {
  try {
    console.log('Starting WeAreOut Backend Server...');
    console.log(`Environment: ${NODE_ENV}`);

    // Test database connection
    console.log('Testing database connection...');
    await testConnection();
    console.log('Database connection successful');

    // Start listening
    server = app.listen(PORT, () => {
      console.log(`\n========================================`);
      console.log(`  WeAreOut Backend API`);
      console.log(`========================================`);
      console.log(`  Environment: ${NODE_ENV}`);
      console.log(`  Server:      http://localhost:${PORT}`);
      console.log(`  Health:      http://localhost:${PORT}/health`);
      console.log(`  Auth:        http://localhost:${PORT}/api/auth`);
      console.log(`========================================\n`);
      console.log(`Server started successfully at ${new Date().toISOString()}`);
      console.log('Press CTRL+C to stop\n');
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Error: Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.error('Server error:', error);
        process.exit(1);
      }
    });

    // Register shutdown handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Export app for testing
export default app;
