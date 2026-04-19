@echo off
REM Script pour lancer le backend et le frontend

REM Lancer le backend
start cmd /k "cd backend && npm start"

REM Lancer le frontend
start cmd /k "npm start"
