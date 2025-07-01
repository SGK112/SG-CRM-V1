from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from app.models.appointment import Appointment, AppointmentCreate, AppointmentUpdate, AppointmentResponse
from app.models.user import User
from app.api.auth import get_current_active_user
from app.database import get_database

router = APIRouter()

def appointment_helper(appointment) -> dict:
    """Helper function to convert appointment document to dict"""
    return {
        "id": str(appointment["_id"]),
        "title": appointment["title"],
        "description": appointment.get("description"),
        "appointment_type": appointment["appointment_type"],
        "client_id": appointment.get("client_id"),
        "contractor_id": appointment.get("contractor_id"),
        "start_time": appointment["start_time"],
        "end_time": appointment["end_time"],
        "status": appointment.get("status", "scheduled"),
        "location": appointment.get("location"),
        "notes": appointment.get("notes"),
        "is_all_day": appointment.get("is_all_day", False),
        "created_at": appointment.get("created_at"),
        "updated_at": appointment.get("updated_at")
    }

@router.get("/", response_model=List[AppointmentResponse])
async def get_appointments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None,
    appointment_type: Optional[str] = None,
    status: Optional[str] = None,
    client_id: Optional[str] = None,
    contractor_id: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get all appointments with optional filtering"""
    filter_query = {}
    
    if search:
        filter_query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"location": {"$regex": search, "$options": "i"}}
        ]
    
    if appointment_type:
        filter_query["appointment_type"] = appointment_type
    
    if status:
        filter_query["status"] = status
    
    if client_id:
        filter_query["client_id"] = client_id
    
    if contractor_id:
        filter_query["contractor_id"] = contractor_id
    
    if start_date or end_date:
        date_filter = {}
        if start_date:
            date_filter["$gte"] = start_date
        if end_date:
            date_filter["$lte"] = end_date
        filter_query["start_time"] = date_filter
    
    appointments = []
    async for appointment in db.appointments.find(filter_query).skip(skip).limit(limit):
        appointments.append(appointment_helper(appointment))
    
    return appointments

@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    appointment: AppointmentCreate,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new appointment"""
    # Create new appointment
    appointment_dict = appointment.dict()
    appointment_dict["created_at"] = datetime.utcnow()
    appointment_dict["updated_at"] = datetime.utcnow()
    
    result = await db.appointments.insert_one(appointment_dict)
    created_appointment = await db.appointments.find_one({"_id": result.inserted_id})
    
    return appointment_helper(created_appointment)

@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: str,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific appointment by ID"""
    if not ObjectId.is_valid(appointment_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid appointment ID"
        )
    
    appointment = await db.appointments.find_one({"_id": ObjectId(appointment_id)})
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    return appointment_helper(appointment)

@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: str,
    appointment_update: AppointmentUpdate,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Update a specific appointment"""
    if not ObjectId.is_valid(appointment_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid appointment ID"
        )
    
    # Check if appointment exists
    existing_appointment = await db.appointments.find_one({"_id": ObjectId(appointment_id)})
    if not existing_appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Update appointment
    update_data = {k: v for k, v in appointment_update.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.appointments.update_one(
            {"_id": ObjectId(appointment_id)},
            {"$set": update_data}
        )
    
    updated_appointment = await db.appointments.find_one({"_id": ObjectId(appointment_id)})
    return appointment_helper(updated_appointment)

@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_appointment(
    appointment_id: str,
    db = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a specific appointment"""
    if not ObjectId.is_valid(appointment_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid appointment ID"
        )
    
    result = await db.appointments.delete_one({"_id": ObjectId(appointment_id)})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
