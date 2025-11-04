/**
 * Shop Orbit ERP - Backend Server
 * Express server with SQLite database
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import database initialization
import { initializeDatabase, getDb } from './database/db.js';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import routes
import inquiryRoutes from './routes/inquiries.js';
import customerRoutes from './routes/customers.js';
import contactRoutes from './routes/contacts.js';
import productRoutes from './routes/products.js';
import supplierPriceRoutes from './routes/suppliers-prices.js';
import imageRoutes from './routes/images.js';

// Import utilities
import { logger } from './utils/logger.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`, {
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined
  });
  next();
});

// Serve uploaded files statically
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// ============================================================================
// API ROUTES
// ============================================================================

const API_PREFIX = '/api/v1';

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Mount API routes
app.use(`${API_PREFIX}/inquiries`, inquiryRoutes);
app.use(`${API_PREFIX}/customers`, customerRoutes);
app.use(API_PREFIX, contactRoutes); // Contains /customers/:id/contacts and /contacts routes
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(API_PREFIX, supplierPriceRoutes); // Contains /products/:id/suppliers, /suppliers, /prices routes
app.use(API_PREFIX, imageRoutes); // Contains /customers/:id/images and /images routes

// API info endpoint
app.get(API_PREFIX, (req, res) => {
  res.json({
    name: 'Shop Orbit ERP API',
    version: '1.0.0',
    endpoints: {
      inquiries: `${API_PREFIX}/inquiries`,
      customers: `${API_PREFIX}/customers`,
      contacts: `${API_PREFIX}/contacts`,
      products: `${API_PREFIX}/products`,
      suppliers: `${API_PREFIX}/suppliers`,
      prices: `${API_PREFIX}/prices`,
      images: `${API_PREFIX}/images`,
      health: '/health'
    },
    documentation: 'See README.md for API documentation'
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================================================
// SERVER INITIALIZATION
// ============================================================================

async function startServer() {
  try {
    // Initialize database
    logger.info('Initializing database...');
    await getDb(); // Ensure database is loaded
    
    // Start Express server
    app.listen(PORT, () => {
      logger.info(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║         Shop Orbit ERP - Backend Server                 ║
║                                                          ║
║  Server running on: http://localhost:${PORT}              ║
║  Environment: ${process.env.NODE_ENV || 'development'}                               ║
║  API Version: 1.0.0                                      ║
║                                                          ║
║  API Endpoints:                                          ║
║  - Health Check: http://localhost:${PORT}/health          ║
║  - API Info: http://localhost:${PORT}/api/v1              ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
      `);
      
      logger.info('Server is ready to accept connections');
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

export default app;
