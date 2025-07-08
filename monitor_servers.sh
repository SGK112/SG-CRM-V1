#!/bin/bash

# CRM Server Monitor and Restart Script
# This script monitors the CRM servers and restarts them if they stop

LOG_FILE="/workspaces/SG-CRM-V1/server_monitor.log"
BACKEND_DIR="/workspaces/SG-CRM-V1/backend"
FRONTEND_DIR="/workspaces/SG-CRM-V1/frontend"

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Function to check if backend is running
check_backend() {
    if curl -s -f http://localhost:8000/health > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to check if frontend is running
check_frontend() {
    if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to start backend
start_backend() {
    log_message "Starting backend server..."
    cd "$BACKEND_DIR"
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi
    nohup python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > backend.log 2>&1 &
    echo $! > backend.pid
    log_message "Backend server started with PID: $(cat backend.pid)"
}

# Function to start frontend
start_frontend() {
    log_message "Starting frontend server..."
    cd "$FRONTEND_DIR"
    nohup npm start > frontend.log 2>&1 &
    echo $! > frontend.pid
    log_message "Frontend server started with PID: $(cat frontend.pid)"
}

# Function to check and restart servers
monitor_servers() {
    log_message "Checking server status..."
    
    # Check backend
    if check_backend; then
        log_message "Backend is running - OK"
    else
        log_message "Backend is not responding - restarting..."
        start_backend
        sleep 5
        if check_backend; then
            log_message "Backend restart successful"
        else
            log_message "Backend restart failed"
        fi
    fi
    
    # Check frontend
    if check_frontend; then
        log_message "Frontend is running - OK"
    else
        log_message "Frontend is not responding - restarting..."
        start_frontend
        sleep 10
        if check_frontend; then
            log_message "Frontend restart successful"
        else
            log_message "Frontend restart failed"
        fi
    fi
}

# Check MongoDB
check_mongodb() {
    if docker ps | grep -q mongo; then
        log_message "MongoDB is running - OK"
    else
        log_message "MongoDB is not running - starting..."
        docker run -d --name mongodb -p 27017:27017 mongo:7.0
        sleep 5
        if docker ps | grep -q mongo; then
            log_message "MongoDB start successful"
        else
            log_message "MongoDB start failed"
        fi
    fi
}

# Main monitoring loop
if [ "$1" = "start" ]; then
    log_message "=== CRM Server Monitor Started ==="
    
    # Initial check
    monitor_servers
    check_mongodb
    
    # Monitor every 2 minutes
    while true; do
        sleep 120
        monitor_servers
        check_mongodb
    done
    
elif [ "$1" = "check" ]; then
    log_message "=== Manual Server Check ==="
    monitor_servers
    check_mongodb
    
    # Show current status
    echo ""
    echo "=== Current Status ==="
    echo "Backend (8000): $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)"
    echo "Frontend (3000): $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)"
    echo "MongoDB: $(docker ps | grep mongo | wc -l) containers running"
    
elif [ "$1" = "stop" ]; then
    log_message "=== Stopping CRM Servers ==="
    
    # Stop backend
    if [ -f "$BACKEND_DIR/backend.pid" ]; then
        kill $(cat "$BACKEND_DIR/backend.pid") 2>/dev/null
        rm "$BACKEND_DIR/backend.pid"
        log_message "Backend stopped"
    fi
    
    # Stop frontend
    if [ -f "$FRONTEND_DIR/frontend.pid" ]; then
        kill $(cat "$FRONTEND_DIR/frontend.pid") 2>/dev/null
        rm "$FRONTEND_DIR/frontend.pid"
        log_message "Frontend stopped"
    fi
    
else
    echo "Usage: $0 {start|check|stop}"
    echo "  start - Start monitoring servers (runs continuously)"
    echo "  check - Check server status once"
    echo "  stop  - Stop all servers"
fi
