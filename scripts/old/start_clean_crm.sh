#!/bin/bash
# Clean CRM startup script

echo "Starting CLEAN CRM application..."

# Kill any existing processes
pkill -f "npm start" || true
pkill -f "uvicorn" || true

# Start backend
cd /workspaces/SG-CRM-V1/backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &

# Start frontend
cd /workspaces/SG-CRM-V1/frontend
npm start &

echo "Servers started!"
echo "Frontend: https://shiny-giggle-69gw4wqgg777fr54-3000.app.github.dev"
echo "Backend: https://shiny-giggle-69gw4wqgg777fr54-8000.app.github.dev"

wait
