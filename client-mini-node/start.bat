@echo off
echo ========================================
echo   Sourceless Mini-Node Client
echo   Starting local server...
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed!
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

echo Starting server on http://localhost:8000
echo.
echo Open your browser and go to:
echo http://localhost:8000/index.html
echo.
echo Press Ctrl+C to stop the server
echo.

cd /d "%~dp0"
python -m http.server 8000

pause
