@echo off
echo Starting ChefMate...

echo [1/3] Starting Python Backend Server...
start cmd /k "python app.py"

echo [2/3] Installing Frontend Dependencies...
cd frontend
call npm install

echo [3/3] Starting Frontend React Server...
start cmd /k "npm run dev"

echo Done! The frontend will open in your browser shortly (usually at http://localhost:5173).
echo You can close this window now. The servers are running in the other two windows.
pause
