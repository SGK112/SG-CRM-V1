#!/bin/bash

# CRM & Estimating Application Setup Script
echo "🚀 Setting up CRM & Estimating Application..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  Warning: MongoDB doesn't appear to be running."
    echo "   Please start MongoDB before running the application."
fi

echo "✅ Prerequisites check passed!"

# Backend Setup
echo ""
echo "🔧 Setting up Backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your actual configuration values"
fi

echo "✅ Backend setup complete!"

# Frontend Setup
echo ""
echo "🎨 Setting up Frontend..."
cd ../frontend

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating frontend .env file..."
    cat > .env << EOF
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
EOF
    echo "⚠️  Please edit frontend/.env with your actual Stripe publishable key"
fi

echo "✅ Frontend setup complete!"

# Create start scripts
echo ""
echo "📝 Creating start scripts..."
cd ..

# Backend start script
cat > start_backend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Backend Server..."
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
EOF

# Frontend start script
cat > start_frontend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Frontend Server..."
cd frontend
npm start
EOF

# Make scripts executable
chmod +x start_backend.sh
chmod +x start_frontend.sh

# Create development start script
cat > start_dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Development Environment..."

# Start backend in background
echo "Starting backend server..."
./start_backend.sh &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "Starting frontend server..."
./start_frontend.sh &
FRONTEND_PID=$!

# Wait for user to stop
echo ""
echo "✅ Development servers started!"
echo "📚 API Documentation: http://localhost:8000/docs"
echo "🌐 Frontend Application: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers..."

# Handle Ctrl+C
trap 'echo "Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID; exit' INT

# Wait for processes
wait
EOF

chmod +x start_dev.sh

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Configure your environment variables:"
echo "   - Edit backend/.env with your MongoDB, Stripe, Cloudinary, and email settings"
echo "   - Edit frontend/.env with your Stripe publishable key"
echo ""
echo "2. Start MongoDB if not already running"
echo ""
echo "3. Load sample data (optional):"
echo "   cd backend && python load_csv_data.py"
echo ""
echo "4. Start the development environment:"
echo "   ./start_dev.sh"
echo ""
echo "🔗 Useful URLs:"
echo "   • API Documentation: http://localhost:8000/docs"
echo "   • Frontend App: http://localhost:3000"
echo "   • API Health Check: http://localhost:8000/health"
echo ""
echo "📖 For detailed instructions, see README.md"
