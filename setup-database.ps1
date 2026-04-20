# Blood Suite Database Setup Script for Windows PowerShell
# This script sets up PostgreSQL database and seeds initial data

param(
    [string]$dbHost = "localhost",
    [int]$dbPort = 5432,
    [string]$dbName = "blood_suite_db",
    [string]$dbUser = "postgres",
    [string]$dbPassword = "bloodsuite123",
    [string]$backendPath = ".\backend"
)

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Blood Suite - Database Setup Script for Windows       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Color functions for output
function Write-Success {
    param([string]$message)
    Write-Host "✅ $message" -ForegroundColor Green
}

function Write-Info {
    param([string]$message)
    Write-Host "ℹ️  $message" -ForegroundColor Cyan
}

function Write-Warning {
    param([string]$message)
    Write-Host "⚠️  $message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$message)
    Write-Host "❌ $message" -ForegroundColor Red
}

# Step 1: Check if PostgreSQL is installed
Write-Info "Step 1: Checking PostgreSQL installation..."
try {
    $psqlTest = psql --version
    Write-Success "PostgreSQL found: $psqlTest"
} catch {
    Write-Error "PostgreSQL not found. Please install PostgreSQL first."
    Write-Info "Download from: https://www.postgresql.org/download/windows/"
    exit 1
}

# Step 2: Set environment variables for psql
Write-Info "Step 2: Configuring PostgreSQL connection..."
$env:PGPASSWORD = $dbPassword
Write-Success "PostgreSQL credentials configured"

# Step 3: Create database if it doesn't exist
Write-Info "Step 3: Creating database if it doesn't exist..."
try {
    $checkDb = psql -h $dbHost -p $dbPort -U $dbUser -tc "SELECT 1 FROM pg_database WHERE datname = '$dbName'" 2>$null
    if ($checkDb -match "1") {
        Write-Warning "Database '$dbName' already exists. Dropping it to create fresh..."
        psql -h $dbHost -p $dbPort -U $dbUser -c "DROP DATABASE IF EXISTS $dbName;" 2>$null
        Write-Info "Creating fresh database..."
    }
    psql -h $dbHost -p $dbPort -U $dbUser -c "CREATE DATABASE $dbName;"
    Write-Success "Database '$dbName' created successfully"
} catch {
    Write-Error "Failed to create database: $_"
    exit 1
}

# Step 4: Navigate to backend directory
Write-Info "Step 4: Checking backend directory..."
if (-not (Test-Path $backendPath)) {
    Write-Error "Backend directory not found at: $backendPath"
    exit 1
}
Write-Success "Backend directory found at: $backendPath"

# Step 5: Create .env file if it doesn't exist
Write-Info "Step 5: Configuring .env file..."
$envFile = Join-Path $backendPath ".env"
if (Test-Path $envFile) {
    Write-Warning ".env file already exists. Skipping creation."
} else {
    $envContent = @"
PORT=5000
NODE_ENV=development
DB_HOST=$dbHost
DB_PORT=$dbPort
DB_NAME=$dbName
DB_USER=$dbUser
DB_PASSWORD=$dbPassword
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=24h
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=15 * 60 * 1000
RATE_LIMIT_MAX=100
"@
    Set-Content $envFile $envContent
    Write-Success ".env file created at: $envFile"
}

# Step 6: Install dependencies
Write-Info "Step 6: Installing backend dependencies..."
Push-Location $backendPath
try {
    if (-not (Test-Path "node_modules")) {
        npm install 2>$null
        Write-Success "Dependencies installed successfully"
    } else {
        Write-Warning "Dependencies already installed"
    }
} catch {
    Write-Error "Failed to install dependencies: $_"
    Pop-Location
    exit 1
}

# Step 7: Seed the database
Write-Info "Step 7: Starting backend to create tables and seed data..."
Write-Info "Running: npm run dev (this will start the server and auto-sync database)"
Write-Info ""
Write-Info "The backend will:"
Write-Info "  1. Connect to PostgreSQL"
Write-Info "  2. Create all tables automatically"
Write-Info "  3. Seed test data"
Write-Info ""
Write-Info "═══════════════════════════════════════════════════════════════"
Write-Info "🎯 DATA IMPORT INSTRUCTIONS"
Write-Info "═══════════════════════════════════════════════════════════════"
Write-Info ""
Write-Info "After setup, you can feed real data to train the AI models:"
Write-Info ""
Write-Info "1. Access the Admin Dashboard → Data Import"
Write-Info "2. Download the CSV template for the required format"
Write-Info "3. Prepare your historical blood demand data with columns:"
Write-Info "   - date (YYYY-MM-DD format)"
Write-Info "   - blood_type (O+, O-, A+, A-, B+, B-, AB+, AB-)"
Write-Info "   - demand (number of units demanded per day)"
Write-Info ""
Write-Info "4. Upload your CSV/Excel file through the web interface"
Write-Info "5. The system will automatically:"
Write-Info "   - Validate your data"
Write-Info "   - Import it into the database"
Write-Info "   - Retrain the AI models with real data"
Write-Info "   - Update forecasts based on actual demand patterns"
Write-Info ""
Write-Info "Sample data file created: .\sample_blood_demand.csv"
Write-Info ""
Write-Info "═══════════════════════════════════════════════════════════════"
Write-Info "🚀 STARTING BACKEND SERVER..."
Write-Info "═══════════════════════════════════════════════════════════════"
Write-Info ""

npm run dev
Write-Info "  4. Start the API server on port 5000"
Write-Info ""
Write-Warning "IMPORTANT: Keep this terminal window open while using the application!"
Write-Warning "Press Ctrl+C to stop the server when you're done."
Write-Info ""
Write-Info "In another terminal/PowerShell window, run:"
Write-Info "  cd frontend-web"
Write-Info "  npm install"
Write-Info "  npm start"
Write-Info ""

# Start the backend server
npm run dev

Pop-Location
