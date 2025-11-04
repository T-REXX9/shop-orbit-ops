# Automated Setup Scripts Guide

## 📁 Available Scripts

I've created two convenient batch scripts for Windows to automate the backend setup:

### 1. `setup.bat` - Complete Setup Script

**What it does:**
1. Cleans up any previous failed installations
2. Installs all dependencies (including sql.js)
3. Initializes the database
4. Seeds sample data

**How to use:**
- Simply **double-click** `setup.bat` in the `server` folder
- Or run from PowerShell: `.\setup.bat`

**What you'll see:**
```
========================================
Shop Orbit ERP - Backend Setup
========================================

Step 1: Cleaning up previous installation attempts...
Done!

Step 2: Installing dependencies...
[npm install output]
Done!

Step 3: Initializing database...
✅ Database initialized successfully
Done!

Step 4: Seeding sample data...
✅ Database seeding completed successfully!
Done!

========================================
Setup Complete!
========================================
```

### 2. `start-server.bat` - Start Server Script

**What it does:**
1. Checks if dependencies are installed
2. Checks if database is initialized
3. Starts the development server

**How to use:**
- **Double-click** `start-server.bat` in the `server` folder
- Or run from PowerShell: `.\start-server.bat`

**What you'll see:**
```
========================================
Starting Shop Orbit ERP Backend Server
========================================

Starting server in development mode...

Server will be available at: http://localhost:3001

Press Ctrl+C to stop the server
========================================

[Server startup output]
```

## 🚀 Quick Start - First Time Setup

1. **Navigate to the server folder**
   - Open File Explorer
   - Go to: `C:\Users\melso\OneDrive\Documents\shop-orbit-ops\server`

2. **Run Setup**
   - Double-click: `setup.bat`
   - Wait for it to complete (2-3 minutes)

3. **Start Server**
   - Double-click: `start-server.bat`
   - Server will start at http://localhost:3001

4. **Test the Server**
   - Open your browser
   - Go to: http://localhost:3001/health
   - You should see JSON response with server status

## 🔄 Daily Use

After initial setup, you only need:

**To start the server:**
- Double-click: `start-server.bat`

**To stop the server:**
- Press `Ctrl+C` in the command window
- Or simply close the command window

## 🛠️ Troubleshooting

### If setup.bat fails:

1. **Check error message** - The script will show what failed
2. **Try running individual commands**:
   ```bash
   cd server
   npm install
   npm run init-db
   npm run seed
   ```

### If start-server.bat says dependencies not installed:

- Run `setup.bat` first

### If you see "port already in use":

- Another instance is running
- Close it or change PORT in `.env` file

## 📝 Manual Commands Reference

If you prefer manual control:

```bash
# Install dependencies
npm install

# Initialize database
npm run init-db

# Seed sample data
npm run seed

# Start development server
npm run dev

# Start production server
npm start
```

## ✅ What Gets Installed

The setup script installs:
- express (web framework)
- sql.js (SQLite database - no Python needed!)
- uuid (ID generation)
- cors (CORS support)
- dotenv (environment config)
- express-validator (validation)
- multer (file uploads)
- sharp (image processing)
- nodemon (auto-reload for development)

**Total size:** ~50-80 MB

## 🎯 Next Steps After Setup

1. **Test API endpoints** in your browser:
   - http://localhost:3001/health
   - http://localhost:3001/api/v1
   - http://localhost:3001/api/v1/inquiries
   - http://localhost:3001/api/v1/customers
   - http://localhost:3001/api/v1/products

2. **Review the data** - Sample data includes:
   - 3 customers
   - 3 products
   - 3 inquiries
   - Price lists for all products
   - Supplier information

3. **Connect your frontend** - Update frontend API calls to use http://localhost:3001/api/v1

## 💡 Tips

- **Keep the command window open** while the server is running
- **Check the logs** in the command window for errors
- **The server auto-reloads** when you change code files
- **Database file** is saved at `server/database.sqlite`

---

**Everything is automated - just double-click and go! 🚀**
