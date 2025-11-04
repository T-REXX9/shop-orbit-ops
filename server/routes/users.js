/**
 * User Management Routes
 * Handles user CRUD operations with permission checks
 */

import express from 'express';
import { body, query, validationResult } from 'express-validator';
import UserService from '../services/UserService.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/v1/users
 * Get all users with pagination and filtering
 */
router.get('/',
  authenticate,
  authorize('view_users'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg
        });
      }

      const result = await UserService.getUsers(req.query);
      res.json(result);
    } catch (error) {
      logger.error('Get users error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve users'
      });
    }
  }
);

/**
 * GET /api/v1/users/:id
 * Get user by ID
 */
router.get('/:id',
  authenticate,
  authorize('view_users'),
  async (req, res) => {
    try {
      const result = await UserService.getUserById(req.params.id);
      res.json(result);
    } catch (error) {
      logger.error('Get user error:', error);
      res.status(error.message === 'User not found' ? 404 : 500).json({
        success: false,
        error: error.message || 'Failed to retrieve user'
      });
    }
  }
);

/**
 * POST /api/v1/users
 * Create new user
 */
router.post('/',
  authenticate,
  authorize('create_users'),
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('full_name').notEmpty().withMessage('Full name is required'),
    body('role_id').notEmpty().withMessage('Role is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg
        });
      }

      const result = await UserService.createUser(req.body);
      res.status(201).json(result);
    } catch (error) {
      logger.error('Create user error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create user'
      });
    }
  }
);

/**
 * PUT /api/v1/users/:id
 * Update user
 */
router.put('/:id',
  authenticate,
  authorize('edit_users'),
  [
    body('full_name').optional().notEmpty().withMessage('Full name cannot be empty'),
    body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg
        });
      }

      const result = await UserService.updateUser(req.params.id, req.body, req.user.userId);
      res.json(result);
    } catch (error) {
      logger.error('Update user error:', error);
      const status = error.message === 'User not found' ? 404 :
                     error.message.includes('Cannot modify') ? 403 : 400;
      res.status(status).json({
        success: false,
        error: error.message || 'Failed to update user'
      });
    }
  }
);

/**
 * DELETE /api/v1/users/:id
 * Delete user
 */
router.delete('/:id',
  authenticate,
  authorize('delete_users'),
  async (req, res) => {
    try {
      const result = await UserService.deleteUser(req.params.id, req.user.userId);
      res.json(result);
    } catch (error) {
      logger.error('Delete user error:', error);
      const status = error.message === 'User not found' ? 404 :
                     error.message.includes('Cannot delete') ? 403 : 400;
      res.status(status).json({
        success: false,
        error: error.message || 'Failed to delete user'
      });
    }
  }
);

/**
 * PUT /api/v1/users/:id/password
 * Change user password
 */
router.put('/:id/password',
  authenticate,
  authorize('edit_users'),
  [
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg
        });
      }

      const result = await UserService.changePassword(req.params.id, req.body.password);
      res.json(result);
    } catch (error) {
      logger.error('Change password error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to change password'
      });
    }
  }
);

export default router;
