/* global use, db */
// MongoDB Playground - SG-CRM-V1 Database Testing
// Connection: mongodb://localhost:27017
// Database: crm_estimating_db

// Select the CRM database to use (matches your .env DATABASE_NAME)
use('crm_estimating_db');

// ========================================
// 1. TEST DATABASE CONNECTION
// ========================================
console.log("🔗 Testing connection to CRM database...");
console.log("Database:", db.getName());

// ========================================
// 2. CREATE SAMPLE USERS
// ========================================
console.log("\n👤 Creating sample users...");
db.users.insertMany([
  {
    _id: new ObjectId(),
    username: "admin",
    email: "admin@company.com",
    hashed_password: "$2b$12$example_hash",
    role: "admin",
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: new ObjectId(),
    username: "demo",
    email: "demo@company.com", 
    hashed_password: "$2b$12$example_hash",
    role: "user",
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  }
]);

// ========================================
// 3. CREATE SAMPLE CLIENTS
// ========================================
console.log("\n🏢 Creating sample clients...");
db.clients.insertMany([
  {
    _id: new ObjectId(),
    name: "John Smith",
    email: "john@example.com",
    phone: "+1234567890",
    address: {
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zip: "12345"
    },
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: new ObjectId(),
    name: "Jane Doe Corporation",
    email: "info@janedoe.com",
    phone: "+1987654321",
    address: {
      street: "456 Business Ave",
      city: "Commerce City",
      state: "NY", 
      zip: "67890"
    },
    created_at: new Date(),
    updated_at: new Date()
  }
]);

// ========================================
// 4. CREATE SAMPLE SERVICES
// ========================================
console.log("\n🔧 Creating sample services...");
db.services.insertMany([
  {
    _id: new ObjectId(),
    name: "Granite Countertop Installation",
    description: "Premium granite countertop installation with professional finish",
    base_price: 85.00,
    unit: "sq_ft",
    category: "countertops",
    is_active: true,
    created_at: new Date()
  },
  {
    _id: new ObjectId(),
    name: "Quartz Countertop Installation", 
    description: "High-quality quartz countertop installation",
    base_price: 95.00,
    unit: "sq_ft",
    category: "countertops",
    is_active: true,
    created_at: new Date()
  },
  {
    _id: new ObjectId(),
    name: "Kitchen Cabinet Refacing",
    description: "Complete kitchen cabinet refacing service",
    base_price: 150.00,
    unit: "linear_ft",
    category: "cabinets",
    is_active: true,
    created_at: new Date()
  }
]);

// ========================================
// 5. CREATE SAMPLE ESTIMATES
// ========================================
console.log("\n📋 Creating sample estimates...");
const clientId = db.clients.findOne({name: "John Smith"})._id;
const serviceId = db.services.findOne({name: "Granite Countertop Installation"})._id;

db.estimates.insertMany([
  {
    _id: new ObjectId(),
    estimate_number: "EST-2025-001",
    client_id: clientId,
    title: "Kitchen Granite Countertops",
    description: "Complete kitchen granite countertop installation",
    status: "pending",
    total_amount: 2550.00,
    items: [
      {
        service_id: serviceId,
        description: "Granite countertop installation",
        quantity: 30,
        unit_price: 85.00,
        total: 2550.00
      }
    ],
    valid_until: new Date(new Date().setDate(new Date().getDate() + 30)),
    created_at: new Date(),
    updated_at: new Date()
  }
]);

// ========================================
// 6. TEST QUERIES
// ========================================
console.log("\n📊 Running test queries...");

// Count documents in each collection
const collections = ['users', 'clients', 'services', 'estimates', 'contractors', 'appointments'];
collections.forEach(collection => {
  const count = db.getCollection(collection).countDocuments();
  console.log(`${collection}: ${count} documents`);
});

// Find all active services with pricing
console.log("\n💰 Active Services:");
db.services.find({is_active: true}, {name: 1, base_price: 1, unit: 1}).forEach(
  service => console.log(`- ${service.name}: $${service.base_price}/${service.unit}`)
);

// Find pending estimates
console.log("\n📋 Pending Estimates:");
db.estimates.find({status: "pending"}, {estimate_number: 1, title: 1, total_amount: 1}).forEach(
  estimate => console.log(`- ${estimate.estimate_number}: ${estimate.title} - $${estimate.total_amount}`)
);

console.log("\n✅ CRM Database test completed successfully!");

// ========================================
// 7. CLEANUP (Uncomment to reset database)
// ========================================
// console.log("\n🧹 Cleaning up test data...");
// db.users.deleteMany({});
// db.clients.deleteMany({});
// db.services.deleteMany({});
// db.estimates.deleteMany({});
// console.log("✅ Cleanup completed!");
