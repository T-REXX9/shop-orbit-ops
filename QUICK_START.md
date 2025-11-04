# Quick Start Guide - JWT Role-Based Permission System

## 🚀 Installation and Setup

### Step 1: Install Backend Dependencies

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

The following packages will be installed:
- `jsonwebtoken` - JWT token generation and verification
- `bcryptjs` - Password hashing
- All existing dependencies

### Step 2: Initialize the Database

Run the database initialization script:

```bash
npm run init-db
```

This will:
- Create the main database schema
- Create authentication tables (users, roles, permissions, refresh_tokens)
- Set up all necessary indexes

### Step 3: Seed Authentication Data

Seed the database with default roles and admin user:

```bash
npm run seed-auth
```

This creates:
- **Admin Role** with full permissions
- **Sales Agent Role** with limited permissions
- **Default Admin User**:
  - Email: `admin@shoporbit.com`
  - Password: `admin123`

⚠️ **IMPORTANT**: Change the admin password immediately after first login!

### Step 4: Configure Environment

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_PATH=./database.sqlite

# JWT Configuration
JWT_SECRET=change-this-to-a-very-strong-random-secret-key-in-production
JWT_ACCESS_TOKEN_EXPIRY=1h
JWT_REFRESH_TOKEN_EXPIRY=7d

# Security
BCRYPT_ROUNDS=10

