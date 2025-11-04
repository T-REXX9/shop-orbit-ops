/**
 * Permission Service
 * Handles permission queries and management
 */

import { getDb } from '../database/db.js';
import { logger } from '../utils/logger.js';

class PermissionService {
  /**
   * Get all permissions grouped by resource
   * @returns {Promise<Object>} Permissions grouped by resource
   */
  static async getAllPermissions() {
    try {
      const db = await getDb();

      const permissions = db.prepare(`
        SELECT * FROM permissions
        ORDER BY resource, action
      `).all();

      // Group by resource
      const grouped = permissions.reduce((acc, perm) => {
        if (!acc[perm.resource]) {
          acc[perm.resource] = [];
        }
        acc[perm.resource].push({
          id: perm.id,
          key: perm.permission_key,
          resource: perm.resource,
          action: perm.action,
          description: perm.description
        });
        return acc;
      }, {});

      return {
        success: true,
        data: Object.keys(grouped).map(resource => ({
          resource,
          permissions: grouped[resource]
        }))
      };
    } catch (error) {
      logger.error('Failed to get permissions:', error);
      throw error;
    }
  }

  /**
   * Get all permissions as flat array
   * @returns {Promise<Object>} All permissions
   */
  static async getPermissions() {
    try {
      const db = await getDb();

      const permissions = db.prepare(`
        SELECT * FROM permissions
        ORDER BY resource, action
      `).all();

      return {
        success: true,
        data: permissions.map(p => ({
          id: p.id,
          key: p.permission_key,
          resource: p.resource,
          action: p.action,
          description: p.description
        }))
      };
    } catch (error) {
      logger.error('Failed to get permissions:', error);
      throw error;
    }
  }

  /**
   * Get permissions for a specific role
   * @param {string} roleId - Role ID
   * @returns {Promise<Object>} Role permissions
   */
  static async getRolePermissions(roleId) {
    try {
      const db = await getDb();

      const permissions = db.prepare(`
        SELECT p.*
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ?
        ORDER BY p.resource, p.action
      `).all(roleId);

      return {
        success: true,
        data: permissions.map(p => ({
          id: p.id,
          key: p.permission_key,
          resource: p.resource,
          action: p.action,
          description: p.description
        }))
      };
    } catch (error) {
      logger.error('Failed to get role permissions:', error);
      throw error;
    }
  }

  /**
   * Check if user has specific permission
   * @param {string} userId - User ID
   * @param {string} permissionKey - Permission key
   * @returns {Promise<boolean>} True if user has permission
   */
  static async userHasPermission(userId, permissionKey) {
    try {
      const db = await getDb();

      const result = db.prepare(`
        SELECT COUNT(*) as count
        FROM users u
        JOIN roles r ON u.role_id = r.id
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE u.id = ? AND p.permission_key = ?
      `).get(userId, permissionKey);

      return result.count > 0;
    } catch (error) {
      logger.error('Failed to check permission:', error);
      throw error;
    }
  }

  /**
   * Get user permissions by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User permissions
   */
  static async getUserPermissions(userId) {
    try {
      const db = await getDb();

      const permissions = db.prepare(`
        SELECT DISTINCT p.*
        FROM users u
        JOIN roles r ON u.role_id = r.id
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE u.id = ?
        ORDER BY p.resource, p.action
      `).all(userId);

      return {
        success: true,
        data: permissions.map(p => ({
          id: p.id,
          key: p.permission_key,
          resource: p.resource,
          action: p.action,
          description: p.description
        }))
      };
    } catch (error) {
      logger.error('Failed to get user permissions:', error);
      throw error;
    }
  }

  /**
   * Get permission keys for user (array of strings)
   * @param {string} userId - User ID
   * @returns {Promise<Array<string>>} Permission keys
   */
  static async getUserPermissionKeys(userId) {
    try {
      const db = await getDb();

      const permissions = db.prepare(`
        SELECT DISTINCT p.permission_key
        FROM users u
        JOIN roles r ON u.role_id = r.id
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE u.id = ?
      `).all(userId);

      return permissions.map(p => p.permission_key);
    } catch (error) {
      logger.error('Failed to get user permission keys:', error);
      throw error;
    }
  }
}

export default PermissionService;
