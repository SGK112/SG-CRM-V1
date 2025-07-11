// Sample script to add demo clients to localStorage
// This can be run in the browser console to add sample data

const sampleClients = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '555-123-4567',
    projectType: 'kitchen',
    budget: 35000,
    address: '123 Main St, Phoenix, AZ 85001',
    projectDescription: 'Complete kitchen renovation with granite countertops and custom cabinetry',
    timeline: '2-3 months',
    leadSource: 'website',
    notes: 'Prefers dark granite, interested in farmhouse style',
    createdAt: new Date().toISOString(),
    status: 'lead'
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '555-987-6543',
    projectType: 'bathroom',
    budget: 18000,
    address: '456 Oak Ave, Surprise, AZ 85374',
    projectDescription: 'Master bathroom remodel with quartz countertops',
    timeline: '1-2 months',
    leadSource: 'referral',
    notes: 'Referred by previous client, looking for modern design',
    createdAt: new Date().toISOString(),
    status: 'lead'
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Davis',
    email: 'mike.davis@email.com',
    phone: '555-456-7890',
    projectType: 'commercial',
    budget: 75000,
    address: '789 Business Blvd, Scottsdale, AZ 85260',
    projectDescription: 'Restaurant kitchen renovation with commercial-grade surfaces',
    timeline: '3-4 months',
    leadSource: 'google',
    notes: 'High-end commercial project, needs heat-resistant materials',
    createdAt: new Date().toISOString(),
    status: 'lead'
  },
  {
    id: '4',
    firstName: 'Emily',
    lastName: 'Wilson',
    email: 'emily.wilson@email.com',
    phone: '555-321-0987',
    projectType: 'outdoor',
    budget: 12000,
    address: '321 Desert View Dr, Glendale, AZ 85308',
    projectDescription: 'Outdoor kitchen with granite countertops and bar area',
    timeline: '6-8 weeks',
    leadSource: 'instagram',
    notes: 'Wants weather-resistant materials, contemporary style',
    createdAt: new Date().toISOString(),
    status: 'lead'
  },
  {
    id: '5',
    firstName: 'Robert',
    lastName: 'Brown',
    email: 'robert.brown@email.com',
    phone: '555-654-3210',
    projectType: 'countertops',
    budget: 8500,
    address: '654 Sunset Rd, Peoria, AZ 85345',
    projectDescription: 'Kitchen countertop replacement only',
    timeline: '2-3 weeks',
    leadSource: 'yelp',
    notes: 'Quick turnaround needed, budget-conscious',
    createdAt: new Date().toISOString(),
    status: 'lead'
  }
];

// Add to localStorage
localStorage.setItem('sg-crm-clients', JSON.stringify(sampleClients));

console.log('Sample clients added to localStorage!');
console.log('Refresh the page to see the sample data.');
