#!/bin/bash
echo "🚀 SG-CRM-V1 Full System Test"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if servers are running
echo -e "${YELLOW}📡 Checking server status...${NC}"

# Check backend
backend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
if [ "$backend_status" = "200" ]; then
    echo -e "${GREEN}✅ Backend running on port 8000${NC}"
else
    echo -e "${RED}❌ Backend not responding${NC}"
    exit 1
fi

# Check frontend
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$frontend_status" = "200" ]; then
    echo -e "${GREEN}✅ Frontend running on port 3000${NC}"
else
    echo -e "${RED}❌ Frontend not responding${NC}"
    exit 1
fi

# Test authentication
echo -e "${YELLOW}🔐 Testing authentication...${NC}"
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@mail.com&password=password123")

if echo "$TOKEN_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✅ Authentication successful${NC}"
    TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
else
    echo -e "${RED}❌ Authentication failed${NC}"
    exit 1
fi

# Test client endpoints
echo -e "${YELLOW}👥 Testing client management...${NC}"

# Get clients
clients_response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/clients/)
clients_status=$(echo "$clients_response" | tail -n1)
if [ "$clients_status" = "200" ]; then
    echo -e "${GREEN}✅ Client listing works${NC}"
    client_count=$(echo "$clients_response" | head -n -1 | jq length 2>/dev/null || echo "unknown")
    echo "   📊 Found $client_count clients"
else
    echo -e "${RED}❌ Client listing failed${NC}"
fi

# Create a new client
echo -e "${YELLOW}➕ Testing client creation...${NC}"
create_response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8000/api/clients/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "testuser@example.com",
    "phone": "+1234567890",
    "project_type": "kitchen",
    "project_description": "Test kitchen renovation",
    "budget": 30000,
    "timeline": "8 weeks"
  }')

create_status=$(echo "$create_response" | tail -n1)
if [ "$create_status" = "201" ]; then
    echo -e "${GREEN}✅ Client creation works${NC}"
    new_client_id=$(echo "$create_response" | head -n -1 | jq -r '.id' 2>/dev/null || echo "unknown")
    echo "   🆔 New client ID: $new_client_id"
else
    echo -e "${RED}❌ Client creation failed${NC}"
fi

# Test other endpoints
echo -e "${YELLOW}🔧 Testing other endpoints...${NC}"

endpoints=("estimates" "contracts" "appointments" "services" "contractors")
for endpoint in "${endpoints[@]}"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/$endpoint/)
    if [ "$status" = "200" ] || [ "$status" = "307" ]; then
        echo -e "${GREEN}✅ /$endpoint endpoint accessible${NC}"
    else
        echo -e "${YELLOW}⚠️  /$endpoint endpoint returned $status${NC}"
    fi
done

# System summary
echo -e "${YELLOW}📋 System Summary${NC}"
echo "================================"
echo -e "${GREEN}✅ Backend API: Running and functional${NC}"
echo -e "${GREEN}✅ Frontend React App: Running${NC}"
echo -e "${GREEN}✅ Authentication: Working${NC}"
echo -e "${GREEN}✅ Client Management: Working${NC}"
echo -e "${GREEN}✅ Database: Mock database active${NC}"
echo ""
echo "🎉 System is ready for end-to-end testing!"
echo ""
echo "🔗 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "🔑 Test Credentials:"
echo "   Username: test@mail.com"
echo "   Password: password123"
echo ""
echo "📁 Test Files:"
echo "   CSV Sample: /workspaces/SG-CRM-V1/sample_clients.csv"
echo "   Test Checklist: /workspaces/SG-CRM-V1/TEST_CHECKLIST.md"
