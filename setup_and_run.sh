#!/bin/bash

# SG-CRM-V1 Complete Setup Script
# This script will set up and start your entire CRM system

set -e  # Exit on any error

echo "🚀 Starting SG-CRM-V1 Complete Setup..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if running in correct directory
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the root directory of SG-CRM-V1"
    exit 1
fi

# Step 1: Check Prerequisites
print_step "1. Checking Prerequisites..."

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is required but not installed."
    exit 1
fi
print_status "Python 3 is installed: $(python3 --version)"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is required but not installed."
    exit 1
fi
print_status "Node.js is installed: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is required but not installed."
    exit 1
fi
print_status "npm is installed: $(npm --version)"

# Check MongoDB
if ! command -v mongod &> /dev/null; then
    print_warning "MongoDB is not installed locally. You can:"
    print_warning "1. Install MongoDB locally"
    print_warning "2. Use MongoDB Atlas (cloud)"
    print_warning "3. Use Docker to run MongoDB"
    print_warning "The system will try to connect to localhost:27017"
fi

# Step 2: Backend Setup
print_step "2. Setting up Backend..."

cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
print_status "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Using default configuration."
    print_warning "You may need to update the .env file with your actual API keys."
fi

cd ..

# Step 3: Frontend Setup
print_step "3. Setting up Frontend..."

cd frontend

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
npm install

# Check if .env exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Using default configuration."
fi

cd ..

# Step 4: Start MongoDB (if available)
print_step "4. Starting MongoDB..."

if command -v mongod &> /dev/null; then
    # Check if MongoDB is already running
    if pgrep mongod > /dev/null; then
        print_status "MongoDB is already running"
    else
        print_status "Starting MongoDB..."
        mongod --fork --logpath /tmp/mongodb.log --dbpath /tmp/mongodb-data > /dev/null 2>&1 || {
            print_warning "Could not start MongoDB automatically. Please start it manually."
            print_warning "You can also use MongoDB Atlas or Docker."
        }
    fi
else
    print_warning "MongoDB not found. Make sure you have MongoDB running somewhere."
fi

# Step 5: Start Backend Server
print_step "5. Starting Backend Server..."

cd backend
source venv/bin/activate

print_status "Starting FastAPI backend server..."
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Check if backend started successfully
if curl -s http://localhost:8000/docs > /dev/null; then
    print_status "Backend server started successfully on http://localhost:8000"
    print_status "API Documentation: http://localhost:8000/docs"
else
    print_error "Backend server failed to start. Check the logs above."
    exit 1
fi

cd ..

# Step 6: Start Frontend Server
print_step "6. Starting Frontend Server..."

cd frontend

print_status "Starting React frontend server..."
npm start &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 10

cd ..

# Final Status
print_step "7. Setup Complete!"
echo "========================================"
print_status "✅ Backend Server: http://localhost:8000"
print_status "✅ API Documentation: http://localhost:8000/docs"
print_status "✅ Frontend Application: http://localhost:3000"
print_status "✅ MongoDB: localhost:27017"
echo ""
print_status "Process IDs:"
print_status "Backend PID: $BACKEND_PID"
print_status "Frontend PID: $FRONTEND_PID"
echo ""
print_warning "📝 Next Steps:"
print_warning "1. Update your .env files with actual API keys (Stripe, Cloudinary, etc.)"
print_warning "2. Configure your MongoDB connection if using Atlas or external MongoDB"
print_warning "3. Load sample data: cd backend && python load_csv_data.py"
print_warning "4. Visit http://localhost:3000 to use the application"
echo ""
print_status "🎉 Your SG-CRM-V1 system is now running!"
print_status "To stop the servers, use: kill $BACKEND_PID $FRONTEND_PID"

# Keep the script running
wait
