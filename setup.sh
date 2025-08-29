#!/bin/bash

# Quick setup script for local development
set -e

echo "🚀 Setting up TaskApp for local development"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

echo "📦 Starting services with Docker Compose..."
docker-compose up -d postgres redis

echo "⏳ Waiting for database to be ready..."
sleep 10

echo "📊 Setting up backend..."
cd backend

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created backend .env file"
fi

# Install dependencies
npm install

# Run database migrations and seed data
echo "🗃️ Running database migrations..."
npm run migrate

echo "🌱 Seeding database..."
npm run seed

echo "🧪 Running backend tests..."
npm test

cd ../frontend

# Copy environment file if it doesn't exist
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✅ Created frontend .env.local file"
fi

echo "📱 Setting up frontend..."
npm install

echo "✅ Setup complete!"
echo ""
echo "🎉 Your TaskApp is ready for development!"
echo ""
echo "To start development:"
echo "1. Backend: cd backend && npm run dev"
echo "2. Frontend: cd frontend && npm run dev"
echo "3. Or use Docker Compose: docker-compose up"
echo ""
echo "URLs:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000"
echo "- Database: localhost:5432"
echo ""
echo "Demo credentials:"
echo "- Email: admin@example.com"
echo "- Password: password123"
