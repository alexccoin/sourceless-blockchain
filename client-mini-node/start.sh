#!/bin/bash

echo "========================================"
echo "  Sourceless Mini-Node Client"
echo "  Starting local server..."
echo "========================================"
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python is not installed!"
    echo "Please install Python from https://python.org"
    exit 1
fi

echo "Starting server on http://localhost:8000"
echo
echo "Open your browser and go to:"
echo "http://localhost:8000/index.html"
echo
echo "Press Ctrl+C to stop the server"
echo

cd "$(dirname "$0")"
python3 -m http.server 8000
