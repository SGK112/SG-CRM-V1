from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class Address(BaseModel):
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None

class Client(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    project_type: Optional[str] = "kitchen"
    project_description: Optional[str] = None
    budget: Optional[str] = None
    timeline: Optional[str] = None
    address: Optional[Address] = None
    preferred_contact: Optional[str] = "email"
    notes: Optional[str] = None
    lead_source: Optional[str] = None
    is_active: bool = True
    preferred_appointment_time: Optional[datetime] = None
    project_status: Optional[str] = "lead"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ClientCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    project_type: Optional[str] = "kitchen"
    project_description: Optional[str] = None
    budget: Optional[str] = None
    timeline: Optional[str] = None
    address: Optional[Address] = None
    preferred_contact: Optional[str] = "email"
    notes: Optional[str] = None
    lead_source: Optional[str] = None
    is_active: bool = True
    preferred_appointment_time: Optional[datetime] = None
    project_status: Optional[str] = "lead"

class ClientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    project_type: Optional[str] = None
    project_description: Optional[str] = None
    budget: Optional[str] = None
    timeline: Optional[str] = None
    address: Optional[Address] = None
    preferred_contact: Optional[str] = None
    notes: Optional[str] = None
    lead_source: Optional[str] = None
    is_active: Optional[bool] = None
    preferred_appointment_time: Optional[datetime] = None
    project_status: Optional[str] = None

class ClientResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    project_type: Optional[str] = None
    project_description: Optional[str] = None
    budget: Optional[str] = None
    timeline: Optional[str] = None
    address: Optional[Address] = None
    preferred_contact: Optional[str] = None
    notes: Optional[str] = None
    lead_source: Optional[str] = None
    is_active: bool = True
    preferred_appointment_time: Optional[datetime] = None
    project_status: Optional[str] = None
    created_at: datetime
    updated_at: datetime
