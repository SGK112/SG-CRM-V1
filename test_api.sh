#!/bin/bash
echo "Testing SG-CRM-V1 API endpoints..."

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s -w "\nStatus: %{http_code}\n" http://localhost:8000/health

# Test login endpoint
echo -e "\n2. Testing login endpoint..."
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@mail.com&password=password123")

echo "Login response: $TOKEN_RESPONSE"

# Extract token if login successful
if echo "$TOKEN_RESPONSE" | grep -q "access_token"; then
  TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
  echo "Token extracted: ${TOKEN:0:50}..."
  
  # Test protected endpoint
  echo -e "\n3. Testing protected clients endpoint..."
  curl -s -w "\nStatus: %{http_code}\n" \
    -H "Authorization: Bearer $TOKEN" \
    http://localhost:8000/api/clients/
  
  # Test creating a client
  echo -e "\n4. Testing client creation..."
  curl -s -w "\nStatus: %{http_code}\n" \
    -X POST http://localhost:8000/api/clients/ \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "first_name": "Test",
      "last_name": "Client",
      "email": "testclient@example.com",
      "phone": "+1234567890",
      "project_type": "kitchen",
      "project_description": "Test kitchen project"
    }'
else
  echo "Login failed - no token received"
fi

echo -e "\nAPI test completed!"
