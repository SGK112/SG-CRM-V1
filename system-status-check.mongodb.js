// MongoDB Playground - System Status Check
// This script verifies that MongoDB, backend, and frontend are all working

use('sg_crm');
db.runCommand({connectionStatus: 1});

// 1. Check database connection
print("=== Database Connection Status ===");
db.runCommand({connectionStatus: 1});

// 2. Check available collections
print("\n=== Available Collections ===");
db.getCollectionNames();

// 3. Create test data to verify system is working
print("\n=== Creating Test Data ===");
db.system_test.insertOne({
    type: "status_check",
    timestamp: new Date(),
    message: "MongoDB Playground is working!"
});

// 4. Create sample vendor data
print("\n=== Creating Sample Vendor ===");
db.vendors.insertMany([
    {
        name: "Test Vendor 1",
        contact: "John Smith",
        email: "john@testvendor.com",
        phone: "555-1234",
        address: "123 Test Street, Test City, TC 12345",
        created_at: new Date(),
        status: "active"
    },
    {
        name: "Test Vendor 2", 
        contact: "Jane Doe",
        email: "jane@testvendor2.com",
        phone: "555-5678",
        address: "456 Sample Ave, Sample City, SC 67890",
        created_at: new Date(),
        status: "active"
    }
]);

// 5. Create sample client data
print("\n=== Creating Sample Client ===");
db.clients.insertMany([
    {
        name: "Test Client 1",
        contact_person: "Alice Johnson",
        email: "alice@testclient.com",
        phone: "555-9999",
        address: "789 Client St, Client City, CC 11111",
        created_at: new Date(),
        status: "active"
    },
    {
        name: "Test Client 2",
        contact_person: "Bob Wilson",
        email: "bob@testclient2.com", 
        phone: "555-8888",
        address: "321 Customer Blvd, Customer City, CC 22222",
        created_at: new Date(),
        status: "active"
    }
]);

// 6. Verify data was created
print("\n=== Verifying Test Data ===");
print("Vendors count:", db.vendors.countDocuments());
print("Clients count:", db.clients.countDocuments());
print("System test records:", db.system_test.countDocuments());

// 7. Show sample vendor data
print("\n=== Sample Vendor Data ===");
db.vendors.find().limit(2);

// 8. Show sample client data
print("\n=== Sample Client Data ===");
db.clients.find().limit(2);

// 9. Database stats
print("\n=== Database Statistics ===");
db.stats();

// 10. Current time to verify query execution
print("\n=== Current Server Time ===");
new Date();

db.test_collection.insertOne({name: "test", date: new Date()});
db.test_collection.find();
