#!/bin/bash

# Blood Suite Database Setup Script for Linux/Mac
# This script sets up PostgreSQL database and seeds initial data

DB_HOST=${1:-localhost}
DB_PORT=${2:-5432}
DB_NAME=${3:-blood_suite_db}
DB_USER=${4:-postgres}
DB_PASSWORD=${5:-bloodsuite123}
BACKEND_PATH=${6:-./backend}

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Blood Suite - Database Setup Script for Linux/Mac       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Check if PostgreSQL is installed
info "Step 1: Checking PostgreSQL installation..."
if ! command -v psql &> /dev/null; then
    error "PostgreSQL not found. Please install PostgreSQL first."
    info "macOS: brew install postgresql"
    info "Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    info "Fedora: sudo dnf install postgresql postgresql-server"
    exit 1
fi
success "PostgreSQL found: $(psql --version)"

# Step 2: Check PostgreSQL connection
info "Step 2: Testing PostgreSQL connection..."
export PGPASSWORD="$DB_PASSWORD"
if ! psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1" &>/dev/null; then
    error "Cannot connect to PostgreSQL server at $DB_HOST:$DB_PORT"
    error "Please check your PostgreSQL service is running and credentials are correct"
    exit 1
fi
success "PostgreSQL connection successful"

# Step 3: Create database if it doesn't exist
info "Step 3: Creating database if it doesn't exist..."
DB_EXISTS=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'")
if [ ! -z "$DB_EXISTS" ]; then
    warning "Database '$DB_NAME' already exists. Dropping it to create fresh..."
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;" &>/dev/null
    info "Creating fresh database..."
fi
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;"
success "Database '$DB_NAME' created successfully"

# Step 4: Check backend directory
info "Step 4: Checking backend directory..."
if [ ! -d "$BACKEND_PATH" ]; then
    error "Backend directory not found at: $BACKEND_PATH"
    exit 1
fi
success "Backend directory found at: $BACKEND_PATH"

# Step 5: Create .env file if it doesn't exist
info "Step 5: Configuring .env file..."
ENV_FILE="$BACKEND_PATH/.env"
if [ -f "$ENV_FILE" ]; then
    warning ".env file already exists. Skipping creation."
else
    cat > "$ENV_FILE" << EOF
PORT=5000
NODE_ENV=development
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=24h
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=15 * 60 * 1000
RATE_LIMIT_MAX=100
EOF
    success ".env file created at: $ENV_FILE"
fi

# Step 6: Install dependencies
info "Step 6: Installing backend dependencies..."
cd "$BACKEND_PATH"
if [ ! -d "node_modules" ]; then
    npm install
    success "Dependencies installed successfully"
else
    warning "Dependencies already installed"
fi

# Step 7: Seed the database
info "Step 7: Starting backend to create tables and seed data..."
echo ""
info "The backend will:"
info "  1. Connect to PostgreSQL"
info "  2. Create all tables automatically"
info "  3. Seed test data"
info "  4. Start the API server on port 5000"
echo ""
warning "IMPORTANT: Keep this terminal window open while using the application!"
warning "Press Ctrl+C to stop the server when you're done."
echo ""
info "In another terminal window, run:"
info "  cd frontend-web"
info "  npm install"
info "  npm start"
echo ""

# Start the backend server
npm run dev

cd -
