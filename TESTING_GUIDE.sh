#!/bin/bash
# Blood Suite - Complete Testing Guide (Step-by-Step)
# Run these steps in order to validate the entire system

echo "============================================"
echo "BLOOD SUITE - COMPLETE TESTING GUIDE"
echo "============================================"
echo ""

# STEP 1: Database Connectivity
echo "STEP 1: Testing Database Connectivity"
echo "-------------------------------------"
cd backend
node scripts/check-db-direct.js
echo ""

# STEP 2: Backend Server Check
echo "STEP 2: Starting Backend Server"
echo "-------------------------------------"
echo "Starting server..."
npm start &
BACKEND_PID=$!
sleep 3

# STEP 3: Test Backend Health
echo "STEP 3: Testing Backend Health Endpoint"
echo "-------------------------------------"
curl http://localhost:5000/api/health
echo ""
echo ""

# STEP 4: Test Authentication
echo "STEP 4: Testing User Authentication"
echo "-------------------------------------"
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bloodsuite.org","password":"admin123"}'
echo ""
echo ""

# STEP 5: Test Inventory API
echo "STEP 5: Testing Blood Inventory API"
echo "-------------------------------------"
# Get token first, then test inventory
echo "NOTE: You need a valid JWT token to test this"
echo ""

# STEP 6: Forecast Demo
echo "STEP 6: Running AI Forecasting Demo"
echo "-------------------------------------"
cd ../ai-demo
python forecast_demo.py
echo ""

# STEP 7: Check Visualization
echo "STEP 7: Checking Generated Visualization"
echo "-------------------------------------"
if [ -f real_forecast_demo.png ]; then
    echo "✅ Forecast visualization created: real_forecast_demo.png"
    ls -lh real_forecast_demo.png
else
    echo "❌ Forecast visualization not found"
fi
echo ""

# Cleanup
kill $BACKEND_PID 2>/dev/null

echo "============================================"
echo "TESTING COMPLETE"
echo "============================================"