# CORS
CORS_ORIGIN=http://localhost:5173
```

**For Production**: Generate a secure JWT_SECRET using:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 5: Start the Backend Server

```bash
npm run dev
```

The server will start on http://localhost:3001

Verify it's running by visiting: http://localhost:3001/health

### Step 6: Install Frontend Dependencies

In a new terminal, navigate to the root directory:

```bash
cd ..
npm install
```

### Step 7: Configure Frontend Environment

The frontend uses the existing `.env` configuration. Verify that `VITE_API_BASE_URL` points to your backend:

```env
VITE_API_BASE_URL=http://localhost:3001
```

### Step 8: Start the Frontend

```bash
npm run dev
```

The frontend will start on http://localhost:5173

## ✅ Verify Installation

### 1. Test Backend API

Visit http://localhost:3001/api/v1 - You should see the API info response

### 2. Test Authentication

Open your browser and navigate to: http://localhost:5173/login

Login with:
- Email: `admin@shoporbit.com`
- Password: `admin123`

You should be redirected to the dashboard.

### 3. Test Permissions

As admin, you should see all menu items including:
- Dashboard
- CRM
- Inquiries
- Orders
- Inventory
- Invoices
- Reports
- **Users** (admin only)
- **Roles** (admin only)

### 4. Create a Test User

1. Navigate to Users page
2. Click "Create User"
3. Fill in the form:
   - Email: `sales@example.com`
   - Name: `Sales Person`
   - Password: `password123`
   - Role: Sales Agent
4. Click Create

### 5. Test Role Restrictions

1. Logout from admin account
2. Login as the sales user:
   - Email: `sales@example.com`
   - Password: `password123`
3. Verify that:
   - Users and Roles menu items are hidden
   - Attempting to access `/users` shows 403 Forbidden
   - Can only access: Dashboard, CRM, Inquiries, Orders, Inventory

## 🎯 Common Tasks

### Create a New User

1. Login as admin
2. Go to Users page
3. Click "Create User"
4. Fill in email, name, password, and select role
5. Click Create

### Create a Custom Role

1. Login as admin
2. Go to Roles page
3. Click "Create Role"
4. Enter role name and description
5. Select permissions by checking boxes
6. Click Create

### Change User Password

1. Login as admin
2. Go to Users page
3. Click "Password" button for the user
4. Enter new password (min 8 characters)
5. Click OK

### Modify Role Permissions

1. Login as admin
2. Go to Roles page
3. Click "Edit" for a custom role (system roles cannot be edited)
4. Modify permission selections
5. Click OK

Note: Changes take effect immediately for all users with that role

## 🔒 Security Best Practices

### Production Deployment

1. **Change JWT Secret**: Use a strong, random secret key
2. **Update Admin Password**: Change from default immediately
3. **Enable HTTPS**: Always use SSL/TLS in production
4. **Database Backups**: Set up regular database backups
5. **Update CORS**: Restrict CORS_ORIGIN to your production domain
6. **Environment Variables**: Never commit `.env` files

### Password Policy

Current requirements:
- Minimum 8 characters
- No complexity requirements (can be enhanced)

Recommended enhancements:
- Require uppercase, lowercase, numbers, and symbols
- Implement password expiration
- Prevent password reuse

### Token Management

- Access tokens expire after 1 hour
- Refresh tokens expire after 7 days
- Tokens are automatically refreshed on API calls
- Refresh tokens are stored hashed in database
- Logout revokes the refresh token

## 🐛 Troubleshooting

### Backend Issues

**"Port 3001 already in use"**
- Stop any process using port 3001
- Or change PORT in .env file

**"Database initialization failed"**
- Delete `database.sqlite` file
- Run `npm run init-db` again
- Then run `npm run seed-auth`

**"JWT Secret not configured"**
- Ensure JWT_SECRET is set in .env
- Restart the server after adding it

### Frontend Issues

**"Cannot connect to backend"**
- Verify backend is running on http://localhost:3001
- Check VITE_API_BASE_URL in frontend .env
- Verify CORS configuration in backend

**"401 Unauthorized on all requests"**
- Clear browser localStorage
- Login again
- Check that JWT_SECRET hasn't changed

**"403 Forbidden on specific pages"**
- Verify user has required permission
- Check role permissions in Roles page
- Ensure permission key matches route requirement

### Database Issues

**"Foreign key constraint failed"**
- Ensure foreign keys are enabled
- Check that referenced records exist
- Verify migration order (main schema before auth schema)

**"Unique constraint violation"**
- Check for duplicate emails
- Verify role names are unique
- Ensure permission keys don't duplicate

## 📚 Next Steps

After successful setup:

1. **Customize Permissions**: Add more granular permissions for specific actions
2. **Audit Logging**: Track user actions for compliance
3. **Password Policies**: Implement stricter password requirements
4. **Multi-Factor Auth**: Add 2FA for enhanced security
5. **Session Management**: Allow users to view/revoke active sessions
6. **API Documentation**: Document all endpoints with Swagger/OpenAPI
7. **Testing**: Write unit and integration tests
8. **Monitoring**: Set up logging and error tracking

## 📖 Documentation

- **Full Design**: `.qoder/quests/jwt-role-based-permission-system.md`
- **Implementation Guide**: `IMPLEMENTATION_GUIDE.md`
- **API Reference**: Visit http://localhost:3001/api/v1 when server is running

## ✨ Features Overview

### Implemented Features

✅ JWT-based authentication with token refresh
✅ Role-based access control (RBAC)
✅ Custom role creation by administrators
✅ Dynamic permission assignment
✅ User management (create, edit, delete, password change)
✅ Page-level access control
✅ Permission-based navigation filtering
✅ Auto-logout on token expiration
✅ Password hashing with bcrypt
✅ Protection against self-deletion and last admin deletion
✅ System roles (Admin, Sales Agent)
✅ Refresh token storage and management
✅ Permission checking hooks and components
✅ TypeScript type safety throughout

### Available Permissions

- view_dashboard - Access to main dashboard
- view_crm - Customer relationship management
- view_inquiries - Product inquiries
- view_orders - Order management
- view_inventory - Inventory management
- view_invoices - Invoice management
- view_reports - Business reports
- view_users - User management (view)
- create_users - Create new users
- edit_users - Edit user details
- delete_users - Delete users
- view_roles - Role management (view)
- create_roles - Create custom roles
- edit_roles - Edit role permissions
- delete_roles - Delete custom roles

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the full implementation guide
3. Verify all environment variables are set correctly
4. Check server and browser console logs for errors

---

**System Version**: 1.0.0
**Last Updated**: 2025-11-05
