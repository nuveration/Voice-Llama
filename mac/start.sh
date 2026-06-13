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
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "Port $PORT is already in use. Attempting to use port $((PORT + 1))..."
    PORT=$((PORT + 1))
fi

echo "Starting Voice Llama server on http://localhost:$PORT..."
echo "Press Ctrl+C to stop the server."

# Start Ruby's built-in HTTP server in the background
ruby -run -e httpd . -p $PORT > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for the server to spin up
sleep 1.5

# Open the page in the default web browser
open "http://localhost:$PORT"

# Keep the script active to manage the server process
wait $SERVER_PID
