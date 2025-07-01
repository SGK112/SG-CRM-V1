from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
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

class Certification(BaseModel):
    name: str
    issuer: Optional[str] = None
    expiry_date: Optional[datetime] = None

class Contractor(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    first_name: str
    last_name: str
    company_name: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    specialty: str
    hourly_rate: Optional[float] = None
    rating: Optional[float] = 0.0
    availability: Optional[str] = "available"
    address: Optional[Address] = None
    certifications: Optional[List[Certification]] = []
    insurance_expiry: Optional[datetime] = None
    license_number: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool = True
    is_preferred: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ContractorCreate(BaseModel):
    first_name: str
    last_name: str
    company_name: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    specialty: str
    hourly_rate: Optional[float] = None
    rating: Optional[float] = 0.0
    availability: Optional[str] = "available"
    address: Optional[Address] = None
    certifications: Optional[List[Certification]] = []
    insurance_expiry: Optional[datetime] = None
    license_number: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool = True
    is_preferred: bool = False

class ContractorUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    specialty: Optional[str] = None
    hourly_rate: Optional[float] = None
    rating: Optional[float] = None
    availability: Optional[str] = None
    address: Optional[Address] = None
    certifications: Optional[List[Certification]] = None
    insurance_expiry: Optional[datetime] = None
    license_number: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None
    is_preferred: Optional[bool] = None

class ContractorResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    company_name: Optional[str] = None
    email: str
    phone: Optional[str] = None
    specialty: str
    hourly_rate: Optional[float] = None
    rating: Optional[float] = None
    availability: Optional[str] = None
    address: Optional[Address] = None
    certifications: Optional[List[Certification]] = None
    insurance_expiry: Optional[datetime] = None
    license_number: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool = True
    is_preferred: bool = False
    created_at: datetime
    updated_at: datetime
