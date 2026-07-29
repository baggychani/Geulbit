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
    if errorlevel 1 exit /b 1
    echo.
)

call npm run dev -- --open --strictPort
