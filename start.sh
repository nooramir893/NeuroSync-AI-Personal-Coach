#!/bin/bash

echo "Starting NeuroSync Backend and Frontend..."

# Kill any existing processes on these ports
echo "Stopping any existing servers..."
pkill -f "uvicorn backend.app:app" 2>/dev/null
pkill -f "vite" 2>/dev/null

# Start backend in background
echo "Starting backend server on port 8000..."
uvicorn backend.app:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✓ Backend running on http://127.0.0.1:8000"
echo "✓ Frontend running on http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
wait
