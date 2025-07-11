// Test script to verify client functionality
// Run this in browser console to test the client management

// Test 1: Check if localStorage is working
console.log('Test 1: Checking localStorage...');
const clients = localStorage.getItem('sg-crm-clients');
console.log('Clients in localStorage:', clients ? JSON.parse(clients) : 'No clients found');

// Test 2: Add a test client
console.log('\nTest 2: Adding a test client...');
const testClient = {
  id: 'test-' + Date.now(),
  firstName: 'Test',
  lastName: 'Client',
  email: 'test@example.com',
  phone: '555-TEST-123',
  projectType: 'kitchen',
  budget: 50000,
  address: '123 Test St, Test City, TS 12345',
  projectDescription: 'Test project description',
  timeline: '1-2 months',
  leadSource: 'test',
  notes: 'This is a test client',
  createdAt: new Date().toISOString(),
  status: 'lead'
};

const existingClients = JSON.parse(localStorage.getItem('sg-crm-clients') || '[]');
existingClients.push(testClient);
localStorage.setItem('sg-crm-clients', JSON.stringify(existingClients));

console.log('Test client added successfully!');
console.log('Updated clients count:', existingClients.length);

// Test 3: Verify the client was added
console.log('\nTest 3: Verifying client was added...');
const updatedClients = JSON.parse(localStorage.getItem('sg-crm-clients') || '[]');
const foundTestClient = updatedClients.find(c => c.id === testClient.id);
console.log('Test client found:', foundTestClient ? 'YES' : 'NO');

console.log('\n✅ All tests completed! Refresh the page to see the updated client list.');
