#!/bin/bash

# MongoDB Connection Test Script

echo "🔍 Testing MongoDB Connection..."

# Check if MongoDB is running
if pgrep mongod > /dev/null; then
    echo "✅ MongoDB process is running"
else
    echo "❌ MongoDB process is not running"
    echo "💡 You can start MongoDB with: mongod --dbpath /tmp/mongodb-data"
fi

# Test connection using Python
echo "🐍 Testing Python MongoDB connection..."

cd backend

# Check if virtual environment exists
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "✅ Virtual environment activated"
else
    echo "❌ Virtual environment not found. Run the setup script first."
    exit 1
fi

# Test connection
python3 -c "
import sys
try:
    from pymongo import MongoClient
    client = MongoClient('mongodb://localhost:27017')
    # Test the connection
    client.admin.command('ping')
    print('✅ MongoDB connection successful!')
    
    # List databases
    db_list = client.list_database_names()
    print(f'📂 Available databases: {db_list}')
    
    # Test CRM database
    db = client['crm_estimating_db']
    collections = db.list_collection_names()
    print(f'📋 Collections in CRM database: {collections}')
    
except Exception as e:
    print(f'❌ MongoDB connection failed: {e}')
    print('💡 Make sure MongoDB is running on localhost:27017')
    sys.exit(1)
"

echo "🔗 MongoDB connection test completed!"
