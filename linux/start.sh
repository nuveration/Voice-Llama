#!/bin/bash

# Port to run the server on
PORT=8000

# Function to clean up background processes on exit
cleanup() {
    echo ""
    echo "Stopping Voice Llama server..."
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null
    fi
    exit 0
}

# Trap INT (Ctrl+C) and TERM signals
trap cleanup INT TERM

# Check if port is already in use
while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; do
    PORT=$((PORT + 1))
done

# Check if python3 is available, else try ruby
if command -v python3 &>/dev/null; then
    echo "Starting Voice Llama server using Python3 on http://localhost:$PORT..."
    python3 -m http.server $PORT > /dev/null 2>&1 &
    SERVER_PID=$!
elif command -v ruby &>/dev/null; then
    echo "Starting Voice Llama server using Ruby on http://localhost:$PORT..."
    ruby -run -e httpd . -p $PORT > /dev/null 2>&1 &
    SERVER_PID=$!
else
    echo "Error: You need Python3 or Ruby installed to host the local server."
    exit 1
fi

# Wait for the server to spin up
sleep 1.5

# Open the page in the default web browser on Linux
if command -v xdg-open &>/dev/null; then
    xdg-open "http://localhost:$PORT"
elif command -v sensible-browser &>/dev/null; then
    sensible-browser "http://localhost:$PORT"
else
    echo "Please open http://localhost:$PORT in your web browser."
fi

# Keep the script active to manage the server process
wait $SERVER_PID
