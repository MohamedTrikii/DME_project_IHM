@echo off
setlocal

set "PROJECT_ROOT=%~dp0"
powershell -ExecutionPolicy Bypass -File "%PROJECT_ROOT%run-all.ps1"
