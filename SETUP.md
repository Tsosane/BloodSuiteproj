# Blood Suite Setup Guide

## Prerequisites
1. Node.js (v16 or higher)
2. PostgreSQL (v12 or higher)
3. npm or yarn

## Backend Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your PostgreSQL credentials:
```
DB_NAME=blood_suite_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
```

4. Create the database:
```sql
CREATE DATABASE blood_suite_db;
```

5. Start the backend server:
```bash
npm run dev
```

The backend will automatically:
- Connect to PostgreSQL
- Create all necessary tables
- Insert test data including:
  - Admin user: admin@bloodsuite.org / Admin123!
  - Hospital user: hospital@example.com / Hospital123!
  - Donor user: donor@example.com / Donor123!

## Frontend Setup

1. Install dependencies:
```bash
cd frontend-web
npm install
```

2. Start the frontend:
```bash
npm start
```

## Test the Application

1. Backend should be running on http://localhost:5000
2. Frontend should be running on http://localhost:3000
3. Test endpoints:
   - http://localhost:5000/health
   - http://localhost:5000/test-db
   - http://localhost:5000/test-user

## Login Credentials

### Hospital Login
- Email: hospital@bloodsuite.org
- Password: Hospital123!

### Admin Login
- Email: admin@bloodsuite.org
- Password: Admin123!

## Features Working

✅ User Authentication
✅ Database Models (Users, Donors, Hospitals, BloodInventory)
✅ API Endpoints
✅ Frontend UI Components
✅ Dashboard
✅ Blood Inventory Management
✅ Donor Management
✅ Request Management
✅ Notifications
✅ Analytics (basic)
✅ Settings

## AI/ML Features (Disabled for now)

❌ Smart Donor Matching
❌ Predictive Analytics
❌ Demand Forecasting
❌ AI-powered Recommendations

These will be implemented in the final presentation phase.
