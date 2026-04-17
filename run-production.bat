@echo off
setlocal

set "PROJECT_ROOT=%~dp0"
set "BACKEND_PATH=%PROJECT_ROOT%backend"

if not exist "%BACKEND_PATH%" (
  echo Dossier backend introuvable.
  exit /b 1
)

echo Build frontend (production)...
cd /d "%PROJECT_ROOT%"
call npm run build:prod
if errorlevel 1 (
  echo Echec du build frontend.
  exit /b 1
)

echo Demarrage backend (sert aussi le frontend dist)...
start "DME Production" powershell -NoExit -Command "Set-Location '%BACKEND_PATH%'; npm run start"

echo Application disponible sur http://localhost:3000
echo API disponible sous http://localhost:3000/api
