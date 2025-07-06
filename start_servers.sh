#!/bin/bash
# Simple startup script for SG-CRM-V1

echo "Starting SG-CRM-V1 servers..."

# Start backend server
echo "Starting backend server..."
cd /workspaces/SG-CRM-V1/backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "Starting frontend server..."
cd /workspaces/SG-CRM-V1/frontend
npm start &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Backend running on: http://localhost:8000"
echo "Frontend running on: http://localhost:3000"

# Keep the script running
wait
