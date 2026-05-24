# 🚀 QUICK START SCRIPT

echo "=========================================="
echo "  USTAAD - Starting Application"
echo "=========================================="
echo ""

echo "⚠️  IMPORTANT: PostgreSQL must be installed and running!"
echo ""
echo "Quick PostgreSQL Setup:"
echo "1. Download: https://www.postgresql.org/download/windows/"
echo "2. Install with default settings"
echo "3. Remember the password you set"
echo "4. Open pgAdmin and create database 'ustaad_db'"
echo ""
echo "OR use Docker:"
echo "  docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ustaad_db postgres:15"
echo ""
read -p "Press Enter when PostgreSQL is ready..."

echo ""
echo "[1/3] Checking backend build..."
cd backend
if [ ! -d "dist" ]; then
    echo "Building TypeScript..."
    npm run build
fi

echo ""
echo "[2/3] Updating .env file..."
# Update JWT secrets with proper values
sed -i 's/your-super-secret-jwt-key-change-this-in-production/ustaad-jwt-secret-key-2024-production-ready-minimum-32-chars/g' .env
sed -i 's/your-refresh-token-secret-change-this/ustaad-refresh-token-secret-2024-secure-minimum-32/g' .env

echo ""
echo "⚠️  PLEASE UPDATE .env FILE:"
echo "   - Set DB_PASSWORD to your PostgreSQL password"
echo ""
read -p "Press Enter after updating .env..."

echo ""
echo "[3/3] Starting backend server..."
echo ""
echo "Backend will start on: http://localhost:8080"
echo "API Health Check: http://localhost:8080/api/v1/health"
echo ""
echo "In development mode, OTP will be shown in console (no SMS needed)"
echo ""
npm run dev
