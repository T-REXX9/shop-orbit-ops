/**
 * Authentication Routes
 * Handles login, logout, token refresh, and current user endpoints
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import AuthService from '../services/AuthService.js';
import { authenticate } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/v1/auth/login
 * Authenticate user with email and password
 */
router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg
        });
      }

      const { email, password } = req.body;

      // Authenticate user
      const result = await AuthService.login(email, password);

      logger.info(`User logged in: ${email}`);

      res.json(result);
    } catch (error) {
      logger.error('Login error:', error);
      res.status(401).json({
        success: false,
        error: error.message || 'Authentication failed'
      });
    }
  }
);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required')
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg
        });
      }

      const { refreshToken } = req.body;

      // Refresh token
      const result = await AuthService.refreshAccessToken(refreshToken);

      res.json(result);
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        error: error.message || 'Token refresh failed'
      });
    }
  }
);

/**
 * POST /api/v1/auth/logout
 * Logout user by revoking refresh token
 */
router.post('/logout',
  authenticate,
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required')
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg
        });
      }

      const { refreshToken } = req.body;

      // Logout user
      const result = await AuthService.logout(refreshToken);

      logger.info(`User logged out: ${req.user.email}`);

      res.json(result);
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
  }
);

/**
 * GET /api/v1/auth/me
 * Get current authenticated user data
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await AuthService.getCurrentUser(req.user.userId);
    res.json(result);
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user data'
    });
  }
});

export default router;
