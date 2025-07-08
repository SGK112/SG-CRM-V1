#!/bin/bash
echo "Starting CLEAN CRM Application..."

# Kill existing processes
pkill -f "react-scripts start" 2>/dev/null
pkill -f "npm start" 2>/dev/null
pkill -f "uvicorn" 2>/dev/null

echo "Starting backend server..."
cd /workspaces/SG-CRM-V1/backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

sleep 3

echo "Starting frontend server..."
cd /workspaces/SG-CRM-V1/frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "🚀 CRM Application Started!"
echo "📱 Frontend: https://shiny-giggle-69gw4wqgg777fr54-3000.app.github.dev"
echo "🔧 Backend API: https://shiny-giggle-69gw4wqgg777fr54-8000.app.github.dev"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait
