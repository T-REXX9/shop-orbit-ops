<<<<<<< Local
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/001c8a1a-0fdf-44e4-8172-9d2d3a853e95

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/001c8a1a-0fdf-44e4-8172-9d2d3a853e95) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/001c8a1a-0fdf-44e4-8172-9d2d3a853e95) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
=======
# JWT Role-Based Permission System

## 🎯 Overview

A complete, production-ready JWT-based authentication and authorization system for the Shop Orbit ERP application. This implementation provides granular, page-level access control with the ability for administrators to dynamically manage users, create custom roles, and configure permissions.

## ✨ Key Features

- ✅ **JWT Authentication**: Secure token-based authentication with automatic refresh
- ✅ **Role-Based Access Control**: Flexible RBAC system with custom roles
- ✅ **User Management**: Complete CRUD interface for user administration
- ✅ **Permission Management**: Dynamic permission assignment to roles
- ✅ **Page-Level Security**: Granular control over which pages users can access
- ✅ **Production Ready**: Follows industry best practices and security standards
- ✅ **Fully Modular**: Standalone, reusable components throughout
- ✅ **Type Safe**: Complete TypeScript coverage on frontend

## 📁 Project Structure

```
jwt-role-based-permission-system/
├── server/                           # Backend implementation
│   ├── database/
│   │   ├── auth-schema.sql          # Authentication database schema
│   │   └── seedAuth.js              # Default roles and admin user seeder
│   ├── services/
│   │   ├── AuthService.js           # Authentication logic
│   │   ├── UserService.js           # User management
│   │   ├── RoleService.js           # Role management
│   │   └── PermissionService.js     # Permission queries
│   ├── middleware/
│   │   └── auth.js                  # JWT validation & authorization
│   └── routes/
│       ├── auth.js                  # Authentication endpoints
│       ├── users.js                 # User management endpoints
│       └── roles.js                 # Role management endpoints
├── src/                              # Frontend implementation
│   ├── types/
│   │   └── api.ts                   # TypeScript type definitions
│   ├── contexts/
│   │   └── AuthContext.tsx          # Authentication state management
│   ├── hooks/
│   │   └── usePermission.ts         # Permission checking utilities
│   ├── components/
│   │   └── auth/
│   │       └── ProtectedRoute.tsx   # Permission-based route protection
│   └── pages/
│       ├── UserManagement.tsx       # User CRUD interface
│       └── RoleManagement.tsx       # Role & permission interface
├── QUICK_START.md                    # Step-by-step setup guide
├── IMPLEMENTATION_GUIDE.md           # Detailed technical documentation
├── IMPLEMENTATION_SUMMARY.md         # Complete implementation overview
└── README.md                         # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- SQLite (included with sql.js)

### Setup (5 minutes)

1. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Initialize database**
   ```bash
   npm run init-db
   npm run seed-auth
   ```

3. **Start backend server**
   ```bash
   npm run dev
   ```
   Server will run on http://localhost:3001

4. **Install frontend dependencies** (new terminal)
   ```bash
   cd ..
   npm install
   ```

5. **Start frontend**
   ```bash
   npm run dev
   ```
   App will open on http://localhost:5173

6. **Login**
   - Email: `admin@shoporbit.com`
   - Password: `admin123`
   - **⚠️ Change password immediately!**

## 📖 Documentation

- **[Quick Start Guide](QUICK_START.md)** - Complete setup instructions
- **[Implementation Guide](IMPLEMENTATION_GUIDE.md)** - Technical details and usage
- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - Feature overview and statistics

## 🔐 Default Configuration

### System Roles

1. **Admin**
   - Full system access
   - User and role management
   - All 15 permissions

2. **Sales Agent**
   - Operational pages only
   - 5 view permissions (dashboard, crm, inquiries, orders, inventory)
   - No admin access

### Available Permissions

**Page Access** (9):
- view_dashboard, view_crm, view_inquiries, view_orders, view_inventory
- view_invoices, view_reports, view_users, view_roles

**User Management** (3):
- create_users, edit_users, delete_users

**Role Management** (3):
- create_roles, edit_roles, delete_roles

## 💻 Usage Examples

### Backend: Protect an Endpoint

```javascript
import { authenticate, authorize } from '../middleware/auth.js';

