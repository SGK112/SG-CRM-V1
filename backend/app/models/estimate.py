from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from bson import ObjectId
from .user import PyObjectId
from .vendor import Address

class EstimateStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    VIEWED = "viewed"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"

class LineItem(BaseModel):
    description: str
    quantity: float
    unit: Optional[str] = None
    unit_price: float
    total: float
    vendor_id: Optional[PyObjectId] = None
    vendor_name: Optional[str] = None

class Estimate(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    estimate_number: str
    title: str
    client_name: str
    client_email: str
    client_phone: Optional[str] = None
    client_address: Optional[Address] = None
    line_items: List[LineItem] = []
    subtotal: float = 0.0
    tax_rate: float = 0.0
    tax_amount: float = 0.0
    total: float = 0.0
    notes: Optional[str] = None
    terms: Optional[str] = None
    status: EstimateStatus = EstimateStatus.DRAFT
    valid_until: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[PyObjectId] = None
    pdf_url: Optional[str] = None

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class EstimateCreate(BaseModel):
    title: str
    client_name: str
    client_email: str
    client_phone: Optional[str] = None
    client_address: Optional[Address] = None
    line_items: List[LineItem] = []
    tax_rate: float = 0.0
    notes: Optional[str] = None
    terms: Optional[str] = None
    valid_until: Optional[datetime] = None

class EstimateUpdate(BaseModel):
    title: Optional[str] = None
    client_name: Optional[str] = None
    client_email: Optional[str] = None
    client_phone: Optional[str] = None
    client_address: Optional[Address] = None
    line_items: Optional[List[LineItem]] = None
    tax_rate: Optional[float] = None
    notes: Optional[str] = None
    terms: Optional[str] = None
    status: Optional[EstimateStatus] = None
    valid_until: Optional[datetime] = None

class EstimateResponse(BaseModel):
    id: str
    estimate_number: str
    title: str
    client_name: str
    client_email: str
    client_phone: Optional[str] = None
    client_address: Optional[Address] = None
    line_items: List[LineItem] = []
    subtotal: float
    tax_rate: float
    tax_amount: float
    total: float
    notes: Optional[str] = None
    terms: Optional[str] = None
    status: EstimateStatus
    valid_until: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    pdf_url: Optional[str] = None
