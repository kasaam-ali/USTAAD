@echo off
echo ==========================================
echo   USTAAD - Starting Application
echo ==========================================
echo.

echo WARNING: PostgreSQL must be installed and running!
echo.
echo Quick PostgreSQL Setup:
echo 1. Download: https://www.postgresql.org/download/windows/
echo 2. Install with default settings
echo 3. Remember the password you set
echo 4. Open pgAdmin and create database 'ustaad_db'
echo.
echo OR use Docker:
echo   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ustaad_db postgres:15
echo.
pause

echo.
echo [1/3] Checking backend build...
cd backend
if not exist "dist" (
    echo Building TypeScript...
    call npm run build
)

echo.
echo [2/3] Please update backend\.env file:
echo    - Set DB_PASSWORD to your PostgreSQL password
echo    - JWT secrets are already set
echo.
notepad .env
echo.
pause

echo.
echo [3/3] Starting backend server...
echo.
echo Backend will start on: http://localhost:8080
echo API Health Check: http://localhost:8080/api/v1/health
echo.
echo In development mode, OTP will be shown in console (no SMS needed)
echo.
call npm run dev
