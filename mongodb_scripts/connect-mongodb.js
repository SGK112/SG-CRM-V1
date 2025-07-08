// MongoDB Connection Script for VS Code
// Use this to connect to your local MongoDB instance

// Connection Details:
// Host: localhost
// Port: 27017
// Database: crm_estimating_db
// Connection String: mongodb://localhost:27017

// To connect in VS Code:
// 1. Open MongoDB extension (leaf icon in sidebar)
// 2. Click "Add Connection" or "+"
// 3. Enter: mongodb://localhost:27017
// 4. Click "Connect"

// Test the connection
const { MongoClient } = require('mongodb');

async function testConnection() {
    const uri = 'mongodb://localhost:27017';
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB successfully!');
        
        const db = client.db('crm_estimating_db');
        const collections = await db.listCollections().toArray();
        
        console.log('📂 Available collections:');
        collections.forEach(col => console.log(`  - ${col.name}`));
        
        return true;
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        return false;
    } finally {
        await client.close();
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testConnection();
}

module.exports = { testConnection };
