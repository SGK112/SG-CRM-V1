from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from app.models.contractor import Contractor, ContractorCreate, ContractorUpdate, ContractorResponse
from app.models.user import User
from app.api.auth import get_current_active_user
from app.database import get_database

router = APIRouter()

def contractor_helper(contractor) -> dict:
    """Helper function to convert contractor document to dict"""
    return {
        "id": str(contractor["_id"]),
        "first_name": contractor["first_name"],
        "last_name": contractor["last_name"],
        "company_name": contractor.get("company_name"),
        "email": contractor["email"],
        "phone": contractor.get("phone"),
        "specialty": contractor["specialty"],
        "hourly_rate": contractor.get("hourly_rate"),
        "rating": contractor.get("rating", 0.0),
        "availability": contractor.get("availability"),
        "address": contractor.get("address"),
        "certifications": contractor.get("certifications", []),
        "insurance_expiry": contractor.get("insurance_expiry"),
        "license_number": contractor.get("license_number"),
        "notes": contractor.get("notes"),
        "is_active": contractor.get("is_active", True),
        "is_preferred": contractor.get("is_preferred", False),
        "created_at": contractor.get("created_at"),
        "updated_at": contractor.get("updated_at")
    }

@router.get("/", response_model=List[ContractorResponse])
async def get_contractors(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None,
    specialty: Optional[str] = None,
    availability: Optional[str] = None,
    is_active: Optional[bool] = None,
    is_preferred: Optional[bool] = None,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get all contractors with optional filtering"""
    filter_query = {}
    
    if search:
        filter_query["$or"] = [
            {"first_name": {"$regex": search, "$options": "i"}},
            {"last_name": {"$regex": search, "$options": "i"}},
            {"company_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"specialty": {"$regex": search, "$options": "i"}}
        ]
    
    if specialty:
        filter_query["specialty"] = {"$regex": specialty, "$options": "i"}
    
    if availability:
        filter_query["availability"] = availability
    
    if is_active is not None:
        filter_query["is_active"] = is_active
    
    if is_preferred is not None:
        filter_query["is_preferred"] = is_preferred
    
    contractors = []
    async for contractor in db.contractors.find(filter_query).skip(skip).limit(limit):
        contractors.append(contractor_helper(contractor))
    
    return contractors

@router.post("/", response_model=ContractorResponse, status_code=status.HTTP_201_CREATED)
async def create_contractor(
    contractor: ContractorCreate,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new contractor"""
    # Check if contractor with email already exists
    existing_contractor = await db.contractors.find_one({"email": contractor.email})
    if existing_contractor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contractor with this email already exists"
        )
    
    # Create new contractor
    contractor_dict = contractor.dict()
    contractor_dict["created_at"] = datetime.utcnow()
    contractor_dict["updated_at"] = datetime.utcnow()
    
    result = await db.contractors.insert_one(contractor_dict)
    created_contractor = await db.contractors.find_one({"_id": result.inserted_id})
    
    return contractor_helper(created_contractor)

@router.get("/{contractor_id}", response_model=ContractorResponse)
async def get_contractor(
    contractor_id: str,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific contractor by ID"""
    if not ObjectId.is_valid(contractor_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid contractor ID"
        )
    
    contractor = await db.contractors.find_one({"_id": ObjectId(contractor_id)})
    if not contractor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contractor not found"
        )
    
    return contractor_helper(contractor)

@router.put("/{contractor_id}", response_model=ContractorResponse)
async def update_contractor(
    contractor_id: str,
    contractor_update: ContractorUpdate,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Update a specific contractor"""
    if not ObjectId.is_valid(contractor_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid contractor ID"
        )
    
    # Check if contractor exists
    existing_contractor = await db.contractors.find_one({"_id": ObjectId(contractor_id)})
    if not existing_contractor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contractor not found"
        )
    
    # Update contractor
    update_data = {k: v for k, v in contractor_update.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.contractors.update_one(
            {"_id": ObjectId(contractor_id)},
            {"$set": update_data}
        )
    
    updated_contractor = await db.contractors.find_one({"_id": ObjectId(contractor_id)})
    return contractor_helper(updated_contractor)

@router.delete("/{contractor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contractor(
    contractor_id: str,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a specific contractor"""
    if not ObjectId.is_valid(contractor_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid contractor ID"
        )
    
    result = await db.contractors.delete_one({"_id": ObjectId(contractor_id)})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contractor not found"
        )
