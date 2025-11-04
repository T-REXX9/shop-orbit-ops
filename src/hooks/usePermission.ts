/**
 * Permission Hook
 * Provides permission checking utilities for components
 */

import { useAuth } from '@/contexts/AuthContext';

export function usePermission() {
  const { user } = useAuth();

  /**
   * Check if user has a specific permission
   * @param permissionKey - Permission key to check
   * @returns true if user has the permission
   */
  const hasPermission = (permissionKey: string): boolean => {
    if (!user || !user.permissions) {
      return false;
    }
    return user.permissions.includes(permissionKey);
  };

  /**
   * Check if user has any of the specified permissions
   * @param permissionKeys - Array of permission keys
   * @returns true if user has at least one permission
   */
  const hasAnyPermission = (permissionKeys: string[]): boolean => {
    if (!user || !user.permissions) {
      return false;
    }
    return permissionKeys.some(key => user.permissions.includes(key));
  };

  /**
   * Check if user has all of the specified permissions
   * @param permissionKeys - Array of permission keys
   * @returns true if user has all permissions
   */
  const hasAllPermissions = (permissionKeys: string[]): boolean => {
    if (!user || !user.permissions) {
      return false;
    }
    return permissionKeys.every(key => user.permissions.includes(key));
  };

  /**
   * Check if user is admin
   * @returns true if user has admin role
   */
  const isAdmin = (): boolean => {
    if (!user || !user.role) {
      return false;
    }
    return user.role.key === 'admin';
  };

  /**
   * Check if user can view a specific resource
   * @param resource - Resource name (e.g., 'dashboard', 'users')
   * @returns true if user can view the resource
   */
  const canView = (resource: string): boolean => {
    return hasPermission(`view_${resource}`);
  };

  /**
   * Check if user can create in a specific resource
   * @param resource - Resource name
   * @returns true if user can create
   */
  const canCreate = (resource: string): boolean => {
    return hasPermission(`create_${resource}`);
  };

  /**
   * Check if user can edit a specific resource
   * @param resource - Resource name
   * @returns true if user can edit
   */
  const canEdit = (resource: string): boolean => {
    return hasPermission(`edit_${resource}`);
  };

  /**
   * Check if user can delete from a specific resource
   * @param resource - Resource name
   * @returns true if user can delete
   */
  const canDelete = (resource: string): boolean => {
    return hasPermission(`delete_${resource}`);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    canView,
    canCreate,
    canEdit,
    canDelete,
  };
}
