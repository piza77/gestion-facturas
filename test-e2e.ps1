# E2E Testing Utility Script for Windows
# Usage: .\test-e2e.ps1 [command]
# Commands: 
#   dev-server  - Start development server
#   open        - Open Cypress UI
#   run         - Run E2E tests headless
#   spec FILE   - Run specific test file
#   debug       - Run with debug mode
#   ci          - Run CI mode

param(
    [string]$Command = "run",
    [string]$SpecFile
)

$ErrorActionPreference = "Stop"
$frontendPath = Join-Path (Get-Location) "frontend"

Set-Location $frontendPath

Write-Host "📦 Working directory: $frontendPath" -ForegroundColor Cyan

switch ($Command) {
    "dev-server" {
        Write-Host "🚀 Starting development server on port 5173..." -ForegroundColor Green
        npm run serve
    }
    "open" {
        Write-Host "📱 Opening Cypress UI..." -ForegroundColor Green
        npm run cypress:open
    }
    "run" {
        Write-Host "🧪 Running E2E tests (headless)..." -ForegroundColor Green
        npm run cypress:run
    }
    "spec" {
        if ([string]::IsNullOrEmpty($SpecFile)) {
            Write-Host "❌ Error: Specify test file" -ForegroundColor Red
            Write-Host "Usage: .\test-e2e.ps1 spec cypress/e2e/auth.cy.js" -ForegroundColor Yellow
            exit 1
        }
        Write-Host "🧪 Running specific test: $SpecFile" -ForegroundColor Green
        npx cypress run --spec "$SpecFile"
    }
    "debug" {
        Write-Host "🐛 Running E2E tests with debug mode..." -ForegroundColor Green
        npx cypress run --debug
    }
    "ci" {
        Write-Host "🔄 Running E2E tests in CI mode..." -ForegroundColor Green
        npm run cypress:ci
    }
    "all" {
        Write-Host "🚀 Starting full E2E test cycle..." -ForegroundColor Green
        
        Write-Host "1️⃣ Starting development server..." -ForegroundColor Cyan
        $serverProcess = Start-Process -FilePath npm -ArgumentList "run serve" -PassThru -NoNewWindow
        
        Write-Host "2️⃣ Waiting for server to start..." -ForegroundColor Cyan
        Start-Sleep -Seconds 5
        
        Write-Host "3️⃣ Running E2E tests..." -ForegroundColor Cyan
        npm run cypress:run
        
        Write-Host "4️⃣ Stopping development server..." -ForegroundColor Cyan
        if ($serverProcess) {
            Stop-Process -InputObject $serverProcess -Force -ErrorAction SilentlyContinue
        }
        
        Write-Host "✅ E2E test cycle complete!" -ForegroundColor Green
    }
    default {
        Write-Host "Usage: .\test-e2e.ps1 [command] [options]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Commands:" -ForegroundColor Cyan
        Write-Host "  dev-server  - Start development server on port 5173" -ForegroundColor White
        Write-Host "  open        - Open Cypress interactive UI" -ForegroundColor White
        Write-Host "  run         - Run all E2E tests (headless)" -ForegroundColor White
        Write-Host "  spec FILE   - Run specific test file" -ForegroundColor White
        Write-Host "  debug       - Run tests with debug mode" -ForegroundColor White
        Write-Host "  ci          - Run tests in CI mode" -ForegroundColor White
        Write-Host "  all         - Full cycle: start server, run tests, cleanup" -ForegroundColor White
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor Cyan
        Write-Host "  .\test-e2e.ps1 dev-server" -ForegroundColor Gray
        Write-Host "  .\test-e2e.ps1 open" -ForegroundColor Gray
        Write-Host "  .\test-e2e.ps1 spec cypress/e2e/auth.cy.js" -ForegroundColor Gray
        Write-Host "  .\test-e2e.ps1 run" -ForegroundColor Gray
        Write-Host "  .\test-e2e.ps1 all" -ForegroundColor Gray
        exit 1
    }
}
