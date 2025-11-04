# Server Setup Instructions

## ⚙️ Manual Setup Steps

Since you handle terminal operations manually, here are the exact commands to run:

### Step 1: Navigate to Server Directory

```bash
cd server
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- express (web framework)
- better-sqlite3 (database)
- uuid (ID generation)
- cors (CORS support)
- dotenv (environment config)
- express-validator (validation)
- multer (file uploads)
- sharp (image processing)
- nodemon (dev auto-reload)

### Step 3: Create Environment File

Copy the example environment file:

```bash
# On Windows PowerShell:
copy ..\.env.example .env

# On Windows Command Prompt:
copy ..\.env.example .env

# On Mac/Linux:
cp ../.env.example .env
```

Or manually create a `.env` file in the `server` directory with:

```env
PORT=3001
NODE_ENV=development
DATABASE_PATH=./database.sqlite
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### Step 4: Initialize Database

```bash
npm run init-db
```

This creates the SQLite database with all tables and indexes.

### Step 5: Seed Sample Data (Optional)

```bash
npm run seed
```

This adds sample data:
- 3 customers
- 3 products  
- 30 price entries
- 9 supplier entries
- 3 inquiries
- 3 contact persons

### Step 6: Start the Server

For development (auto-reload on changes):

```bash
npm run dev
```

For production:

```bash
npm start
```

## ✅ Verify Installation

After starting the server, check if it's running:

1. Open your browser
2. Go to: http://localhost:3001/health

You should see:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development",
  "version": "1.0.0"
}
```

## 🧪 Test the API

Visit these URLs in your browser:

- API Info: http://localhost:3001/api/v1
- All Inquiries: http://localhost:3001/api/v1/inquiries
- All Customers: http://localhost:3001/api/v1/customers
- All Products: http://localhost:3001/api/v1/products
- Price Groups: http://localhost:3001/api/v1/prices/groups

## 📝 Available NPM Scripts

From the `server` directory:

| Command | Description |
|---------|-------------|
| `npm start` | Start server (production) |
| `npm run dev` | Start with auto-reload (development) |
| `npm run init-db` | Initialize database |
| `npm run seed` | Seed sample data |

## 🔧 Troubleshooting

### "Cannot find module" errors

Make sure you ran `npm install` in the `server` directory.

### Port already in use

Change the `PORT` in your `.env` file to something else (e.g., 3002).

### Database errors

Delete `database.sqlite` and run `npm run init-db` again.

### CORS errors from frontend

Make sure `CORS_ORIGIN` in `.env` matches your frontend URL (default: http://localhost:5173).

## 🎯 What's Next?

After the server is running:

1. Test API endpoints using your browser or Postman
2. Review the API documentation in README.md
3. Connect your frontend to the API
4. Customize the backend as needed

## 📚 Documentation

- Full API docs: See `README.md`
- MySQL migration: See `database/MYSQL_MIGRATION.md`
- Quick start: See `../BACKEND_QUICK_START.md`

---

**Need help?** Check the README.md or review the server logs in your terminal.
