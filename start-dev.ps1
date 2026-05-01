# NexusEstate — Dev Startup Script (PowerShell)
# Run from project root: .\start-dev.ps1

# Get the directory this script lives in (the project root)
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NexusEstate -- Starting All Services  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Root: $root" -ForegroundColor DarkGray
Write-Host ""

# ── Backend (Node.js) ─────────────────────────────────────
Write-Host "[1/4] Backend (Node.js)    --> http://localhost:3001" -ForegroundColor Green
Start-Process powershell `
    -ArgumentList "-NoExit", "-Command", "if (-not (Test-Path node_modules)) { npm install }; npm run dev" `
    -WorkingDirectory "$root\backend"

Start-Sleep -Seconds 1

# ── Swap Engine (Python FastAPI) ──────────────────────────
Write-Host "[2/4] Swap Engine (Python) --> http://localhost:8001" -ForegroundColor Green
Start-Process powershell `
    -ArgumentList "-NoExit", "-Command", "uvicorn main:app --reload --port 8001" `
    -WorkingDirectory "$root\swap-engine"

Start-Sleep -Seconds 1

# ── AI Service (Python FastAPI) ───────────────────────────
Write-Host "[3/4] AI Service (Python)  --> http://localhost:8000" -ForegroundColor Green
Start-Process powershell `
    -ArgumentList "-NoExit", "-Command", "uvicorn main:app --reload --port 8000" `
    -WorkingDirectory "$root\ai-service"

Start-Sleep -Seconds 1

# ── Frontend (Next.js) ────────────────────────────────────
Write-Host "[4/4] Frontend (Next.js)   --> http://localhost:3000" -ForegroundColor Green
Start-Process powershell `
    -ArgumentList "-NoExit", "-Command", "if (-not (Test-Path node_modules)) { npm install }; npm run dev" `
    -WorkingDirectory "$root\frontend"

Write-Host ""
Write-Host "All 4 services launched in separate windows!" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Frontend   -->  http://localhost:3000" -ForegroundColor Yellow
Write-Host "  Backend    -->  http://localhost:3001" -ForegroundColor Yellow
Write-Host "  AI Service -->  http://localhost:8000" -ForegroundColor Yellow
Write-Host "  Swap Engine-->  http://localhost:8001" -ForegroundColor Yellow
Write-Host ""
