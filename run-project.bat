@echo off
setlocal

set "PROJECT_ROOT=%~dp0"
set "BACKEND_PATH=%PROJECT_ROOT%backend"

if not exist "%BACKEND_PATH%" (
  echo Dossier backend introuvable.
  exit /b 1
)

echo Demarrage backend et frontend...
start "DME Backend" powershell -NoExit -Command "Set-Location '%BACKEND_PATH%'; npm run dev"
start "DME Frontend" powershell -NoExit -Command "Set-Location '%PROJECT_ROOT%'; npm start"

echo Services lances.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:4200
