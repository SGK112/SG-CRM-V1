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
    """Mock collection that returns None for all queries"""
    async def find_one(self, query=None):
        return None
    
    async def find(self, query=None):
        return []
    
    async def insert_one(self, document):
        return type('MockResult', (), {'inserted_id': 'mock_id'})()
    
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
