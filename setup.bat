@echo off
echo 🚀 Setting up TaskApp for local development

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

echo 📦 Starting services with Docker Compose...
docker-compose up -d postgres redis

echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak >nul

echo 📊 Setting up backend...
cd backend

REM Copy environment file if it doesn't exist
if not exist .env (
    copy .env.example .env
    echo ✅ Created backend .env file
)

REM Install dependencies
call npm install

REM Run database migrations and seed data
echo 🗃️ Running database migrations...
call npm run migrate

echo 🌱 Seeding database...
call npm run seed

echo 🧪 Running backend tests...
call npm test

cd ..\frontend

REM Copy environment file if it doesn't exist
if not exist .env.local (
    copy .env.example .env.local
    echo ✅ Created frontend .env.local file
)

echo 📱 Setting up frontend...
call npm install

echo ✅ Setup complete!
echo.
echo 🎉 Your TaskApp is ready for development!
echo.
echo To start development:
echo 1. Backend: cd backend ^&^& npm run dev
echo 2. Frontend: cd frontend ^&^& npm run dev
echo 3. Or use Docker Compose: docker-compose up
echo.
echo URLs:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:8000
echo - Database: localhost:5432
echo.
echo Demo credentials:
echo - Email: admin@example.com
echo - Password: password123
