@echo off
title VisionSearch Dashboard Launcher

echo ===================================================
echo   VisionSearch Dashboard Launcher
echo ===================================================
echo.

:: 1. Detect Python Executable
set "PY_CMD="

py -3 --version >nul 2>&1
if %errorlevel% equ 0 (
    set "PY_CMD=py -3"
) else (
    python --version >nul 2>&1
    if %errorlevel% equ 0 (
        set "PY_CMD=python"
    )
)

if "%PY_CMD%"=="" (
    echo [ERROR] Python is NOT installed or NOT added to PATH!
    echo.
    echo Please install Python 3.10+ from https://www.python.org/downloads/
    echo MUST check: "[X] Add python.exe to PATH" during installation setup.
    echo.
    pause
    exit /b 1
)

echo [INFO] Python detected successfully.
%PY_CMD% --version
echo.

:: 2. Setup or Rebuild Virtual Environment
set REBUILD_VENV=0

if not exist .venv (
    echo [INFO] Setting up virtual environment...
    set REBUILD_VENV=1
) else (
    if not exist .venv\Scripts\python.exe (
        echo [INFO] Rebuilding virtual environment...
        set REBUILD_VENV=1
    ) else (
        .venv\Scripts\python.exe -c "import sys" >nul 2>&1
        if %errorlevel% neq 0 (
            echo [INFO] Rebuilding virtual environment for this laptop...
            set REBUILD_VENV=1
        )
    )
)

if "%REBUILD_VENV%"=="1" (
    if exist .venv (
        rmdir /s /q .venv >nul 2>&1
    )
    %PY_CMD% -m venv .venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create .venv virtual environment.
        pause
        exit /b 1
    )
)

:: 3. Install Dependencies
echo [INFO] Checking required packages...
.venv\Scripts\python.exe -c "import torch, torchvision, faiss, flask, cv2, PIL, numpy" >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Installing required libraries. Please wait 1-3 minutes...
    .venv\Scripts\python.exe -m pip install --upgrade pip
    .venv\Scripts\python.exe -m pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo [WARNING] Standard install failed. Trying direct package install...
        .venv\Scripts\python.exe -m pip install flask numpy pillow torch torchvision opencv-python werkzeug faiss-cpu
    )
)

:: 4. Launch App
echo.
echo ===================================================
echo   Starting VisionSearch Server...
echo   (Browser will open automatically once ready)
echo ===================================================
echo.

.venv\Scripts\python.exe app.py

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Server exited with error code %errorlevel%.
    pause
    exit /b 1
)

pause
