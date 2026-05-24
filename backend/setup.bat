@echo off
echo ========================================
echo   USTAAD Backend Setup Script
echo ========================================
echo.

echo [1/5] Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)

echo.
echo [2/5] Installing dependencies...
call npm install

echo.
echo [3/5] Checking .env file...
if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit .env file with your credentials:
    echo - DB_PASSWORD
    echo - JWT_SECRET (min 32 characters)
    echo - JWT_REFRESH_SECRET (min 32 characters)
    echo.
    pause
)

echo.
echo [4/5] Building TypeScript...
call npm run build

echo.
echo [5/5] Running database migrations...
call npm run migrate

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env file with your credentials
echo 2. Run: npm run seed (to add sample data)
echo 3. Run: npm run dev (to start server)
echo.
pause
