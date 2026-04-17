$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $projectRoot 'backend'

if (-not (Test-Path $backendPath)) {
  Write-Host 'Dossier backend introuvable.' -ForegroundColor Red
  exit 1
}

Write-Host 'Demarrage backend (port 3000) et frontend (port 4200)...' -ForegroundColor Cyan

Start-Process powershell -ArgumentList @(
  '-NoExit',
  '-Command',
  "Set-Location '$backendPath'; npm run dev"
) -WindowStyle Normal

Start-Process powershell -ArgumentList @(
  '-NoExit',
  '-Command',
  "Set-Location '$projectRoot'; npm start"
) -WindowStyle Normal

Write-Host 'Services lances. Backend: http://localhost:3000 | Frontend: http://localhost:4200' -ForegroundColor Green
