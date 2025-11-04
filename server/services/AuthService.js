/**
 * Authentication Service
 * Handles user authentication, token generation, and token refresh
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { getDb, getCurrentTimestamp } from '../database/db.js';
import { logger } from '../utils/logger.js';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_TOKEN_EXPIRY || '1h';
const JWT_REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');

class AuthService {
  /**
   * Authenticate user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Authentication result with tokens and user data
   */
  static async login(email, password) {
    try {
      const db = await getDb();
      
      // Find user by email
      const user = db.prepare(`
        SELECT u.*, r.role_name, r.role_key, r.id as role_id
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.email = ?
      `).get(email);

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if user is active
      if (user.status !== 'active') {
        throw new Error('Account is not active');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Load user permissions
      const permissions = this.getUserPermissions(user.id);

      // Update last login timestamp
      db.prepare(`
        UPDATE users SET last_login_at = ? WHERE id = ?
      `).run(getCurrentTimestamp(), user.id);

      // Generate tokens
      const accessToken = this.generateAccessToken(user, permissions);
      const refreshToken = await this.generateRefreshToken(user.id);

      // Remove sensitive data
      delete user.password_hash;

      return {
        success: true,
        data: {
          token: accessToken,
          refreshToken: refreshToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.full_name,
            role: {
              id: user.role_id,
              name: user.role_name,
              key: user.role_key
            },
            permissions: permissions
          }
        }
      };
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New access token and refresh token
   */
  static async refreshAccessToken(refreshToken) {
    try {
      const db = await getDb();
      
      // Hash the refresh token to find in database
      const tokenHash = await bcrypt.hash(refreshToken, 1);
      
      // Find refresh token in database
      const storedToken = db.prepare(`
        SELECT rt.*, u.id as user_id, u.email, u.full_name, u.role_id, r.role_name, r.role_key
        FROM refresh_tokens rt
        JOIN users u ON rt.user_id = u.id
        JOIN roles r ON u.role_id = r.id
        WHERE rt.token_hash = ? AND rt.revoked_at IS NULL
      `).get(tokenHash);

      if (!storedToken) {
        throw new Error('Invalid refresh token');
      }

      // Check if token is expired
      const expiresAt = new Date(storedToken.expires_at);
      if (expiresAt < new Date()) {
        throw new Error('Refresh token expired');
      }

      // Load user permissions
      const permissions = this.getUserPermissions(storedToken.user_id);

      // Generate new access token
      const user = {
        id: storedToken.user_id,
        email: storedToken.email,
        full_name: storedToken.full_name,
        role_id: storedToken.role_id,
        role_name: storedToken.role_name,
        role_key: storedToken.role_key
      };

      const newAccessToken = this.generateAccessToken(user, permissions);
      
      // Generate new refresh token
      const newRefreshToken = await this.generateRefreshToken(user.id);
      
      // Revoke old refresh token
      db.prepare(`
        UPDATE refresh_tokens SET revoked_at = ? WHERE id = ?
      `).run(getCurrentTimestamp(), storedToken.id);

      return {
        success: true,
        data: {
          token: newAccessToken,
          refreshToken: newRefreshToken
        }
      };
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Logout user by revoking refresh token
   * @param {string} refreshToken - Refresh token to revoke
   * @returns {Promise<Object>} Logout result
   */
  static async logout(refreshToken) {
    try {
      const db = await getDb();
      
      // Hash the refresh token
      const tokenHash = await bcrypt.hash(refreshToken, 1);
      
      // Revoke refresh token
      db.prepare(`
        UPDATE refresh_tokens SET revoked_at = ? WHERE token_hash = ?
      `).run(getCurrentTimestamp(), tokenHash);

      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      logger.error('Logout failed:', error);
      throw error;
    }
  }

  /**
   * Generate JWT access token
   * @param {Object} user - User data
   * @param {Array<string>} permissions - User permissions
   * @returns {string} JWT access token
   */
  static generateAccessToken(user, permissions) {
    const payload = {
      userId: user.id,
      email: user.email,
      roleKey: user.role_key,
      permissions: permissions
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_ACCESS_TOKEN_EXPIRY
    });
  }

  /**
   * Generate refresh token and store in database
   * @param {string} userId - User ID
   * @returns {Promise<string>} Refresh token
   */
  static async generateRefreshToken(userId) {
    const db = await getDb();
    
    // Generate random refresh token
    const refreshToken = randomUUID();
    
    // Hash token for storage
    const tokenHash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);
    
    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
    
    // Store in database
    db.prepare(`
      INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      randomUUID(),
      userId,
      tokenHash,
      expiresAt.toISOString(),
      getCurrentTimestamp()
    );

    return refreshToken;
  }

  /**
   * Verify JWT access token
   * @param {string} token - JWT access token
   * @returns {Object} Decoded token payload
   */
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Get user permissions by user ID
   * @param {string} userId - User ID
   * @returns {Array<string>} Array of permission keys
   */
  static getUserPermissions(userId) {
    const db = getDb();
    
    const permissions = db.prepare(`
      SELECT DISTINCT p.permission_key
      FROM users u
      JOIN roles r ON u.role_id = r.id
      JOIN role_permissions rp ON r.id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE u.id = ?
    `).all(userId);

    return permissions.map(p => p.permission_key);
  }

  /**
   * Get current user data from token
   * @param {string} userId - User ID from token
   * @returns {Promise<Object>} User data with permissions
   */
  static async getCurrentUser(userId) {
    try {
      const db = await getDb();
      
      const user = db.prepare(`
        SELECT u.id, u.email, u.full_name, u.status, u.last_login_at,
               r.id as role_id, r.role_name, r.role_key
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
      `).get(userId);

      if (!user) {
        throw new Error('User not found');
      }

      const permissions = this.getUserPermissions(userId);

      return {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.full_name,
          status: user.status,
          lastLoginAt: user.last_login_at,
          role: {
            id: user.role_id,
            name: user.role_name,
            key: user.role_key
          },
          permissions: permissions
        }
      };
    } catch (error) {
      logger.error('Failed to get current user:', error);
      throw error;
    }
  }

  /**
   * Hash password using bcrypt
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  static async hashPassword(password) {
    return await bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  /**
   * Compare password with hash
   * @param {string} password - Plain text password
   * @param {string} hash - Password hash
   * @returns {Promise<boolean>} Match result
   */
  static async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }
}

export default AuthService;
