#!/bin/bash

# Test runner script for local development
echo "🚀 Starting backend tests..."

# Set test environment
export NODE_ENV=test
export PORT=8001
export TEST_DB_HOST=localhost
export TEST_DB_PORT=5432
export TEST_DB_USER=postgres
export TEST_DB_PASSWORD=password
export TEST_DB_NAME=taskapp_test
export JWT_SECRET=test-secret-key
export CORS_ORIGIN=http://localhost:3000

# Check if PostgreSQL is running
echo "📊 Checking database connection..."
if ! pg_isready -h $TEST_DB_HOST -p $TEST_DB_PORT -U $TEST_DB_USER; then
  echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
  echo "💡 On macOS: brew services start postgresql"
  echo "💡 On Ubuntu: sudo service postgresql start"
  exit 1
fi

# Create test database if it doesn't exist
echo "📝 Ensuring test database exists..."
createdb -h $TEST_DB_HOST -p $TEST_DB_PORT -U $TEST_DB_USER $TEST_DB_NAME 2>/dev/null || echo "Test database already exists"

# Run migrations
echo "🔄 Running migrations..."
npm run migrate:test

# Run seeds
echo "🌱 Running seeds..."
npm run seed:test

# Run tests
echo "🧪 Running tests..."
npm run test:ci

echo "✅ Tests completed!"
