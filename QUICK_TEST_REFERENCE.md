# Blood Suite - Quick Testing Reference

## 🚀 Quick Start (Copy & Paste Commands)

### Terminal 1: Database Check
```powershell
cd backend
node scripts/check-db-direct.js
```

### Terminal 2: Start Backend
```powershell
cd backend
npm start
```

### Terminal 3: Test API Endpoints

**Test 1 - Health Check:**
```powershell
Invoke-WebRequest http://localhost:5000/api/health -Method GET
```

**Test 2 - Login:**
```powershell
$body = '{"email":"admin@bloodsuite.org","password":"admin123"}' | ConvertTo-Json
Invoke-WebRequest http://localhost:5000/api/auth/login -Method POST -ContentType "application/json" -Body $body
```

**Test 3 - Get Inventory (after getting token from Test 2):**
```powershell
$token = "PASTE_TOKEN_HERE"
$headers = @{ Authorization = "Bearer $token" }
Invoke-WebRequest http://localhost:5000/api/inventory -Method GET -Headers $headers
```

### Terminal 4: AI Forecasting
```powershell
cd ai-demo
python forecast_demo.py
```

### Terminal 5: Frontend
```powershell
cd frontend-web
npm start
# Then open http://localhost:3000
```

---

## 📋 What Each Test Validates

| Test | Checks | Pass When |
|------|--------|-----------|
| `check-db-direct.js` | PostgreSQL + data | Shows 1000+ records with dates |
| Health endpoint | Backend running | Returns `{"status":"OK"}` |
| Login | Authentication | Returns JWT token |
| Inventory | API access | Returns blood type list |
| Forecast | AI pipeline | Creates PNG chart |
| Frontend | React app | Loads at localhost:3000 |

---

## ⚡ One-Liner Quick Test

```powershell
# Check everything works (run sequentially in one terminal)
cd backend; node scripts/check-db-direct.js; echo "✓ DB OK"; 
npm start & $pid=$!; Start-Sleep 2; 
Invoke-WebRequest http://localhost:5000/api/health; echo "✓ API OK";
Stop-Process $pid
```

---

## 🔍 Common Issues & Fixes

### Port 5000 Already In Use
```powershell
# Find process
Get-NetTCPConnection -LocalPort 5000
# Kill it
Stop-Process -Id PROCESS_ID -Force
```

### Python Module Missing
```powershell
cd ai-demo
python -m pip install pandas numpy prophet statsmodels scikit-learn psycopg2-binary
```

### No Database Records
```powershell
cd backend
node scripts/seed.js
node scripts/generate-historical-data-fixed.js
```

### Frontend Won't Build
```powershell
cd frontend-web
Remove-Item -Recurse node_modules -Force
npm install
npm start
```

---

## 📊 Quick Status Check

```powershell
# All in one command
Write-Host "=== BLOOD SUITE STATUS ===" -ForegroundColor Cyan
Write-Host "Database:" $(if (Test-Connection localhost -TcpPort 5432) { "✅" } else { "❌" })
Write-Host "Backend:" $(if ((curl -s http://localhost:5000/api/health 2>$null) -ne $null) { "✅" } else { "❌" })
Write-Host "Frontend:" $(if ((curl -s http://localhost:3000 2>$null) -ne $null) { "✅" } else { "❌" })
```

---

## 🎯 Test User Accounts

```
Admin:     admin@bloodsuite.org / admin123     (Role: admin)
Hospital:  hospital@qeh.org.ls / hospital123   (Role: hospital)
Donor:     donor@example.com / donor123        (Role: donor)
```

---

## 📈 Performance Targets

```
Database query:     < 100ms  ✓
API health check:   < 50ms   ✓
User login:         < 500ms  ✓
Forecast training:  10-30s   ✓
Frontend load:      < 3s     ✓
```

---

## ✅ Full Test Checklist

Run these in order:

1. ✓ Database query succeeds
2. ✓ Backend starts without errors  
3. ✓ Health endpoint responds
4. ✓ Login returns JWT token
5. ✓ Inventory API works
6. ✓ Can create blood request
7. ✓ Forecast generates PNG
8. ✓ Frontend loads at :3000
9. ✓ Can navigate pages
10. ✓ Can login/logout UI

---

## 🔗 Service URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Database:** localhost:5432 (postgres/bloodsuite123)
- **API Docs:** http://localhost:5000/api/docs (if available)

---

Ready to test? Start with Terminal 1 ⬆️
