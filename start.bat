@echo off
echo Starting AIEngSchool backend on port 8001...
start "AIEngSchool API" cmd /k "cd /d %~dp0 && uvicorn api.main:app --reload --port 8001"

echo Starting AIEngSchool frontend on port 3001...
start "AIEngSchool Web" cmd /k "cd /d %~dp0aiengschool-web && npm run dev"

echo.
echo Backend : http://localhost:8001/docs
echo Frontend: http://localhost:3001
