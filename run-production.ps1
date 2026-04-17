$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $projectRoot 'backend'

if (-not (Test-Path $backendPath)) {
  Write-Host 'Dossier backend introuvable.' -ForegroundColor Red
  exit 1
}

Write-Host 'Build frontend (production)...' -ForegroundColor Cyan
Push-Location $projectRoot
npm run build:prod
if ($LASTEXITCODE -ne 0) {
  Pop-Location
  Write-Host 'Echec du build frontend.' -ForegroundColor Red
  exit $LASTEXITCODE
}
Pop-Location

Write-Host 'Demarrage backend (sert aussi le frontend dist)...' -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  '-NoExit',
  '-Command',
  "Set-Location '$backendPath'; npm run start"
) -WindowStyle Normal

Write-Host 'Application disponible sur http://localhost:3000' -ForegroundColor Green
Write-Host 'API disponible sous http://localhost:3000/api' -ForegroundColor Green
