// Quick MongoDB Playground Connection Test
// Run this to verify the MongoDB Playground is connected

// Connect to the CRM database
use('crm_estimating_db');

// Test query 1: Count total vendors
const vendorCount = db.vendors.countDocuments();
console.log(`📊 Total vendors in database: ${vendorCount}`);

// Test query 2: Get vendor names
const vendorNames = db.vendors.distinct("name");
console.log(`📋 Vendor names: ${vendorNames.join(', ')}`);

// Test query 3: Check database connection
console.log(`✅ MongoDB Playground connection test completed at ${new Date()}`);

// Display connection info
console.log(`🔗 Connected to: ${db.getName()}`);
console.log(`📂 Available collections: ${db.getCollectionNames().join(', ')}`);
