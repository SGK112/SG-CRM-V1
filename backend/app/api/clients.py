from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from app.models.client import Client, ClientCreate, ClientUpdate, ClientResponse
from app.models.user import User
from app.api.auth import get_current_active_user
from app.database import get_database

router = APIRouter()

def client_helper(client) -> dict:
    """Helper function to convert client document to dict"""
    return {
        "id": str(client["_id"]),
        "first_name": client["first_name"],
        "last_name": client["last_name"],
        "email": client["email"],
        "phone": client.get("phone"),
        "project_type": client.get("project_type"),
        "project_description": client.get("project_description"),
        "budget": client.get("budget"),
        "timeline": client.get("timeline"),
        "address": client.get("address"),
        "preferred_contact": client.get("preferred_contact"),
        "notes": client.get("notes"),
        "lead_source": client.get("lead_source"),
        "is_active": client.get("is_active", True),
        "preferred_appointment_time": client.get("preferred_appointment_time"),
        "project_status": client.get("project_status"),
        "created_at": client.get("created_at"),
        "updated_at": client.get("updated_at")
    }

@router.get("/", response_model=List[ClientResponse])
async def get_clients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None,
    project_status: Optional[str] = None,
    is_active: Optional[bool] = None,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get all clients with optional filtering"""
    filter_query = {}
    
    if search:
        filter_query["$or"] = [
            {"first_name": {"$regex": search, "$options": "i"}},
            {"last_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"project_description": {"$regex": search, "$options": "i"}}
        ]
    
    if project_status:
        filter_query["project_status"] = project_status
    
    if is_active is not None:
        filter_query["is_active"] = is_active
    
    clients = []
    async for client in db.clients.find(filter_query).skip(skip).limit(limit):
        clients.append(client_helper(client))
    
    return clients

@router.post("/", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create_client(
    client: ClientCreate,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new client"""
    # Check if client with email already exists
    existing_client = await db.clients.find_one({"email": client.email})
    if existing_client:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Client with this email already exists"
        )
    
    # Create new client
    client_dict = client.dict()
    client_dict["created_at"] = datetime.utcnow()
    client_dict["updated_at"] = datetime.utcnow()
    
    result = await db.clients.insert_one(client_dict)
    created_client = await db.clients.find_one({"_id": result.inserted_id})
    
    return client_helper(created_client)

@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: str,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific client by ID"""
    if not ObjectId.is_valid(client_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid client ID"
        )
    
    client = await db.clients.find_one({"_id": ObjectId(client_id)})
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    return client_helper(client)

@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: str,
    client_update: ClientUpdate,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Update a specific client"""
    if not ObjectId.is_valid(client_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid client ID"
        )
    
    # Check if client exists
    existing_client = await db.clients.find_one({"_id": ObjectId(client_id)})
    if not existing_client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Update client
    update_data = {k: v for k, v in client_update.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.clients.update_one(
            {"_id": ObjectId(client_id)},
            {"$set": update_data}
        )
    
    updated_client = await db.clients.find_one({"_id": ObjectId(client_id)})
    return client_helper(updated_client)

@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client_id: str,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a specific client"""
    if not ObjectId.is_valid(client_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid client ID"
        )
    
    result = await db.clients.delete_one({"_id": ObjectId(client_id)})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
