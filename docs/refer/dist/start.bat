@echo off
echo ===================================================
echo Starting Gailvlun AI Tutor (Windows)
echo ===================================================

echo [1/2] Installing dependencies...
call npm install

echo [2/2] Starting development server...
call npm run dev

pause
