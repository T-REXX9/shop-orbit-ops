/**
 * Role Management Service
 * Handles CRUD operations for roles and permission assignments
 */

import { randomUUID } from 'crypto';
import { getDb, getCurrentTimestamp } from '../database/db.js';
import { logger } from '../utils/logger.js';

class RoleService {
  /**
   * Get all roles with permission counts
   * @returns {Promise<Object>} Roles list
   */
  static async getRoles() {
    try {
      const db = await getDb();

      const roles = db.prepare(`
        SELECT r.*,
               COUNT(DISTINCT rp.permission_id) as permission_count,
               COUNT(DISTINCT u.id) as user_count
        FROM roles r
        LEFT JOIN role_permissions rp ON r.id = rp.role_id
        LEFT JOIN users u ON r.id = u.role_id
        GROUP BY r.id
        ORDER BY r.is_system_role DESC, r.role_name ASC
      `).all();

      return {
        success: true,
        data: roles.map(r => ({
          id: r.id,
          name: r.role_name,
          key: r.role_key,
          description: r.description,
          isSystemRole: r.is_system_role === 1,
          permissionCount: r.permission_count,
          userCount: r.user_count,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }))
      };
    } catch (error) {
      logger.error('Failed to get roles:', error);
      throw error;
    }
  }

  /**
   * Get role by ID with permissions
   * @param {string} roleId - Role ID
   * @returns {Promise<Object>} Role data with permissions
   */
  static async getRoleById(roleId) {
    try {
      const db = await getDb();

      const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(roleId);

      if (!role) {
        throw new Error('Role not found');
      }

      // Get permissions for this role
      const permissions = db.prepare(`
        SELECT p.*
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ?
        ORDER BY p.resource, p.action
      `).all(roleId);

      return {
        success: true,
        data: {
          id: role.id,
          name: role.role_name,
          key: role.role_key,
          description: role.description,
          isSystemRole: role.is_system_role === 1,
          permissions: permissions.map(p => ({
            id: p.id,
            key: p.permission_key,
            resource: p.resource,
            action: p.action,
            description: p.description
          })),
          createdAt: role.created_at,
          updatedAt: role.updated_at
        }
      };
    } catch (error) {
      logger.error('Failed to get role:', error);
      throw error;
    }
  }

