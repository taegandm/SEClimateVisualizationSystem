@echo off
cd src
echo Starting the local server on port 8000...

:: Start the Python HTTP server in a new process
start "" /b python -m http.server 8000 >nul 2>&1
set SERVER_PID=%!

:: Open the index.html page in the default browser
start "" http://localhost:8000/index.html

:: Wait for the browser to close
:check_browser
tasklist /fi "imagename eq chrome.exe" | find /i "chrome.exe" >nul
if %errorlevel%==0 (
    timeout /t 1 >nul
    goto check_browser
)

:: Stop the server when the browser is closed
echo Closing the local server...
taskkill /pid %SERVER_PID% /f >nul 2>&1
