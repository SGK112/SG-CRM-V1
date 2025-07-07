from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from ..models.service import Service, ServiceCreate, ServiceUpdate, ServiceResponse
from ..models.user import User
from .auth import get_current_active_user
from ..database import get_database

router = APIRouter()

def service_helper(service) -> dict:
    """Helper function to convert service document to dict"""
    return {
        "id": str(service["_id"]),
        "name": service["name"],
        "description": service.get("description"),
        "category": service["category"],
        "base_price": service.get("base_price"),
        "unit": service.get("unit", "each"),
        "estimated_duration": service.get("estimated_duration"),
        "is_active": service.get("is_active", True),
        "created_at": service.get("created_at"),
        "updated_at": service.get("updated_at")
    }

@router.get("/", response_model=List[ServiceResponse])
async def get_services(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None,
    category: Optional[str] = None,
    is_active: Optional[bool] = None,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get all services with optional filtering"""
    filter_query = {}
    
    if search:
        filter_query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}}
        ]
    
    if category:
        filter_query["category"] = {"$regex": category, "$options": "i"}
    
    if is_active is not None:
        filter_query["is_active"] = is_active
    
    services = []
    async for service in db.services.find(filter_query).skip(skip).limit(limit):
        services.append(service_helper(service))
    
    return services

@router.post("/", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_service(
    service: ServiceCreate,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new service"""
    # Check if service with name already exists
    existing_service = await db.services.find_one({"name": service.name})
    if existing_service:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Service with this name already exists"
        )
    
    # Create new service
    service_dict = service.dict()
    service_dict["created_at"] = datetime.utcnow()
    service_dict["updated_at"] = datetime.utcnow()
    
    result = await db.services.insert_one(service_dict)
    created_service = await db.services.find_one({"_id": result.inserted_id})
    
    return service_helper(created_service)

@router.get("/{service_id}", response_model=ServiceResponse)
async def get_service(
    service_id: str,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific service by ID"""
    if not ObjectId.is_valid(service_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid service ID"
        )
    
    service = await db.services.find_one({"_id": ObjectId(service_id)})
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    return service_helper(service)

@router.put("/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: str,
    service_update: ServiceUpdate,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Update a specific service"""
    if not ObjectId.is_valid(service_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid service ID"
        )
    
    # Check if service exists
    existing_service = await db.services.find_one({"_id": ObjectId(service_id)})
    if not existing_service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    # Update service
    update_data = {k: v for k, v in service_update.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.services.update_one(
            {"_id": ObjectId(service_id)},
            {"$set": update_data}
        )
    
    updated_service = await db.services.find_one({"_id": ObjectId(service_id)})
    return service_helper(updated_service)

@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: str,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a specific service"""
    if not ObjectId.is_valid(service_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid service ID"
        )
    
    result = await db.services.delete_one({"_id": ObjectId(service_id)})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
