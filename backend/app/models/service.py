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

class Service(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    description: Optional[str] = None
    category: str  # 'countertops', 'plumbing', 'electrical', 'flooring', etc.
    base_price: Optional[float] = None
    unit: Optional[str] = "each"  # 'each', 'sq_ft', 'linear_ft', 'hour'
    estimated_duration: Optional[int] = None  # in hours
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ServiceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    base_price: Optional[float] = None
    unit: Optional[str] = "each"
    estimated_duration: Optional[int] = None
    is_active: bool = True

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    base_price: Optional[float] = None
    unit: Optional[str] = None
    estimated_duration: Optional[int] = None
    is_active: Optional[bool] = None

class ServiceResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    category: str
    base_price: Optional[float] = None
    unit: Optional[str] = None
    estimated_duration: Optional[int] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
