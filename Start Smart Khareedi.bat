@echo off
title Smart Khareedi

echo Starting Smart Khareedi...

start "Smart Khareedi Backend" cmd /k "cd /d C:\Users\Parth\Desktop\smart-khareedi\backend && node server.js"

timeout /t 3 /nobreak >nul

start "Smart Khareedi Frontend" cmd /k "cd /d C:\Users\Parth\Desktop\smart-khareedi\frontend && npm run dev"

timeout /t 5 /nobreak >nul

start http://localhost:5173

echo.
echo Smart Khareedi started successfully!
pause