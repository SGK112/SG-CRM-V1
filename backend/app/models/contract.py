from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from bson import ObjectId
from .user import PyObjectId
from .estimate import Address, LineItem

class ContractStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    SIGNED = "signed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PARTIAL = "partial"
    PAID = "paid"
    OVERDUE = "overdue"

class Contract(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    contract_number: str
    estimate_id: Optional[PyObjectId] = None
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
    deposit_percentage: float = 0.0
    deposit_amount: float = 0.0
    balance_due: float = 0.0
    terms: Optional[str] = None
    scope_of_work: Optional[str] = None
    start_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    status: ContractStatus = ContractStatus.DRAFT
    payment_status: PaymentStatus = PaymentStatus.PENDING
    signature_data: Optional[Dict[str, Any]] = None
    signed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[PyObjectId] = None
    pdf_url: Optional[str] = None
    stripe_payment_intent_id: Optional[str] = None

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ContractCreate(BaseModel):
    estimate_id: Optional[str] = None
    title: str
    client_name: str
    client_email: str
    client_phone: Optional[str] = None
    client_address: Optional[Address] = None
    line_items: List[LineItem] = []
    tax_rate: float = 0.0
    deposit_percentage: float = 0.0
    terms: Optional[str] = None
    scope_of_work: Optional[str] = None
    start_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None

class ContractUpdate(BaseModel):
    title: Optional[str] = None
    client_name: Optional[str] = None
    client_email: Optional[str] = None
    client_phone: Optional[str] = None
    client_address: Optional[Address] = None
    line_items: Optional[List[LineItem]] = None
    tax_rate: Optional[float] = None
    deposit_percentage: Optional[float] = None
    terms: Optional[str] = None
    scope_of_work: Optional[str] = None
    start_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    status: Optional[ContractStatus] = None
    payment_status: Optional[PaymentStatus] = None

class ContractResponse(BaseModel):
    id: str
    contract_number: str
    estimate_id: Optional[str] = None
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
    deposit_percentage: float
    deposit_amount: float
    balance_due: float
    terms: Optional[str] = None
    scope_of_work: Optional[str] = None
    start_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    status: ContractStatus
    payment_status: PaymentStatus
    signed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    pdf_url: Optional[str] = None
