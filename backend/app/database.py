from motor.motor_asyncio import AsyncIOMotorClient
from decouple import config
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    database = None

db = Database()

async def get_database() -> AsyncIOMotorClient:
    return db.database

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
        logger.error(f"Error connecting to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()
        logger.info("MongoDB connection closed")
