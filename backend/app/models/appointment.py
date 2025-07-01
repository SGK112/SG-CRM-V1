from pydantic import BaseModel, Field
from typing import Optional
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

class Appointment(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    title: str
    description: Optional[str] = None
    appointment_type: str  # 'consultation', 'estimate', 'installation', 'follow_up'
    client_id: Optional[str] = None
    contractor_id: Optional[str] = None
    start_time: datetime
    end_time: datetime
    status: str = "scheduled"  # 'scheduled', 'completed', 'cancelled', 'rescheduled'
    location: Optional[str] = None
    notes: Optional[str] = None
    is_all_day: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class AppointmentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    appointment_type: str
    client_id: Optional[str] = None
    contractor_id: Optional[str] = None
    start_time: datetime
    end_time: datetime
    status: str = "scheduled"
    location: Optional[str] = None
    notes: Optional[str] = None
    is_all_day: bool = False

class AppointmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    appointment_type: Optional[str] = None
    client_id: Optional[str] = None
    contractor_id: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    is_all_day: Optional[bool] = None

class AppointmentResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    appointment_type: str
    client_id: Optional[str] = None
    contractor_id: Optional[str] = None
    start_time: datetime
    end_time: datetime
    status: str
    location: Optional[str] = None
    notes: Optional[str] = None
    is_all_day: bool
    created_at: datetime
    updated_at: datetime
