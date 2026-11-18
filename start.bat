@echo off
cd /d "%~dp0"
start "" http://localhost:8002/user/
node server.js
pause