  /**
   * Create new custom role
   * @param {Object} roleData - Role data
   * @param {string} roleData.role_name - Role name
   * @param {string} roleData.description - Role description
   * @param {Array<string>} roleData.permission_ids - Permission IDs to assign
   * @returns {Promise<Object>} Created role
   */
  static async createRole(roleData) {
    try {
      const db = await getDb();

      // Validate required fields
      if (!roleData.role_name) {
        throw new Error('Role name is required');
      }

      if (!roleData.permission_ids || roleData.permission_ids.length === 0) {
        throw new Error('At least one permission is required');
      }

      // Check if role name already exists
      const existingRole = db.prepare('SELECT id FROM roles WHERE role_name = ?').get(roleData.role_name);
      if (existingRole) {
        throw new Error('Role name already exists');
      }

      // Generate role key from name
      const roleKey = roleData.role_name.toLowerCase().replace(/\s+/g, '_');

      // Check if role key already exists
      const existingKey = db.prepare('SELECT id FROM roles WHERE role_key = ?').get(roleKey);
      if (existingKey) {
        throw new Error('Role key already exists');
      }

      const roleId = randomUUID();
      const now = getCurrentTimestamp();

      // Insert role
      db.prepare(`
        INSERT INTO roles (id, role_name, role_key, description, is_system_role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        roleId,
        roleData.role_name,
        roleKey,
        roleData.description || null,
        0, // Custom roles are not system roles
        now,
        now
      );

      // Assign permissions
      await this.assignPermissionsToRole(roleId, roleData.permission_ids);

      logger.info(`Role created: ${roleData.role_name}`);

      return this.getRoleById(roleId);
    } catch (error) {
      logger.error('Failed to create role:', error);
      throw error;
    }
  }

  /**
   * Update role
   * @param {string} roleId - Role ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated role
   */
  static async updateRole(roleId, updateData) {
    try {
      const db = await getDb();

      // Check if role exists
      const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(roleId);
      if (!role) {
        throw new Error('Role not found');
      }

      // Prevent modifying system roles
      if (role.is_system_role === 1) {
        throw new Error('Cannot modify system roles');
      }

      const updates = [];
      const params = [];

      if (updateData.role_name) {
        // Check if new name is unique
        const existing = db.prepare('SELECT id FROM roles WHERE role_name = ? AND id != ?')
          .get(updateData.role_name, roleId);
        if (existing) {
          throw new Error('Role name already exists');
        }

        updates.push('role_name = ?');
        params.push(updateData.role_name);

        // Update role key as well
        const newKey = updateData.role_name.toLowerCase().replace(/\s+/g, '_');
        updates.push('role_key = ?');
        params.push(newKey);
      }

      if (updateData.description !== undefined) {
        updates.push('description = ?');
        params.push(updateData.description);
      }

      if (updates.length > 0) {
        updates.push('updated_at = ?');
        params.push(getCurrentTimestamp());
        params.push(roleId);

        const updateQuery = `
          UPDATE roles
          SET ${updates.join(', ')}
          WHERE id = ?
        `;

        db.prepare(updateQuery).run(...params);
      }

      // Update permissions if provided
      if (updateData.permission_ids) {
        await this.assignPermissionsToRole(roleId, updateData.permission_ids);
      }

      logger.info(`Role updated: ${roleId}`);

      return this.getRoleById(roleId);
    } catch (error) {
      logger.error('Failed to update role:', error);
      throw error;
    }
  }

  /**
   * Delete role
   * @param {string} roleId - Role ID
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteRole(roleId) {
    try {
      const db = await getDb();

      // Check if role exists
      const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(roleId);
      if (!role) {
        throw new Error('Role not found');
      }

      // Prevent deleting system roles
      if (role.is_system_role === 1) {
        throw new Error('Cannot delete system roles');
      }

      // Check if role has assigned users
      const userCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE role_id = ?').get(roleId);
      if (userCount.count > 0) {
        return {
          success: false,
          error: 'Cannot delete role with assigned users',
          data: {
            userCount: userCount.count
          }
        };
      }

      // Delete role (cascades to role_permissions)
      db.prepare('DELETE FROM roles WHERE id = ?').run(roleId);

      logger.info(`Role deleted: ${roleId}`);

      return {
        success: true,
        message: 'Role deleted successfully'
      };
    } catch (error) {
      logger.error('Failed to delete role:', error);
      throw error;
    }
  }

  /**
   * Assign permissions to role (replaces existing permissions)
   * @param {string} roleId - Role ID
   * @param {Array<string>} permissionIds - Permission IDs to assign
   * @returns {Promise<void>}
   */
  static async assignPermissionsToRole(roleId, permissionIds) {
    try {
      const db = await getDb();

      // Validate all permission IDs exist
      for (const permId of permissionIds) {
        const permission = db.prepare('SELECT id FROM permissions WHERE id = ?').get(permId);
        if (!permission) {
          throw new Error(`Invalid permission ID: ${permId}`);
        }
      }

      // Delete existing role permissions
      db.prepare('DELETE FROM role_permissions WHERE role_id = ?').run(roleId);

      // Insert new permissions
      const now = getCurrentTimestamp();
      const insertStmt = db.prepare(`
        INSERT INTO role_permissions (id, role_id, permission_id, created_at)
        VALUES (?, ?, ?, ?)
      `);

      for (const permId of permissionIds) {
        insertStmt.run(randomUUID(), roleId, permId, now);
      }

      logger.info(`Permissions assigned to role ${roleId}: ${permissionIds.length} permissions`);
    } catch (error) {
      logger.error('Failed to assign permissions:', error);
      throw error;
    }
  }
}

export default RoleService;
