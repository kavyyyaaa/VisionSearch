@echo off
setlocal enabledelayedexpansion
title VisionSearch Dashboard Launcher

echo ===================================================
echo   VisionSearch Dashboard Launcher (Self-Healing)
echo ===================================================
echo.

:: 1. Detect Python Executable (check 'py -3' and 'python')
set "PY_CMD="

py -3 --version >nul 2>&1
if %errorlevel% equ 0 (
    set "PY_CMD=py -3"
    echo [INFO] Found Python via Windows Launcher ^(py -3^).
) else (
    python --version >nul 2>&1
    if %errorlevel% equ 0 (
        set "PY_CMD=python"
        echo [INFO] Found Python executable ^(python^).
    )
)

if "%PY_CMD%"=="" (
    echo.
    echo =======================================================
    echo [ERROR] Python is NOT installed or NOT added to PATH!
    echo =======================================================
    echo.
    echo How to fix:
    echo 1. Download Python 3.10 or 3.11 from https://www.python.org/downloads/
    echo 2. During installation, MUST check the box:
    echo    "[X] Add python.exe to PATH"
    echo 3. Restart your command prompt or laptop and try again.
    echo.
    goto ON_ERROR
)

echo [INFO] Using command: %PY_CMD%
%PY_CMD% --version
echo.

:: 2. Setup / Validate Virtual Environment
echo [1/3] Checking virtual environment...

set REBUILD_VENV=0

if not exist .venv (
    echo [INFO] No .venv folder found. Creating fresh environment...
    set REBUILD_VENV=1
) else (
    if not exist .venv\Scripts\python.exe (
        echo [INFO] .venv folder is incomplete or corrupted. Rebuilding...
        set REBUILD_VENV=1
    ) else (
        .venv\Scripts\python.exe -c "import sys; print('Venv Python OK:', sys.executable)" >nul 2>&1
        if %errorlevel% neq 0 (
            echo [INFO] Existing .venv points to a different computer/path. Rebuilding...
            set REBUILD_VENV=1
        )
    )
)

if "%REBUILD_VENV%"=="1" (
    if exist .venv (
        echo [INFO] Removing old .venv directory...
        rmdir /s /q .venv >nul 2>&1
        if exist .venv (
            echo [WARNING] Could not delete old .venv folder. Renaming it...
            ren .venv .venv_old_%random% >nul 2>&1
        )
    )
    echo [INFO] Creating new virtual environment (.venv)...
    %PY_CMD% -m venv .venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtual environment with %PY_CMD%!
        goto ON_ERROR
    )
)

:: 3. Test & Install Dependencies
echo.
echo [2/3] Checking required libraries...

.venv\Scripts\python.exe -c "import torch, torchvision, faiss, flask, cv2, PIL, numpy" >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] All dependencies are already installed and working!
) else (
    echo [INFO] Installing required dependencies. This may take 2-5 minutes on first run...
    echo.
    .venv\Scripts\python.exe -m pip install --upgrade pip
    .venv\Scripts\python.exe -m pip install -r requirements.txt
    
    if %errorlevel% neq 0 (
        echo.
        echo [WARNING] Default installation failed. Attempting fallback installation...
        .venv\Scripts\python.exe -m pip install flask numpy pillow torch torchvision opencv-python werkzeug faiss-cpu
    )
    
    .venv\Scripts\python.exe -c "import torch, torchvision, faiss, flask, cv2, PIL, numpy" >nul 2>&1
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Dependency installation failed! Check internet connection or Python version compatibility.
        goto ON_ERROR
    )
)

:: 4. Launch Application
echo.
echo [3/3] Launching VisionSearch server...
echo.
echo Server starting at http://127.0.0.1:5000
echo.

:: Open browser after 3 seconds
start "" http://127.0.0.1:5000

:: Execute app.py
.venv\Scripts\python.exe app.py

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] App exited with error code %errorlevel%.
    goto ON_ERROR
)

echo.
echo Dashboard closed gracefully.
pause
exit /b 0

:ON_ERROR
echo.
echo =======================================================
echo   LAUNCH FAILED - Window kept open for debugging.
echo =======================================================
echo Please screenshot or copy the error above to debug.
echo.
pause
exit /b 1
