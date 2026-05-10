@echo off
REM Backend startup script for Windows

setlocal enabledelayedexpansion

cd /d "%~dp0\backend"

REM Activate virtual environment if it exists
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)

REM Set environment variables
set FLASK_ENV=production
set PYTHONUNBUFFERED=1

REM Get port from environment or use default
if not defined PORT set PORT=5000

echo Starting Medical AI Backend...

REM Start with gunicorn
python -m gunicorn ^
    --bind 0.0.0.0:%PORT% ^
    --workers 4 ^
    --worker-class sync ^
    --timeout 120 ^
    --access-logfile - ^
    --error-logfile - ^
    --log-level info ^
    API:app

endlocal
