@echo off
title VisionSearch Dashboard Launcher
echo ===================================================
echo   VisionSearch Dashboard Launcher (Self-Healing)
echo ===================================================
echo.

:: 1. Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not added to your PATH!
    echo Please install Python 3.10+ on this machine and check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)

:: 2. Setup/Verify Virtual Environment
echo [1/3] Verifying Python virtual environment...
set REBUILD_VENV=0

if not exist .venv (
    set REBUILD_VENV=1
) else (
    :: Check if the virtual environment python matches the current environment paths
    .venv\Scripts\python --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo [INFO] Existing virtual environment is broken or was copied from another machine.
        echo [INFO] Rebuilding virtual environment for this machine...
        set REBUILD_VENV=1
    )
)

if "%REBUILD_VENV%"=="1" (
    if exist .venv (
        echo Deleting invalid .venv directory...
        rmdir /s /q .venv
    )
    echo Creating virtual environment...
    python -m venv .venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtual environment!
        pause
        exit /b 1
    )
)

:: 3. Install Dependencies
echo [2/3] Installing/updating project dependencies (this may take a minute)...
.venv\Scripts\python -m pip install --upgrade pip
.venv\Scripts\python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies!
    pause
    exit /b 1
)

:: 4. Start Server and open browser
echo [3/3] Launching VisionSearch server...
echo.
echo Server starting at http://127.0.0.1:5000
echo.

:: Launch browser in 3 seconds to let Flask boot up
start "" http://127.0.0.1:5000

:: Run the Flask server
.venv\Scripts\python app.py
pause
