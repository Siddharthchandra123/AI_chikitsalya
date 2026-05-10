@echo off
REM Frontend startup script for Windows

setlocal

cd /d "%~dp0\frontend"

REM Install or update dependencies
if not exist "node_modules" (
    echo Installing dependencies...
    pnpm install
)

REM Build the application
echo Building application for production...
pnpm build

REM Start the production server
echo Starting Medical AI Frontend...
pnpm start

endlocal
