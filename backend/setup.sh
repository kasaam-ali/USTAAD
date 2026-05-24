#!/bin/bash

echo "========================================"
echo "  USTAAD Backend Setup Script"
echo "========================================"
echo ""

echo "[1/5] Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found. Please install Node.js 18+"
    exit 1
fi
node --version

echo ""
echo "[2/5] Installing dependencies..."
npm install

echo ""
echo "[3/5] Checking .env file..."
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "IMPORTANT: Please edit .env file with your credentials:"
    echo "- DB_PASSWORD"
    echo "- JWT_SECRET (min 32 characters)"
    echo "- JWT_REFRESH_SECRET (min 32 characters)"
    echo ""
    read -p "Press enter to continue..."
fi

echo ""
echo "[4/5] Building TypeScript..."
npm run build

echo ""
echo "[5/5] Running database migrations..."
npm run migrate

echo ""
echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your credentials"
echo "2. Run: npm run seed (to add sample data)"
echo "3. Run: npm run dev (to start server)"
echo ""
