// MongoDB Playground for SG-CRM-V1 Vendor Data
// Use this file to explore and query your vendor data

// Switch to the CRM database
use('crm_estimating_db');

// Query 1: Count all vendors
db.vendors.countDocuments();

// Query 2: Find all unique vendor names
db.vendors.distinct("name");

// Query 3: Find vendors with specific business types
db.vendors.find(
  { "business_type": "Countertop Supplier" },
  { name: 1, contact_info: 1 }
);

// Query 4: Find vendors by location (if location data exists)
db.vendors.find(
  { "address.city": { $exists: true } },
  { name: 1, address: 1 }
);

// Query 5: Find vendors with pricing information
db.vendors.find(
  { "pricing.base_price": { $exists: true } },
  { name: 1, pricing: 1 }
);

// Query 6: Search vendors by name pattern
db.vendors.find(
  { name: /stone/i },
  { name: 1, business_type: 1 }
);

// Query 7: Get vendor statistics
db.vendors.aggregate([
  {
    $group: {
      _id: "$business_type",
      count: { $sum: 1 },
      vendors: { $push: "$name" }
    }
  },
  {
    $sort: { count: -1 }
  }
]);

// Query 8: Find recently created vendors (last 30 days)
db.vendors.find(
  {
    created_at: {
      $gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000)
    }
  },
  { name: 1, created_at: 1 }
).sort({ created_at: -1 });

// Query 9: Update a vendor's contact information
// db.vendors.updateOne(
//   { name: "Arizona Tile" },
//   { 
//     $set: { 
//       "contact_info.phone": "555-0123",
//       "contact_info.email": "info@arizonatile.com" 
//     } 
//   }
// );

// Query 10: Add a new vendor
// db.vendors.insertOne({
//   name: "Example Stone Co.",
//   business_type: "Countertop Supplier",
//   contact_info: {
//     phone: "555-0199",
//     email: "contact@examplestone.com"
//   },
//   address: {
//     street: "123 Stone Ave",
//     city: "Phoenix",
//     state: "AZ",
//     zip: "85001"
//   },
//   pricing: {
//     base_price: 45.00,
//     tier: "Mid Tier"
//   },
//   created_at: new Date(),
//   updated_at: new Date()
// });
