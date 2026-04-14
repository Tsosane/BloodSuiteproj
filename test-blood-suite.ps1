# Blood Suite - Interactive Testing Script (Windows PowerShell)
# Run with: powershell -ExecutionPolicy Bypass -File test-blood-suite.ps1

Clear-Host
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   BLOOD SUITE - INTERACTIVE TESTING SCRIPT                ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$testResults = @()

# HELPER FUNCTION
function Test-Component {
    param(
        [string]$TestName,
        [scriptblock]$TestCommand,
        [string]$Description
    )
    Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
    Write-Host "TEST: $TestName" -ForegroundColor Yellow
    Write-Host "INFO: $Description" -ForegroundColor Gray
    Write-Host ""
    
    try {
        & $TestCommand
        $testResults += @{ Name = $TestName; Status = "✅ PASS" }
        Write-Host "✅ PASS: $TestName" -ForegroundColor Green
    }
    catch {
        $testResults += @{ Name = $TestName; Status = "❌ FAIL" }
        Write-Host "❌ FAIL: $TestName" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
    Write-Host ""
}

# STEP 1: Database Connectivity
Test-Component -TestName "Database Connectivity" `
    -Description "Checking PostgreSQL connection and data availability" `
    -TestCommand {
        Push-Location backend
        node scripts/check-db-direct.js
        Pop-Location
    }

# STEP 2: Backend Server Check
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "STARTING: Backend Server" -ForegroundColor Yellow
Write-Host "INFO: Starting Node.js Express server on port 5000" -ForegroundColor Gray
Write-Host ""

Push-Location backend
$backendProcess = Start-Process -FilePath "npm" -ArgumentList "start" -PassThru -NoNewWindow
Start-Sleep -Seconds 3

# STEP 3: Backend Health Check
Test-Component -TestName "Backend Health Endpoint" `
    -Description "Testing API server availability" `
    -TestCommand {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET -ErrorAction Stop
            $response.Content | ConvertFrom-Json | Out-String | Write-Host
        }
        catch {
            throw "Backend not responding on http://localhost:5000"
        }
    }

# STEP 4: Authentication Test
Test-Component -TestName "User Authentication" `
    -Description "Testing login with admin credentials" `
    -TestCommand {
        $loginData = @{
            email = "admin@bloodsuite.org"
            password = "admin123"
        } | ConvertTo-Json

        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
            -Method POST `
            -ContentType "application/json" `
            -Body $loginData `
            -ErrorAction Stop

        $result = $response.Content | ConvertFrom-Json
        
        if (-not $result.token) {
            throw "No JWT token received"
        }
        
        Write-Host "✅ JWT Token received: $($result.token.Substring(0, 30))..." -ForegroundColor Green
        Write-Host "User: $($result.user.email) ($($result.user.role))" -ForegroundColor Green
        
        # Store token for next tests
        $global:AuthToken = $result.token
    }

# STEP 5: Inventory API Test
Test-Component -TestName "Blood Inventory API" `
    -Description "Fetching current blood inventory (requires authentication)" `
    -TestCommand {
        if (-not $global:AuthToken) {
            throw "No authentication token available"
        }

        $headers = @{
            Authorization = "Bearer $($global:AuthToken)"
            "Content-Type" = "application/json"
        }

        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/inventory" `
            -Method GET `
            -Headers $headers `
            -ErrorAction Stop

        $result = $response.Content | ConvertFrom-Json
        Write-Host "Inventory Items:" -ForegroundColor Green
        foreach ($item in $result.inventory) {
            Write-Host "  - $($item.blood_type): $($item.quantity_ml)ml ($($item.status))" -ForegroundColor Green
        }
    }

# STEP 6: Create Blood Request (Optional)
Test-Component -TestName "Create Blood Request" `
    -Description "Testing POST request creation (emergency blood request)" `
    -TestCommand {
        if (-not $global:AuthToken) {
            throw "No authentication token available"
        }

        $requestData = @{
            blood_type = "O-"
            quantity_ml = 450
            urgency = "emergency"
            patient_name = "Test Patient"
            required_date = "2026-04-10"
        } | ConvertTo-Json

        $headers = @{
            Authorization = "Bearer $($global:AuthToken)"
            "Content-Type" = "application/json"
        }

        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/requests" `
            -Method POST `
            -Headers $headers `
            -Body $requestData `
            -ErrorAction Stop

        $result = $response.Content | ConvertFrom-Json
        Write-Host "Request created: $($result.request.id)" -ForegroundColor Green
        Write-Host "Type: $($result.request.blood_type) | Status: $($result.request.status)" -ForegroundColor Green
    }

# STEP 7: AI Forecasting
Test-Component -TestName "AI Forecasting Demo" `
    -Description "Running Python AI forecasting with real database data" `
    -TestCommand {
        Push-Location ai-demo
        python forecast_demo.py
        Pop-Location
    }

# STEP 8: Check Forecast Output
Test-Component -TestName "Forecast Visualization" `
    -Description "Verifying PNG chart was generated" `
    -TestCommand {
        $chartPath = "ai-demo/real_forecast_demo.png"
        if (Test-Path $chartPath) {
            $file = Get-Item $chartPath
            Write-Host "✅ Chart found: $($file.FullName)" -ForegroundColor Green
            Write-Host "   Size: $([Math]::Round($file.Length / 1KB, 2))KB" -ForegroundColor Green
        }
        else {
            throw "Forecast chart not found at $chartPath"
        }
    }

# STEP 9: Frontend Build Check  
Test-Component -TestName "Frontend Build" `
    -Description "Verifying React application builds successfully" `
    -TestCommand {
        Push-Location frontend-web
        Write-Host "Building React application..." -ForegroundColor Gray
        npm run build 2>&1 | Select-Object -Last 5 | Out-String | Write-Host
        Pop-Location
    }

# Cleanup
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "CLEANUP: Stopping backend server" -ForegroundColor Yellow
Write-Host ""
Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
Write-Host "Backend process stopped" -ForegroundColor Green

# Summary Report
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              TEST SUMMARY REPORT                          ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$passed = ($testResults | Where-Object { $_.Status -like "*PASS*" }).Count
$failed = ($testResults | Where-Object { $_.Status -like "*FAIL*" }).Count

foreach ($result in $testResults) {
    $icon = if ($result.Status -like "*PASS*") { "✅" } else { "❌" }
    $color = if ($result.Status -like "*PASS*") { "Green" } else { "Red" }
    Write-Host "$icon $($result.Name): $($result.Status)" -ForegroundColor $color
}

Write-Host ""
Write-Host "Summary: $passed passed, $failed failed" -ForegroundColor Cyan
Write-Host ""

if ($failed -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED! Blood Suite is fully operational." -ForegroundColor Green
}
else {
    Write-Host "⚠️  Some tests failed. Check the output above for details." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Start backend:    cd backend && npm start" -ForegroundColor Gray
Write-Host "  2. Start frontend:   cd frontend-web && npm start" -ForegroundColor Gray
Write-Host "  3. Open browser:     http://localhost:3000" -ForegroundColor Gray
Write-Host "  4. Login with:       admin@bloodsuite.org / admin123" -ForegroundColor Gray
Write-Host ""

Pop-Location
