/**
 * User Management Service
 * Handles CRUD operations for user accounts
 */

import { randomUUID } from 'crypto';
import { getDb, getCurrentTimestamp } from '../database/db.js';
import AuthService from './AuthService.js';
import { logger } from '../utils/logger.js';

class UserService {
  /**
   * Get all users with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Users list with pagination
   */
  static async getUsers(options = {}) {
    try {
      const db = await getDb();
      const {
        page = 1,
        limit = 20,
        search = '',
        status = '',
        role_id = ''
      } = options;

      const offset = (page - 1) * limit;

      // Build WHERE clause
      let whereConditions = [];
      let params = [];

      if (search) {
        whereConditions.push('(u.full_name LIKE ? OR u.email LIKE ?)');
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern);
      }

      if (status) {
        whereConditions.push('u.status = ?');
        params.push(status);
      }

      if (role_id) {
        whereConditions.push('u.role_id = ?');
        params.push(role_id);
      }

      const whereClause = whereConditions.length > 0
        ? 'WHERE ' + whereConditions.join(' AND ')
        : '';

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM users u
        ${whereClause}
      `;
      const { total } = db.prepare(countQuery).get(...params);

      // Get users
      const usersQuery = `
        SELECT u.id, u.email, u.full_name, u.status, u.created_at, u.updated_at, u.last_login_at,
               r.id as role_id, r.role_name, r.role_key
        FROM users u
        JOIN roles r ON u.role_id = r.id
        ${whereClause}
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?
      `;
      const users = db.prepare(usersQuery).all(...params, limit, offset);

      return {
        success: true,
        data: {
          users: users.map(u => ({
            id: u.id,
            email: u.email,
            name: u.full_name,
            status: u.status,
            role: {
              id: u.role_id,
              name: u.role_name,
              key: u.role_key
            },
            createdAt: u.created_at,
            updatedAt: u.updated_at,
            lastLoginAt: u.last_login_at
          })),
          pagination: {
            total: total,
            page: page,
            limit: limit,
            totalPages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      logger.error('Failed to get users:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User data
   */
  static async getUserById(userId) {
    try {
      const db = await getDb();

      const user = db.prepare(`
        SELECT u.id, u.email, u.full_name, u.status, u.created_at, u.updated_at, u.last_login_at,
               r.id as role_id, r.role_name, r.role_key
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
      `).get(userId);

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.full_name,
          status: user.status,
          role: {
            id: user.role_id,
            name: user.role_name,
            key: user.role_key
          },
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          lastLoginAt: user.last_login_at
        }
      };
    } catch (error) {
      logger.error('Failed to get user:', error);
      throw error;
    }
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.full_name - User full name
   * @param {string} userData.role_id - Role ID
   * @returns {Promise<Object>} Created user
   */
  static async createUser(userData) {
    try {
      const db = await getDb();

      // Validate required fields
      if (!userData.email || !userData.password || !userData.full_name || !userData.role_id) {
        throw new Error('Email, password, full name, and role are required');
      }

      // Check if email already exists
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(userData.email);
      if (existingUser) {
        throw new Error('Email already exists');
      }

      // Validate role exists
      const role = db.prepare('SELECT id FROM roles WHERE id = ?').get(userData.role_id);
      if (!role) {
        throw new Error('Invalid role ID');
      }

      // Validate password length
      if (userData.password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      // Hash password
      const passwordHash = await AuthService.hashPassword(userData.password);

      const userId = randomUUID();
      const now = getCurrentTimestamp();

      // Insert user
      db.prepare(`
        INSERT INTO users (id, email, password_hash, full_name, role_id, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        userData.email,
        passwordHash,
        userData.full_name,
        userData.role_id,
        'active',
        now,
        now
      );

      logger.info(`User created: ${userData.email}`);

      return this.getUserById(userId);
    } catch (error) {
      logger.error('Failed to create user:', error);
      throw error;
    }
  }

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @param {string} currentUserId - ID of user making the update
   * @returns {Promise<Object>} Updated user
   */
  static async updateUser(userId, updateData, currentUserId) {
    try {
      const db = await getDb();

      // Check if user exists
      const user = db.prepare('SELECT id, role_id FROM users WHERE id = ?').get(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Prevent modifying own role or status
      if (userId === currentUserId && (updateData.role_id || updateData.status)) {
        throw new Error('Cannot modify your own role or status');
      }

      const updates = [];
      const params = [];

      if (updateData.full_name) {
        updates.push('full_name = ?');
        params.push(updateData.full_name);
      }

      if (updateData.role_id) {
        // Validate role exists
        const role = db.prepare('SELECT id FROM roles WHERE id = ?').get(updateData.role_id);
        if (!role) {
          throw new Error('Invalid role ID');
        }
        updates.push('role_id = ?');
        params.push(updateData.role_id);
      }

      if (updateData.status) {
        if (!['active', 'inactive', 'suspended'].includes(updateData.status)) {
          throw new Error('Invalid status');
        }
        updates.push('status = ?');
        params.push(updateData.status);
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      updates.push('updated_at = ?');
      params.push(getCurrentTimestamp());
      params.push(userId);

      const updateQuery = `
        UPDATE users
        SET ${updates.join(', ')}
        WHERE id = ?
      `;

      db.prepare(updateQuery).run(...params);

      logger.info(`User updated: ${userId}`);

      return this.getUserById(userId);
    } catch (error) {
      logger.error('Failed to update user:', error);
      throw error;
    }
  }

  /**
   * Delete user
   * @param {string} userId - User ID to delete
   * @param {string} currentUserId - ID of user making the deletion
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteUser(userId, currentUserId) {
    try {
      const db = await getDb();

      // Prevent self-deletion
      if (userId === currentUserId) {
        throw new Error('Cannot delete yourself');
      }

      // Check if user exists
      const user = db.prepare('SELECT id, role_id FROM users WHERE id = ?').get(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get role key
      const role = db.prepare('SELECT role_key FROM roles WHERE id = ?').get(user.role_id);

      // Prevent deleting last admin
      if (role.role_key === 'admin') {
        const adminCount = db.prepare(`
          SELECT COUNT(*) as count
          FROM users u
          JOIN roles r ON u.role_id = r.id
          WHERE r.role_key = 'admin' AND u.status = 'active'
        `).get();

        if (adminCount.count <= 1) {
          throw new Error('Cannot delete the last admin user');
        }
      }

      // Delete user (cascades to refresh_tokens)
      db.prepare('DELETE FROM users WHERE id = ?').run(userId);

      logger.info(`User deleted: ${userId}`);

      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      logger.error('Failed to delete user:', error);
      throw error;
    }
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Update result
   */
  static async changePassword(userId, newPassword) {
    try {
      const db = await getDb();

      // Validate password length
      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      // Hash new password
      const passwordHash = await AuthService.hashPassword(newPassword);

      // Update password
      db.prepare(`
        UPDATE users
        SET password_hash = ?, updated_at = ?
        WHERE id = ?
      `).run(passwordHash, getCurrentTimestamp(), userId);

      logger.info(`Password changed for user: ${userId}`);

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      logger.error('Failed to change password:', error);
      throw error;
    }
  }
}

export default UserService;