router.get('/sensitive-data',
  authenticate,                    // Require valid JWT
  authorize('view_reports'),       // Require specific permission
  async (req, res) => {
    // req.user contains: userId, email, roleKey, permissions
    res.json({ data: sensitiveData });
  }
);
```

### Frontend: Check Permissions

```tsx
import { usePermission } from '@/hooks/usePermission';

function MyComponent() {
  const { hasPermission, canView, isAdmin } = usePermission();

  return (
    <div>
      {/* Show button only if user can create users */}
      {hasPermission('create_users') && (
        <Button onClick={createUser}>Create User</Button>
      )}

      {/* Show admin panel only for admins */}
      {isAdmin() && <AdminPanel />}

      {/* Check page access */}
      {canView('reports') && <ReportsLink />}
    </div>
  );
}
```

### Frontend: Protect Routes

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

<Route path="/users" element={
  <ProtectedRoute requiredPermission="view_users">
    <UserManagement />
  </ProtectedRoute>
} />
```

## 🎨 Features Showcase

### User Management
- Search and filter users
- Create new users with role assignment
- Edit user details and status
- Change user passwords
- Delete users (with safety checks)
- Prevent self-deletion
- Prevent last admin deletion

### Role Management
- View all roles with user/permission counts
- Create custom roles with any name
- Assign permissions by resource group
- Edit custom role permissions
- Delete unused roles
- System roles are protected from modification

### Security
- JWT tokens expire after 1 hour
- Refresh tokens expire after 7 days
- Automatic token refresh on API calls
- Auto-logout on token expiration
- Password hashing with bcrypt
- Permission-based API protection
- Frontend route protection

## 🛠️ Technology Stack

**Backend**:
- Express.js - Web framework
- SQLite via sql.js - Database
- jsonwebtoken - JWT handling
- bcryptjs - Password hashing
- express-validator - Input validation

**Frontend**:
- React 18 - UI framework
- TypeScript - Type safety
- Ant Design - UI components
- TanStack Query - Data fetching
- React Router - Navigation

## 🔒 Security Best Practices

✅ **Implemented**:
- JWT tokens with expiration
- Refresh token rotation
- Password hashing (bcrypt)
- CORS configuration
- Input validation
- SQL injection prevention
- XSS protection
- Permission-based authorization

⚠️ **Recommended for Production**:
- Change JWT_SECRET to strong random value
- Enable HTTPS
- Implement rate limiting
- Add password complexity requirements
- Set up monitoring and logging
- Configure database backups
- Use environment-specific configs

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout and revoke token
- `GET /api/v1/auth/me` - Get current user

### User Management
- `GET /api/v1/users` - List users (with filters)
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `PUT /api/v1/users/:id/password` - Change password

### Role Management
- `GET /api/v1/roles` - List roles
- `GET /api/v1/roles/:id` - Get role with permissions
- `POST /api/v1/roles` - Create custom role
- `PUT /api/v1/roles/:id` - Update role
- `DELETE /api/v1/roles/:id` - Delete role
- `GET /api/v1/roles/permissions/all` - Get all permissions

## 🐛 Troubleshooting

**Backend won't start**
- Check if port 3001 is available
- Verify JWT_SECRET is set in .env
- Ensure database is initialized

**Frontend can't connect**
- Verify backend is running
- Check VITE_API_BASE_URL in .env
- Verify CORS configuration

**Login fails**
- Verify database seeding completed
- Check credentials are correct
- Review server logs for errors

**Permission errors**
- Check user's role permissions
- Verify permission key matches exactly
- Ensure role has required permission

See [QUICK_START.md](QUICK_START.md) for detailed troubleshooting.

## 🎯 Next Steps

After successful setup:

1. **Customize**: Add more permissions for specific actions
2. **Enhance**: Implement password policies and MFA
3. **Monitor**: Set up logging and error tracking
4. **Test**: Write unit and integration tests
5. **Document**: Create API documentation with Swagger
6. **Deploy**: Follow production deployment checklist

## 📝 License

This implementation is part of the Shop Orbit ERP system.

## 🤝 Support

For questions or issues:
1. Check the documentation files
2. Review troubleshooting sections
3. Verify environment configuration
4. Check server and browser console logs

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-05  
**Status**: ✅ Production Ready
>>>>>>> Remote
