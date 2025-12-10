# AttendWell Startup Script
# This script starts both the backend and frontend servers

Write-Host "🚀 Starting AttendWell..." -ForegroundColor Cyan
Write-Host ""

# Start JSON Server in background
Write-Host "📦 Starting Backend (JSON Server)..." -ForegroundColor Yellow
$serverPath = Join-Path $PSScriptRoot "server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$serverPath'; Write-Host '🔧 Backend running on http://localhost:8000' -ForegroundColor Green; node index.js"

# Wait a bit for server to start
Start-Sleep -Seconds 2

# Start Vite dev server in background
Write-Host "⚡ Starting Frontend (Vite)..." -ForegroundColor Yellow
$clientPath = Join-Path $PSScriptRoot "client"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$clientPath'; Write-Host '⚡ Frontend running on http://localhost:5173' -ForegroundColor Green; pnpm dev"

# Wait for servers to start
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "✅ Both servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Open your browser and navigate to:" -ForegroundColor Cyan
Write-Host "   http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "🎭 Demo Credentials:" -ForegroundColor Cyan
Write-Host "   Student: fatima@student.coasttech.ac.ke" -ForegroundColor White
Write-Host "   Lecturer: anne@coasttech.ac.ke" -ForegroundColor White
Write-Host "   Admin: admin@coasttech.ac.ke" -ForegroundColor White
Write-Host "   Password: any password" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit (servers will continue running)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
