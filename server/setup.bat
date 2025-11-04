@echo off
REM Setup script for Shop Orbit ERP Backend Server
REM This script installs dependencies and initializes the database

echo ========================================
echo Shop Orbit ERP - Backend Setup
echo ========================================
echo.

REM Navigate to server directory
cd /d "%~dp0"

echo Step 1: Cleaning up previous installation attempts...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f /q package-lock.json
echo Done!
echo.

echo Step 2: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies!
    echo Please check the error messages above.
    pause
    exit /b 1
)
echo Done!
echo.

echo Step 3: Initializing database...
call npm run init-db
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to initialize database!
    echo Please check the error messages above.
    pause
    exit /b 1
)
echo Done!
echo.

echo Step 4: Seeding sample data...
call npm run seed
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Failed to seed sample data (optional step)
    echo You can continue without sample data.
)
echo Done!
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo The backend server is ready to use.
echo.
echo To start the server, run:
echo   npm run dev
echo.
echo Or double-click: start-server.bat
echo.
pause
