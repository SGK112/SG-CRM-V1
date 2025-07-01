#!/usr/bin/env python3
"""
Script to create a test user in the CRM database
Run this to create a user you can log in with
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime
from decouple import config

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_test_user():
    """Create a test user in the database"""
    
    # Database connection
    try:
        DATABASE_URL = config("DATABASE_URL", default="mongodb://localhost:27017")
        DATABASE_NAME = config("DATABASE_NAME", default="crm_estimating_db")
        
        client = AsyncIOMotorClient(DATABASE_URL)
        db = client[DATABASE_NAME]
        
        # Test connection
        await client.admin.command('ping')
        print("✅ Connected to MongoDB successfully")
        
        # Check if user already exists
        existing_user = await db.users.find_one({"username": "admin"})
        if existing_user:
            print("❌ User 'admin' already exists!")
            return
        
        # Create test user
        test_user = {
            "email": "admin@surprisegranite.com",
            "username": "admin",
            "hashed_password": pwd_context.hash("password123"),
            "full_name": "Admin User",
            "is_active": True,
            "is_admin": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert user
        result = await db.users.insert_one(test_user)
        print(f"✅ Test user created successfully!")
        print(f"   ID: {result.inserted_id}")
        print(f"   Username: admin")
        print(f"   Email: admin@surprisegranite.com")
        print(f"   Password: password123")
        print(f"   Is Admin: True")
        
        # Close connection
        client.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(create_test_user())
