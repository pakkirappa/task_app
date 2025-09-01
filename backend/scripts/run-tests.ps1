# Test runner script for local development on Windows
Write-Host "🚀 Starting backend tests..." -ForegroundColor Green

# Set test environment
$env:NODE_ENV = "test"
$env:PORT = "8001"
$env:TEST_DB_HOST = "localhost"
$env:TEST_DB_PORT = "5432"
$env:TEST_DB_USER = "postgres"
$env:TEST_DB_PASSWORD = "password"
$env:TEST_DB_NAME = "taskapp_test"
$env:JWT_SECRET = "test-secret-key"
$env:CORS_ORIGIN = "http://localhost:3000"

# Check if PostgreSQL is running
Write-Host "📊 Checking database connection..." -ForegroundColor Yellow
try {
    $connectionString = "Host=$env:TEST_DB_HOST;Port=$env:TEST_DB_PORT;Username=$env:TEST_DB_USER;Password=$env:TEST_DB_PASSWORD;Database=postgres"
    $connection = New-Object Npgsql.NpgsqlConnection($connectionString)
    $connection.Open()
    $connection.Close()
    Write-Host "✅ PostgreSQL is running" -ForegroundColor Green
} catch {
    Write-Host "❌ PostgreSQL is not running. Please start PostgreSQL first." -ForegroundColor Red
    Write-Host "💡 Make sure PostgreSQL service is running" -ForegroundColor Yellow
    exit 1
}

# Create test database if it doesn't exist
Write-Host "📝 Ensuring test database exists..." -ForegroundColor Yellow
try {
    $createDbQuery = "CREATE DATABASE $env:TEST_DB_NAME;"
    $connectionString = "Host=$env:TEST_DB_HOST;Port=$env:TEST_DB_PORT;Username=$env:TEST_DB_USER;Password=$env:TEST_DB_PASSWORD;Database=postgres"
    $connection = New-Object Npgsql.NpgsqlConnection($connectionString)
    $connection.Open()
    $command = $connection.CreateCommand()
    $command.CommandText = $createDbQuery
    $command.ExecuteNonQuery()
    $connection.Close()
    Write-Host "✅ Test database created" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Test database already exists or creation failed (this is usually fine)" -ForegroundColor Yellow
}

# Run migrations
Write-Host "🔄 Running migrations..." -ForegroundColor Yellow
npm run migrate:test

# Run seeds
Write-Host "🌱 Running seeds..." -ForegroundColor Yellow
npm run seed:test

# Run tests
Write-Host "🧪 Running tests..." -ForegroundColor Yellow
npm run test:ci

Write-Host "✅ Tests completed!" -ForegroundColor Green
