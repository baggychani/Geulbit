@echo off
title Hangul Color Tool

echo.
echo ==================================================
echo   Hangul Color Tool  ^|  Teacher Edition
echo   URL: http://localhost:5173
echo   Stop: Ctrl+C or close this window
echo ==================================================
echo.

if not exist "node_modules" (
    echo Installing packages...
    call npm install
    echo.
)

start "" "http://localhost:5173"
timeout /t 2 /nobreak >nul

call npm run dev
