@echo off
title PregManage Server
color 0B

echo ========================================================
echo               PREGMANAGE SERVER STARTUP
echo ========================================================
echo.
echo 🔐 DEFAULT ADMIN CREDENTIALS:
echo    Username: admin
echo    Password: DOC_Admin@465
echo.
echo ========================================================
echo Starting the Node.js Server...
echo The application will open in your browser automatically...
echo.

:: Automatically open the browser to the correct page after a 4 second delay
start /b cmd /c "timeout /t 4 >nul && start http://localhost:3000"

node backend/server.js

if %errorlevel% neq 0 (
    echo.
    echo ❌ Server crashed or failed to start.
    echo Make sure MongoDB is running and the .env file has the correct MONGODB_URI.
    echo.
    pause
)
