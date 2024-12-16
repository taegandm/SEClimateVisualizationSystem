#!/bin/bash

# Navigate to the src directory
cd src || exit

# Start the Python HTTP server in the background
echo "Starting the local server on port 8000..."
python3 -m http.server 8000 &
SERVER_PID=$!

# Open the index.html page in the default browser
open "http://localhost:8000/index.html"

# Function to check if the browser process is running
check_browser_running() {
    # Adjust 'Safari' to the expected browser name if needed
    pgrep -x "Safari" > /dev/null || pgrep -x "Google Chrome" > /dev/null || pgrep -x "firefox" > /dev/null
}

# Wait until the browser is closed
echo "Waiting for the browser to close..."
while check_browser_running; do
    sleep 1
done

# Stop the server when the browser closes
echo "Closing the local server..."
kill $SERVER_PID

