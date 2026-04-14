# Blood Suite - Step-by-Step Testing Guide

## 📋 Complete Testing Workflow

This guide walks you through testing every component of the Blood Suite system from the database up to the AI forecasting.

---

## **STEP 1: Check Database Connection** ✅

```powershell
cd backend
node scripts/check-db-direct.js
```

**Expected Output:**
```
Database summary: {
  total: '1065',
  oldest_date: 2026-04-07T12:14:38.958Z,
  newest_date: 2026-04-07T12:16:31.034Z,
  fulfilled_count: '1064'
}
```

**What it tests:**
- PostgreSQL connectivity
- Historical data availability
- Database query functionality

---

## **STEP 2: Start Backend Server**

```powershell
cd backend
npm start
```

**Expected Output:**
```
✅ Server running on port 5000
✅ Database connected
```

**Keep this terminal open** - you'll use it for the next steps.

---

## **STEP 3: Test Backend Health Endpoint** ✅

In a **new terminal**:

```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/health -Method GET | ConvertTo-Json
```

**Expected Output:**
```json
{
  "status": "OK",
  "database": "connected"
}
```

**What it tests:**
- Backend server is running
- Basic API connectivity
- Database health

---

## **STEP 4: Test User Authentication** 🔐

```powershell
$loginData = @{
    email = "admin@bloodsuite.org"
    password = "admin123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/auth/login `
  -Method POST `
  -ContentType "application/json" `
  -Body $loginData | ConvertTo-Json
```

**Expected Output:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@bloodsuite.org",
    "role": "admin"
  }
}
```

**What it tests:**
- User authentication system
- JWT token generation
- Database user lookup

---

## **STEP 5: Test Blood Inventory API** 📊

Use the JWT token from Step 4:

```powershell
$token = "YOUR_TOKEN_FROM_STEP_4"

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -Uri http://localhost:5000/api/inventory `
  -Method GET `
  -Headers $headers | ConvertTo-Json
```

**Expected Output:**
```json
{
  "success": true,
  "inventory": [
    {
      "id": "...",
      "blood_type": "O+",
      "quantity_ml": 450,
      "status": "available"
    },
    {
      "id": "...",
      "blood_type": "A+",
      "quantity_ml": 450,
      "status": "available"
    }
  ]
}
```

**What it tests:**
- Authentication with JWT token
- Secured API endpoints
- Inventory data retrieval

---

## **STEP 6: Test Blood Request Creation** 📝

```powershell
$token = "YOUR_TOKEN_FROM_STEP_4"

$requestData = @{
    blood_type = "O-"
    quantity_ml = 450
    urgency = "emergency"
    patient_name = "Test Patient"
    required_date = "2026-04-10"
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -Uri http://localhost:5000/api/requests `
  -Method POST `
  -Headers $headers `
  -Body $requestData | ConvertTo-Json
```

**Expected Output:**
```json
{
  "success": true,
  "request": {
    "id": "...",
    "blood_type": "O-",
    "quantity_ml": 450,
    "status": "pending"
  }
}
```

**What it tests:**
- POST request handling
- Data validation
- Database write operations

---

## **STEP 7: Test AI Forecasting Demo** 🤖

In a **new terminal** (backend can keep running):

```powershell
cd ai-demo
python forecast_demo.py
```

**Expected Output:**
```
✅ Connected to PostgreSQL database
✅ Fetched 977 records from database
📊 Analyzing data for O+ blood type...
   Data range: 2024-04-18 to 2026-03-28
   Total days: 710
🔮 TRAINING AI MODELS WITH REAL BLOOD BANK DATA
✅ ARIMA model trained!
✅ Prophet model trained!
🚨 7-DAY FORECAST & SHORTAGE ALERTS
📈 GENERATING VISUALIZATION CHARTS
✅ Chart saved as 'real_forecast_demo.png'
✅ DEMO COMPLETE!
```

**What it tests:**
- Python environment setup
- Database connectivity from Python
- AI model training
- Data visualization generation

---

## **STEP 8: Verify Visualization Output** 📈

```powershell
cd ai-demo
Get-ChildItem -Filter "real_forecast_demo.png" | ForEach-Object {
    Write-Host "✅ Forecast chart generated: $($_.FullName)"
    Write-Host "Size: $($_.Length / 1KB)KB"
}
```

**Expected Output:**
```
✅ Forecast chart generated: C:\...\ai-demo\real_forecast_demo.png
Size: 250KB
```

**What it tests:**
- Matplotlib chart generation
- File system operations
- End-to-end AI pipeline

---

## **STEP 9: Test Frontend** 🌐

In a **new terminal**:

```powershell
cd frontend-web
npm start
```

**Then open browser to:** `http://localhost:3000`

**Test these pages:**
1. **Login Page** → Login with `admin@bloodsuite.org` / `admin123`
2. **Dashboard** → Verify navigation works
3. **Inventory Page** → See blood inventory
4. **Requests Page** → View blood requests
5. **Navigation** → Test all menu items

**What it tests:**
- React frontend rendering
- Routing functionality
- API integration from UI
- User authentication flow

---

## **Quick Test Summary**

| Component | Command | Expected | Status |
|-----------|---------|----------|--------|
| Database | `node scripts/check-db-direct.js` | 1065 records | ✅ |
| Backend | `npm start` | Server on :5000 | ✅ |
| Health API | `GET /api/health` | 200 OK | ✅ |
| Auth | `POST /api/auth/login` | JWT token | ✅ |
| Inventory | `GET /api/inventory` | Blood types | ✅ |
| Forecast | `python forecast_demo.py` | PNG chart | ✅ |
| Frontend | `npm start` | UI on :3000 | ✅ |

---

## **Troubleshooting**

### Database Connection Issues
```powershell
# Check if PostgreSQL is running
Get-Process postgres

# Verify database exists
psql -U postgres -l
```

### Port Conflicts
```powershell
# Find process using port 5000
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | 
  Select-Object OwningProcess

# Kill process if needed
Stop-Process -Id PROCESS_ID -Force
```

### Python Module Errors
```powershell
cd ai-demo
python -m pip install --upgrade pandas numpy prophet statsmodels scikit-learn
```

---

## **Full Integration Test** 🔄

To run a complete end-to-end test:

```powershell
# Terminal 1: Database
cd backend
node scripts/check-db-direct.js

# Terminal 2: Backend
cd backend
npm start

# Terminal 3: Forecast
cd ai-demo
python forecast_demo.py

# Terminal 4: Frontend
cd frontend-web
npm start
```

Then navigate to `http://localhost:3000` and verify:
- Login works
- Dashboard loads
- Inventory displays
- Requests can be created

---

## **Performance Benchmarks**

Expected timings:
- Database query: < 100ms
- API health check: < 50ms
- User login: < 500ms
- Forecast training: 10-30 seconds
- Frontend build: 60-90 seconds

---

## **Testing Checklist** ✓

- [ ] Database connectivity verified
- [ ] Backend server starts without errors
- [ ] Health endpoint responds
- [ ] Login successful with JWT token
- [ ] Inventory API returns data
- [ ] Blood request creation works
- [ ] AI forecasting completes
- [ ] Visualization generates
- [ ] Frontend renders without errors
- [ ] All routes accessible
- [ ] Navigation works
- [ ] Can logout and login again

---

Done! 🎉 Your Blood Suite system is fully tested and operational.
