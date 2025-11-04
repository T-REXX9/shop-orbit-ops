# JWT Role-Based Permission System - Implementation Guide

## ✅ Completed Components

### Phase 1: Database Schema (COMPLETE)
- ✅ `server/database/auth-schema.sql` - Authentication tables schema
- ✅ `server/database/seedAuth.js` - Seed script for roles and permissions
- ✅ `server/database/db.js` - Updated to include auth schema initialization

**Default Admin Credentials:**
- Email: `admin@shoporbit.com`
- Password: `admin123`

### Phase 2: Backend Authentication (COMPLETE)
- ✅ `server/services/AuthService.js` - JWT generation, login, logout, token refresh
- ✅ `server/middleware/auth.js` - JWT validation and permission checking middleware
- ✅ `server/routes/auth.js` - Authentication endpoints
- ✅ `server/package.json` - Added jsonwebtoken and bcryptjs dependencies

**Endpoints Created:**
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout and revoke refresh token
- `GET /api/v1/auth/me` - Get current user data

### Phase 3: Backend User & Role Management (COMPLETE)
- ✅ `server/services/UserService.js` - User CRUD operations
- ✅ `server/services/RoleService.js` - Role management and permission assignment
- ✅ `server/services/PermissionService.js` - Permission queries
- ✅ `server/routes/users.js` - User management endpoints
- ✅ `server/routes/roles.js` - Role management endpoints
- ✅ `server/server.js` - Updated to mount new routes

**User Management Endpoints:**
- `GET /api/v1/users` - List users with pagination
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create new user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `PUT /api/v1/users/:id/password` - Change user password

**Role Management Endpoints:**
- `GET /api/v1/roles` - List all roles
- `GET /api/v1/roles/:id` - Get role with permissions
- `POST /api/v1/roles` - Create custom role
- `PUT /api/v1/roles/:id` - Update role
- `DELETE /api/v1/roles/:id` - Delete role
- `GET /api/v1/permissions/all` - Get all available permissions

### Phase 4: Frontend Authentication (COMPLETE)
- ✅ `src/types/api.ts` - Updated TypeScript types for auth
- ✅ `src/contexts/AuthContext.tsx` - Updated with real API integration and token refresh
- ✅ `src/hooks/usePermission.ts` - Permission checking hook
- ✅ `src/components/auth/ProtectedRoute.tsx` - Enhanced route protection with permissions

## 📋 Remaining Implementation (Phase 5 & 6)

### Phase 5: Frontend UI Components

#### 1. User Management Page
Create `src/pages/UserManagement.tsx` with:
- User list table with search and filters
- Create user modal with form (email, password, name, role selection)
- Edit user modal (update name, role, status)
- Delete confirmation dialog
- Password change dialog
- Integration with TanStack Query for data fetching

#### 2. Role Management Page
Create `src/pages/RoleManagement.tsx` with:
- Role list table showing permission counts and user counts
- Create role modal with permission checkboxes grouped by resource
- Edit role modal for custom roles only (system roles cannot be modified)
- Delete confirmation with user count warning
- Permission tree/checklist component

#### 3. Update App.tsx
Add routes for user and role management:
```tsx
<Route path="/users" element={
  <ProtectedRoute requiredPermission="view_users">
    <AppLayout><UserManagement /></AppLayout>
  </ProtectedRoute>
} />
<Route path="/roles" element={
  <ProtectedRoute requiredPermission="view_roles">
    <AppLayout><RoleManagement /></AppLayout>
  </ProtectedRoute>
} />
```

#### 4. Update AppLayout Navigation
Modify `src/components/layout/AppLayout.tsx`:
- Import usePermission hook
- Filter menu items based on user permissions
- Hide Users and Roles menu for non-admin users

Example:
```tsx
const { canView } = usePermission();

const menuItems = [
  canView('dashboard') && { key: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  canView('crm') && { key: 'crm', label: 'CRM', path: '/crm' },
  // ... other items
  canView('users') && { key: 'users', label: 'Users', path: '/users' },
  canView('roles') && { key: 'roles', label: 'Roles', path: '/roles' },
].filter(Boolean);
```

### Phase 6: Testing & Deployment

#### 1. Database Initialization
Run these commands in the server directory:
```bash
cd server
npm install
npm run init-db
npm run seed-auth
```

#### 2. Start Backend Server
```bash
npm run dev
```

#### 3. Start Frontend
In the root directory:
```bash
npm install
npm run dev
```

#### 4. Test Authentication Flow
1. Navigate to `/login`
2. Login with `admin@shoporbit.com` / `admin123`
3. Verify redirect to dashboard
4. Check user permissions in browser console
5. Test token refresh by waiting for expiration
6. Test logout functionality

