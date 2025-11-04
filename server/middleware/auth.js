/**
 * Authentication and Authorization Middleware
 * Validates JWT tokens and checks user permissions
 */

import AuthService from '../services/AuthService.js';
import { logger } from '../utils/logger.js';

/**
 * Middleware to verify JWT token and attach user to request
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export function authenticate(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = AuthService.verifyAccessToken(token);

    // Attach user data to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      roleKey: decoded.roleKey,
      permissions: decoded.permissions
    };

    next();
  } catch (error) {
    logger.error('Authentication failed:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token'
    });
  }
}

/**
 * Middleware factory to check if user has required permission
 * @param {string} requiredPermission - Permission key required
 * @returns {Function} Express middleware
 */
export function authorize(requiredPermission) {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Check if user has required permission
      if (!req.user.permissions || !req.user.permissions.includes(requiredPermission)) {
        logger.warn(`User ${req.user.email} attempted to access resource without permission: ${requiredPermission}`);
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to access this resource'
        });
      }

      next();
    } catch (error) {
      logger.error('Authorization failed:', error);
      return res.status(403).json({
        success: false,
        error: 'Permission check failed'
      });
    }
  };
}

/**
 * Middleware factory to check if user has any of the required permissions
 * @param {Array<string>} requiredPermissions - Array of permission keys
 * @returns {Function} Express middleware
 */
export function authorizeAny(requiredPermissions) {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Check if user has any of the required permissions
      const hasPermission = requiredPermissions.some(permission =>
        req.user.permissions && req.user.permissions.includes(permission)
      );

      if (!hasPermission) {
        logger.warn(`User ${req.user.email} attempted to access resource without any of permissions: ${requiredPermissions.join(', ')}`);
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to access this resource'
        });
      }

      next();
    } catch (error) {
      logger.error('Authorization failed:', error);
      return res.status(403).json({
        success: false,
        error: 'Permission check failed'
      });
    }
  };
}

/**
 * Middleware to check if user is admin
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export function requireAdmin(req, res, next) {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Check if user is admin
    if (req.user.roleKey !== 'admin') {
      logger.warn(`Non-admin user ${req.user.email} attempted to access admin resource`);
      return res.status(403).json({
        success: false,
        error: 'Administrator access required'
      });
    }

    next();
  } catch (error) {
    logger.error('Admin check failed:', error);
    return res.status(403).json({
      success: false,
      error: 'Permission check failed'
    });
  }
}

/**
 * Optional authentication middleware - attaches user if token present but doesn't require it
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = AuthService.verifyAccessToken(token);
      
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        roleKey: decoded.roleKey,
        permissions: decoded.permissions
      };
    }

    next();
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
}
