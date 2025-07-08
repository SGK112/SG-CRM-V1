#!/bin/bash

# Test script to verify add client functionality
echo "Testing CRM Add Client Functionality"
echo "====================================="

# Test 1: Check if backend is running
echo "1. Testing backend connection..."
BACKEND_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:8000/)
if [[ $BACKEND_RESPONSE == *"200"* ]]; then
    echo "✅ Backend is running"
else
    echo "❌ Backend not responding"
    exit 1
fi

# Test 2: Test client creation endpoint
echo "2. Testing client creation endpoint..."
CLIENT_DATA='{
    "first_name": "Test",
    "last_name": "Client",
    "email": "test@example.com",
    "phone": "+1234567890",
    "project_type": "kitchen",
    "project_description": "Test kitchen renovation",
    "budget": 50000,
    "timeline": "3 months",
    "address": {
        "street": "123 Test St",
        "city": "Test City",
        "state": "CA",
        "zip_code": "12345"
    },
    "preferred_contact": "email",
    "notes": "Test client for functionality verification",
    "lead_source": "website",
    "is_active": true,
    "preferred_appointment_time": "morning",
    "project_status": "lead"
}'

RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$CLIENT_DATA" \
    http://localhost:8000/api/clients)

if [[ $RESPONSE == *"id"* ]]; then
    echo "✅ Client creation endpoint working"
else
    echo "❌ Client creation failed: $RESPONSE"
fi

# Test 3: Test getting clients
echo "3. Testing client retrieval..."
CLIENTS_RESPONSE=$(curl -s http://localhost:8000/api/clients)
if [[ $CLIENTS_RESPONSE == *"["* ]]; then
    echo "✅ Client retrieval working"
else
    echo "❌ Client retrieval failed"
fi

echo "====================================="
echo "Test completed!"