#### 5. Test User Management
1. Navigate to `/users`
2. Create a new user with Sales Agent role
3. Edit user details
4. Change user status
5. Attempt to delete admin user (should fail)
6. Logout and login as new user
7. Verify limited page access

#### 6. Test Role Management
1. Login as admin
2. Navigate to `/roles`
3. Create a custom role with specific permissions
4. Assign role to a user
5. Login as that user and verify permissions
6. Attempt to modify system roles (should fail)
7. Delete custom role without assigned users

## 🔐 Security Configuration

### Environment Variables
Create `.env` file in the server directory:
```env
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_ACCESS_TOKEN_EXPIRY=1h
JWT_REFRESH_TOKEN_EXPIRY=7d
BCRYPT_ROUNDS=10
PORT=3001
```

**IMPORTANT:** Change the JWT_SECRET to a strong random string for production!

## 📊 Permission Structure

### System Roles
1. **Admin** - Full access to all resources
2. **Sales Agent** - Limited to operational pages (dashboard, crm, inquiries, orders, inventory)

### Available Permissions (by resource)
- `view_dashboard` - View dashboard
- `view_crm` - View CRM
- `view_inquiries` - View inquiries
- `view_orders` - View orders
- `view_inventory` - View inventory
- `view_invoices` - View invoices
- `view_reports` - View reports
- `view_users` - View user management
- `create_users` - Create new users
- `edit_users` - Edit user details
- `delete_users` - Delete users
- `view_roles` - View role management
- `create_roles` - Create custom roles
- `edit_roles` - Edit role permissions
- `delete_roles` - Delete custom roles

## 🎯 Usage Examples

### Backend: Protect an Endpoint
```javascript
import { authenticate, authorize } from '../middleware/auth.js';

router.get('/sensitive-data',
  authenticate,
  authorize('view_reports'),
  async (req, res) => {
    // Only users with 'view_reports' permission can access
    // req.user contains userId, email, roleKey, permissions
  }
);
```

### Frontend: Conditional Rendering
```tsx
import { usePermission } from '@/hooks/usePermission';

function MyComponent() {
  const { hasPermission, isAdmin } = usePermission();

  return (
    <div>
      {hasPermission('create_users') && (
        <Button onClick={createUser}>Create User</Button>
      )}
      {isAdmin() && (
        <AdminPanel />
      )}
    </div>
  );
}
```

### Frontend: Protected Route
```tsx
<Route path="/admin" element={
  <ProtectedRoute requiredPermission="view_users">
    <AdminDashboard />
  </ProtectedRoute>
} />
```

## 🚀 Deployment Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Update CORS_ORIGIN to production frontend URL
- [ ] Run database migrations in production
- [ ] Seed initial admin user
- [ ] Change default admin password immediately
- [ ] Enable HTTPS for production
- [ ] Set up proper database backups
- [ ] Configure rate limiting on auth endpoints
- [ ] Review and test all permission configurations
- [ ] Monitor authentication logs for suspicious activity

## 🛠️ Troubleshooting

### "Token invalid or expired" Error
- Check if JWT_SECRET is consistent between requests
- Verify token expiration settings
- Clear localStorage and login again

### "Permission denied" Error
- Check user's role permissions in database
- Verify permission key matches exactly
- Ensure user is assigned to a role with permissions

### Cannot Login
- Verify backend server is running on correct port
- Check CORS configuration includes frontend origin
- Verify database seeding completed successfully
- Check browser console for error messages

### Database Errors
- Ensure auth schema was applied after main schema
- Verify foreign key constraints are enabled
- Check that all migrations ran successfully

## 📚 API Documentation

Full API documentation is available by running the backend server and navigating to:
`http://localhost:3001/api/v1`

This will show all available endpoints and their descriptions.

## 🎉 Next Steps

After completing the implementation:

1. **Customize Permissions**: Add more fine-grained permissions for specific actions
2. **Audit Logging**: Implement activity logging for user actions
3. **Password Policies**: Add password strength requirements and expiration
4. **MFA**: Implement two-factor authentication
5. **Session Management**: Add ability to view and revoke active sessions
6. **API Keys**: Implement API key authentication for programmatic access
7. **Permission Inheritance**: Create permission hierarchies
8. **User Groups**: Allow users to belong to multiple groups

## 🤝 Support

For issues or questions, refer to:
- Design Document: `.qoder/quests/jwt-role-based-permission-system.md`
- This Implementation Guide
- Backend API endpoint documentation
