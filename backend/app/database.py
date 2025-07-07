from motor.motor_asyncio import AsyncIOMotorClient
from decouple import config
import logging

logger = logging.getLogger(__name__)

class Database:
    client = None
    database = None

db = Database()

class MockDatabase:
    """Mock database for development when MongoDB is not available"""
    def __init__(self):
        self.settings = MockCollection()
        self.users = MockCollection()
        self.clients = MockCollection()
        self.estimates = MockCollection()
        self.contracts = MockCollection()
        self.appointments = MockCollection()
        self.services = MockCollection()
        self.contractors = MockCollection()
        self.vendors = MockCollection()
        self.payments = MockCollection()

class MockCollection:
    """Mock collection that returns sample data for development"""
    def __init__(self):
        self.data = []
        self.counter = 1
    
    async def find_one(self, query=None):
        if query and "_id" in query:
            # First check if it's in our stored data
            for doc in self.data:
                if doc.get("_id") == query["_id"]:
                    return doc
            
            # Return sample client data for specific IDs
            return {
                "_id": query["_id"],
                "first_name": "John",
                "last_name": "Doe",
                "email": "john@example.com",
                "phone": "+1234567890",
                "project_type": "kitchen",
                "project_description": "Kitchen renovation",
                "budget": 50000,
                "timeline": "3 months",
                "address": {
                    "street": "123 Main St",
                    "city": "Anytown",
                    "state": "CA",
                    "zip_code": "12345"
                },
                "preferred_contact": "email",
                "notes": "Sample client",
                "lead_source": "website",
                "is_active": True,
                "preferred_appointment_time": "2025-01-01T09:00:00Z",
                "project_status": "lead",
                "created_at": "2025-01-01T00:00:00Z",
                "updated_at": "2025-01-01T00:00:00Z"
            }
        
        # Check for email queries (used for duplicate detection)
        if query and "email" in query:
            for doc in self.data:
                if doc.get("email") == query["email"]:
                    return doc
            # Return None if no match found (allows new records)
            return None
        
        # For other queries, return None to allow new records
        return None
    
    def find(self, query=None):
        # Return sample clients list plus any stored data as async iterator
        class AsyncIterator:
            def __init__(self, data):
                self.data = data
                self.index = 0
                self._skip_count = 0
                self._limit_count = len(data)
            
            def __aiter__(self):
                return self
            
            async def __anext__(self):
                # Apply skip and limit logic
                while self.index < self._skip_count and self.index < len(self.data):
                    self.index += 1
                
                if self.index >= len(self.data) or self.index >= (self._skip_count + self._limit_count):
                    raise StopAsyncIteration
                
                result = self.data[self.index]
                self.index += 1
                return result
            
            def skip(self, n):
                self._skip_count = n
                return self
            
            def limit(self, n):
                self._limit_count = n
                return self
        
        # Start with stored data
        data = list(self.data)
        
        # Add sample data if no stored data exists
        if not data:
            data = [{
                "_id": "sample_id_1",
                "first_name": "John",
                "last_name": "Doe",
                "email": "john@example.com",
                "phone": "+1234567890",
                "project_type": "kitchen",
                "project_description": "Kitchen renovation",
                "budget": 50000,
                "timeline": "3 months",
                "address": {
                    "street": "123 Main St",
                    "city": "Anytown",
                    "state": "CA",
                    "zip_code": "12345"
                },
                "preferred_contact": "email",
                "notes": "Sample client",
                "lead_source": "website",
                "is_active": True,
                "preferred_appointment_time": "2025-01-01T09:00:00Z",
                "project_status": "lead",
                "created_at": "2025-01-01T00:00:00Z",
                "updated_at": "2025-01-01T00:00:00Z"
            }, {
                "_id": "sample_id_2",
                "first_name": "Jane",
                "last_name": "Smith",
                "email": "jane@example.com",
                "phone": "+1987654321",
                "project_type": "bathroom",
                "project_description": "Bathroom remodel",
                "budget": 30000,
                "timeline": "2 months",
                "address": {
                    "street": "456 Oak Ave",
                    "city": "Somewhere",
                    "state": "TX",
                    "zip_code": "67890"
                },
                "preferred_contact": "phone",
                "notes": "Another sample client",
                "lead_source": "referral",
                "is_active": True,
                "preferred_appointment_time": "2025-01-01T14:00:00Z",
                "project_status": "active",
                "created_at": "2025-01-01T00:00:00Z",
                "updated_at": "2025-01-01T00:00:00Z"
            }]
        
        return AsyncIterator(data)
    
    async def insert_one(self, document):
        from datetime import datetime
        # Add timestamp and ID
        document["_id"] = f"mock_id_{self.counter}"
        if "created_at" not in document:
            document["created_at"] = datetime.utcnow()
        if "updated_at" not in document:
            document["updated_at"] = datetime.utcnow()
        self.counter += 1
        # Store the document for later retrieval
        self.data.append(document.copy())
        return type('MockResult', (), {'inserted_id': document["_id"]})()
    
    async def update_one(self, query, update):
        return type('MockResult', (), {'modified_count': 1})()
    
    async def delete_one(self, query):
        return type('MockResult', (), {'deleted_count': 1})()

async def get_database():
    """Get database connection or mock database for development"""
    if db.database is not None:
        return db.database
    
    # Return mock database for development
    logger.info("Using mock database for development")
    return MockDatabase()

async def connect_to_mongo():
    """Create database connection"""
    try:
        # Try DATABASE_URL first (MongoDB Atlas), fallback to MONGODB_URL (local)
        mongo_url = config("DATABASE_URL", default=config("MONGODB_URL", default="mongodb://localhost:27017"))
        db.client = AsyncIOMotorClient(mongo_url)
        db.database = db.client[config("DATABASE_NAME")]
        
        # Test the connection
        await db.client.admin.command('ping')
        logger.info(f"Successfully connected to MongoDB at {mongo_url}")
    except Exception as e:
        logger.warning(f"MongoDB connection failed: {e}. Using mock database for development.")
        db.database = None

async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()
        logger.info("MongoDB connection closed")
