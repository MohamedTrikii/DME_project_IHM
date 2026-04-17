$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $projectRoot 'backend'
$mongoRoot = Join-Path $projectRoot '.mongo'
$mongoDataPath = Join-Path $mongoRoot 'data'
$mongoLogDir = Join-Path $mongoRoot 'log'
$mongoLogPath = Join-Path $mongoLogDir 'mongod.log'

if (-not (Test-Path $backendPath)) {
  Write-Host 'Dossier backend introuvable.' -ForegroundColor Red
  exit 1
}

if (-not (Test-Path $mongoDataPath)) {
  New-Item -ItemType Directory -Path $mongoDataPath -Force | Out-Null
}

if (-not (Test-Path $mongoLogDir)) {
  New-Item -ItemType Directory -Path $mongoLogDir -Force | Out-Null
}

function Test-MongoPort {
  try {
    $client = New-Object System.Net.Sockets.TcpClient
    $client.Connect('127.0.0.1', 27017)
    $client.Close()
    return $true
  } catch {
    return $false
  }
}

Write-Host 'Verification MongoDB...' -ForegroundColor Cyan

if (Test-MongoPort) {
  Write-Host 'MongoDB deja actif sur le port 27017.' -ForegroundColor Green
} else {
  $mongoService = Get-Service -Name 'MongoDB' -ErrorAction SilentlyContinue

  if ($null -ne $mongoService -and $mongoService.Status -ne 'Running') {
    Write-Host 'Demarrage du service Windows MongoDB...' -ForegroundColor Yellow
    Start-Service -Name 'MongoDB' -ErrorAction SilentlyContinue
  }

  if (-not (Test-MongoPort)) {
    $mongodCmd = Get-Command mongod -ErrorAction SilentlyContinue

    if ($null -ne $mongodCmd) {
      Write-Host 'Demarrage mongod dans une nouvelle fenetre...' -ForegroundColor Yellow

      $escapedData = $mongoDataPath -replace "'", "''"
      $escapedLog = $mongoLogPath -replace "'", "''"

      Start-Process powershell -ArgumentList @(
        '-NoExit',
        '-Command',
        "mongod --dbpath '$escapedData' --logpath '$escapedLog' --bind_ip 127.0.0.1"
      ) -WindowStyle Normal
    }
  }

  if (-not (Test-MongoPort)) {
    $dockerCmd = Get-Command docker -ErrorAction SilentlyContinue

    if ($null -ne $dockerCmd) {
      Write-Host "Tentative de demarrage du conteneur Docker 'mongodb'..." -ForegroundColor Yellow
      & docker start mongodb | Out-Null
    }
  }

  if (-not (Test-MongoPort)) {
    Write-Host 'MongoDB non demarre automatiquement.' -ForegroundColor Red
    Write-Host 'Essayez: service MongoDB, mongod dans le PATH, ou un conteneur Docker nomme mongodb.' -ForegroundColor Red
  }
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

Write-Host 'Services lances.' -ForegroundColor Green
Write-Host 'MongoDB: mongodb://127.0.0.1:27017' -ForegroundColor Green
Write-Host 'Backend: http://localhost:3000' -ForegroundColor Green
Write-Host 'Frontend: http://localhost:4200' -ForegroundColor Green
