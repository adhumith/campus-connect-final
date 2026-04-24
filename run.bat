@echo off
echo ========================================
echo    Starting Campus Platform...
echo ========================================

:: Start Backend
start "Backend Server" cmd /k "cd /d %~dp0backend && uvicorn main:app --reload"

echo Waiting for backend to start...

:: Wait for backend to be ready by checking the port
:WAIT_BACKEND
timeout /t 2 /nobreak > nul
curl -s http://127.0.0.1:8000 > nul 2>&1
if %errorlevel% neq 0 (
    echo Backend not ready yet... retrying
    goto WAIT_BACKEND
)

echo ✅ Backend is ready!

:: Start Frontend
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Waiting for frontend to start...

:: Wait for frontend to be ready
:WAIT_FRONTEND
timeout /t 2 /nobreak > nul
curl -s http://localhost:5173 > nul 2>&1
if %errorlevel% neq 0 (
    echo Frontend not ready yet... retrying
    goto WAIT_FRONTEND
)

echo ✅ Frontend is ready!

:: Open browser
echo Opening browser...
start http://localhost:5173

echo.
echo ========================================
echo  ✅ Campus Platform is running!
echo  Backend:  http://127.0.0.1:8000
echo  Frontend: http://localhost:5173
echo ========================================
echo.
echo Press any key to close this window...
pause > nul