/**
 * Authentication Database Seeder
 * Seeds default roles, permissions, and initial admin user
 */

import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { getDb } from './db.js';
import { logger } from '../utils/logger.js';

/**
 * Generate current ISO timestamp
 */
function now() {
  return new Date().toISOString();
}

/**
 * Seed roles
 */
async function seedRoles(db) {
  logger.info('Seeding roles...');
  
  const roles = [
    {
      id: randomUUID(),
      role_name: 'Admin',
      role_key: 'admin',
      description: 'Full system access with user and role management',
      is_system_role: 1,
      created_at: now(),
      updated_at: now()
    },
    {
      id: randomUUID(),
      role_name: 'Sales Agent',
      role_key: 'sales_agent',
      description: 'Limited access to operational pages only',
      is_system_role: 1,
      created_at: now(),
      updated_at: now()
    }
  ];

  const insertRole = db.prepare(`
    INSERT INTO roles (id, role_name, role_key, description, is_system_role, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const role of roles) {
    insertRole.run(
      role.id,
      role.role_name,
      role.role_key,
      role.description,
      role.is_system_role,
      role.created_at,
      role.updated_at
    );
  }

  logger.info(`✓ Seeded ${roles.length} roles`);
  return roles;
}

/**
 * Seed permissions
 */
async function seedPermissions(db) {
  logger.info('Seeding permissions...');
  
  const resources = [
    { resource: 'dashboard', description: 'Main dashboard overview' },
    { resource: 'crm', description: 'Customer relationship management' },
    { resource: 'inquiries', description: 'Product inquiries management' },
    { resource: 'orders', description: 'Order processing and tracking' },
    { resource: 'inventory', description: 'Product inventory management' },
    { resource: 'invoices', description: 'Invoice generation and management' },
    { resource: 'reports', description: 'Business reporting and analytics' },
    { resource: 'users', description: 'User management' },
    { resource: 'roles', description: 'Role and permission management' }
  ];

  const permissions = [];
  const insertPermission = db.prepare(`
    INSERT INTO permissions (id, permission_key, resource, action, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const { resource, description } of resources) {
    const permission = {
      id: randomUUID(),
      permission_key: `view_${resource}`,
      resource,
      action: 'view',
      description: `View ${description}`,
      created_at: now()
    };
    
    insertPermission.run(
      permission.id,
      permission.permission_key,
      permission.resource,
      permission.action,
      permission.description,
      permission.created_at
    );
    
    permissions.push(permission);
  }

  // Add additional permissions for user and role management
  const managementPermissions = [
    { key: 'create_users', resource: 'users', action: 'create', description: 'Create new users' },
    { key: 'edit_users', resource: 'users', action: 'edit', description: 'Edit user details' },
    { key: 'delete_users', resource: 'users', action: 'delete', description: 'Delete users' },
    { key: 'create_roles', resource: 'roles', action: 'create', description: 'Create custom roles' },
    { key: 'edit_roles', resource: 'roles', action: 'edit', description: 'Edit role permissions' },
    { key: 'delete_roles', resource: 'roles', action: 'delete', description: 'Delete custom roles' }
  ];

  for (const { key, resource, action, description } of managementPermissions) {
    const permission = {
      id: randomUUID(),
      permission_key: key,
      resource,
      action,
      description,
      created_at: now()
    };
    
    insertPermission.run(
      permission.id,
      permission.permission_key,
      permission.resource,
      permission.action,
      permission.description,
      permission.created_at
    );
    
    permissions.push(permission);
  }

  logger.info(`✓ Seeded ${permissions.length} permissions`);
  return permissions;
}

/**
 * Seed role permissions
 */
async function seedRolePermissions(db, roles, permissions) {
  logger.info('Assigning permissions to roles...');
  
  const adminRole = roles.find(r => r.role_key === 'admin');
  const salesAgentRole = roles.find(r => r.role_key === 'sales_agent');

  const insertRolePermission = db.prepare(`
    INSERT INTO role_permissions (id, role_id, permission_id, created_at)
    VALUES (?, ?, ?, ?)
  `);

  // Admin gets all permissions
  let count = 0;
  for (const permission of permissions) {
    insertRolePermission.run(
      randomUUID(),
      adminRole.id,
      permission.id,
      now()
    );
    count++;
  }

  // Sales Agent gets limited permissions
  const salesAgentResources = ['dashboard', 'crm', 'inquiries', 'orders', 'inventory'];
  const salesAgentPermissions = permissions.filter(p => 
    salesAgentResources.includes(p.resource) && p.action === 'view'
  );

  for (const permission of salesAgentPermissions) {
    insertRolePermission.run(
      randomUUID(),
      salesAgentRole.id,
      permission.id,
      now()
    );
    count++;
  }

  logger.info(`✓ Assigned ${count} role-permission mappings`);
}

/**
 * Seed initial admin user
 */
async function seedAdminUser(db, roles) {
  logger.info('Creating initial admin user...');
  
  const adminRole = roles.find(r => r.role_key === 'admin');
  const password = 'admin123'; // Default password - should be changed on first login
  const passwordHash = await bcrypt.hash(password, 10);

  const adminUser = {
    id: randomUUID(),
    email: 'admin@shoporbit.com',
    password_hash: passwordHash,
    full_name: 'System Administrator',
    role_id: adminRole.id,
    status: 'active',
    created_at: now(),
    updated_at: now(),
    last_login_at: null
  };

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, full_name, role_id, status, created_at, updated_at, last_login_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(
    adminUser.id,
    adminUser.email,
    adminUser.password_hash,
    adminUser.full_name,
    adminUser.role_id,
    adminUser.status,
    adminUser.created_at,
    adminUser.updated_at,
    adminUser.last_login_at
  );

  logger.info(`✓ Created admin user: ${adminUser.email} / ${password}`);
  logger.warn('⚠ IMPORTANT: Change the default admin password after first login!');
}

/**
 * Main seed function
 */
export async function seedAuthData() {
  try {
    const db = await getDb();
    
    logger.info('Starting authentication data seeding...');
    
    // Check if roles already exist
    const existingRoles = db.prepare('SELECT COUNT(*) as count FROM roles').get();
    if (existingRoles.count > 0) {
      logger.warn('Roles already exist. Skipping seed.');
      return;
    }

    // Seed in order
    const roles = await seedRoles(db);
    const permissions = await seedPermissions(db);
    await seedRolePermissions(db, roles, permissions);
    await seedAdminUser(db, roles);

    logger.info('✓ Authentication data seeding completed successfully');
    
  } catch (error) {
    logger.error('Failed to seed authentication data:', error);
    throw error;
  }
}

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAuthData()
    .then(() => {
      logger.info('Seeding complete');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}
