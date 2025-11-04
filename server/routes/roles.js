/**
 * Role Management Routes
 * Handles role and permission CRUD operations
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import RoleService from '../services/RoleService.js';
import PermissionService from '../services/PermissionService.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/v1/roles
 * Get all roles
 */
router.get('/',
  authenticate,
  authorize('view_roles'),
  async (req, res) => {
    try {
      const result = await RoleService.getRoles();
      res.json(result);
    } catch (error) {
      logger.error('Get roles error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve roles'
      });
    }
  }
);

/**
 * GET /api/v1/roles/:id
 * Get role by ID with permissions
 */
router.get('/:id',
  authenticate,
  authorize('view_roles'),
  async (req, res) => {
    try {
      const result = await RoleService.getRoleById(req.params.id);
      res.json(result);
    } catch (error) {
      logger.error('Get role error:', error);
      res.status(error.message === 'Role not found' ? 404 : 500).json({
        success: false,
        error: error.message || 'Failed to retrieve role'
      });
    }
  }
);

/**
 * POST /api/v1/roles
 * Create new custom role
 */
router.post('/',
  authenticate,
  authorize('create_roles'),
  [
    body('role_name').notEmpty().withMessage('Role name is required'),
    body('permission_ids').isArray({ min: 1 }).withMessage('At least one permission is required')
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

      const result = await RoleService.createRole(req.body);
      res.status(201).json(result);
    } catch (error) {
      logger.error('Create role error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create role'
      });
    }
  }
);

/**
 * PUT /api/v1/roles/:id
 * Update role
 */
router.put('/:id',
  authenticate,
  authorize('edit_roles'),
  [
    body('role_name').optional().notEmpty().withMessage('Role name cannot be empty'),
    body('permission_ids').optional().isArray().withMessage('Permissions must be an array')
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

      const result = await RoleService.updateRole(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      logger.error('Update role error:', error);
      const status = error.message === 'Role not found' ? 404 :
                     error.message.includes('Cannot modify') ? 403 : 400;
      res.status(status).json({
        success: false,
        error: error.message || 'Failed to update role'
      });
    }
  }
);

/**
 * DELETE /api/v1/roles/:id
 * Delete role
 */
router.delete('/:id',
  authenticate,
  authorize('delete_roles'),
  async (req, res) => {
    try {
      const result = await RoleService.deleteRole(req.params.id);
      
      if (!result.success) {
        return res.status(409).json(result);
      }
      
      res.json(result);
    } catch (error) {
      logger.error('Delete role error:', error);
      const status = error.message === 'Role not found' ? 404 :
                     error.message.includes('Cannot delete') ? 403 : 400;
      res.status(status).json({
        success: false,
        error: error.message || 'Failed to delete role'
      });
    }
  }
);

/**
 * GET /api/v1/permissions
 * Get all available permissions
 */
router.get('/permissions/all',
  authenticate,
  authorize('view_roles'),
  async (req, res) => {
    try {
      const result = await PermissionService.getAllPermissions();
      res.json(result);
    } catch (error) {
      logger.error('Get permissions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve permissions'
      });
    }
  }
);

export default router;
