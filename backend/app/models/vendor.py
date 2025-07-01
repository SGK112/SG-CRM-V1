from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
from .user import PyObjectId

class ContactInfo(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    position: Optional[str] = None

class Address(BaseModel):
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = "USA"

class PricingInfo(BaseModel):
    item_name: str
    category: Optional[str] = None
    unit: Optional[str] = None
    price: float
    min_quantity: Optional[int] = 1
    max_quantity: Optional[int] = None
    description: Optional[str] = None

class Vendor(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    name: str
    company_name: Optional[str] = None
    category: Optional[str] = None
    specialties: List[str] = []
    contact_info: ContactInfo = ContactInfo()
    address: Address = Address()
    pricing: List[PricingInfo] = []
    rating: Optional[float] = None
    notes: Optional[str] = None
    documents: List[str] = []  # Cloudinary URLs
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[PyObjectId] = None

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class VendorCreate(BaseModel):
    name: str
    company_name: Optional[str] = None
    category: Optional[str] = None
    specialties: List[str] = []
    contact_info: ContactInfo = ContactInfo()
    address: Address = Address()
    pricing: List[PricingInfo] = []
    rating: Optional[float] = None
    notes: Optional[str] = None

class VendorUpdate(BaseModel):
    name: Optional[str] = None
    company_name: Optional[str] = None
    category: Optional[str] = None
    specialties: Optional[List[str]] = None
    contact_info: Optional[ContactInfo] = None
    address: Optional[Address] = None
    pricing: Optional[List[PricingInfo]] = None
    rating: Optional[float] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None

class VendorResponse(BaseModel):
    id: str
    name: str
    company_name: Optional[str] = None
    category: Optional[str] = None
    specialties: List[str] = []
    contact_info: ContactInfo
    address: Address
    pricing: List[PricingInfo] = []
    rating: Optional[float] = None
    notes: Optional[str] = None
    documents: List[str] = []
    is_active: bool
    created_at: datetime
    updated_at: datetime
