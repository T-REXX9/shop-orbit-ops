@echo off
REM Start the Shop Orbit ERP Backend Server

echo ========================================
echo Starting Shop Orbit ERP Backend Server
echo ========================================
echo.

REM Navigate to server directory
cd /d "%~dp0"

REM Check if node_modules exists
if not exist node_modules (
    echo ERROR: Dependencies not installed!
    echo Please run setup.bat first.
    echo.
    pause
    exit /b 1
)

REM Check if database exists
if not exist database.sqlite (
    echo WARNING: Database not initialized!
    echo Running initialization...
    call npm run init-db
    echo.
)

echo Starting server in development mode...
echo.
echo Server will be available at: http://localhost:3001
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

call npm run dev
