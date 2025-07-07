from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from typing import List, Optional
from datetime import datetime

from ..models.vendor import Vendor, VendorCreate, VendorUpdate, VendorResponse
from ..models.user import User
from .auth import get_current_active_user
from ..database import get_database
from ..services.pdf_parser import PDFParser
from bson import ObjectId
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=VendorResponse)
async def create_vendor(
    vendor: VendorCreate,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    vendor_dict = vendor.dict()
    vendor_dict["created_by"] = current_user.id
    vendor_dict["created_at"] = datetime.utcnow()
    vendor_dict["updated_at"] = datetime.utcnow()
    
    new_vendor = Vendor(**vendor_dict)
    result = await db.vendors.insert_one(new_vendor.dict(by_alias=True))
    created_vendor = await db.vendors.find_one({"_id": result.inserted_id})
    
    return VendorResponse(
        id=str(created_vendor["_id"]),
        **{k: v for k, v in created_vendor.items() if k != "_id"}
    )

@router.get("/", response_model=List[VendorResponse])
async def get_vendors(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    query = {"is_active": True}
    
    if category:
        query["category"] = category
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"company_name": {"$regex": search, "$options": "i"}},
            {"specialties": {"$regex": search, "$options": "i"}}
        ]
    
    cursor = db.vendors.find(query).skip(skip).limit(limit)
    vendors = await cursor.to_list(length=limit)
    
    return [
        VendorResponse(
            id=str(vendor["_id"]),
            **{k: v for k, v in vendor.items() if k != "_id"}
        )
        for vendor in vendors
    ]

@router.get("/{vendor_id}", response_model=VendorResponse)
async def get_vendor(
    vendor_id: str,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(vendor_id):
        raise HTTPException(status_code=400, detail="Invalid vendor ID")
    
    vendor = await db.vendors.find_one({"_id": ObjectId(vendor_id)})
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    return VendorResponse(
        id=str(vendor["_id"]),
        **{k: v for k, v in vendor.items() if k != "_id"}
    )

@router.put("/{vendor_id}", response_model=VendorResponse)
async def update_vendor(
    vendor_id: str,
    vendor_update: VendorUpdate,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(vendor_id):
        raise HTTPException(status_code=400, detail="Invalid vendor ID")
    
    existing_vendor = await db.vendors.find_one({"_id": ObjectId(vendor_id)})
    if not existing_vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    update_data = {k: v for k, v in vendor_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.vendors.update_one(
        {"_id": ObjectId(vendor_id)},
        {"$set": update_data}
    )
    
    updated_vendor = await db.vendors.find_one({"_id": ObjectId(vendor_id)})
    return VendorResponse(
        id=str(updated_vendor["_id"]),
        **{k: v for k, v in updated_vendor.items() if k != "_id"}
    )

@router.delete("/{vendor_id}")
async def delete_vendor(
    vendor_id: str,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(vendor_id):
        raise HTTPException(status_code=400, detail="Invalid vendor ID")
    
    result = await db.vendors.update_one(
        {"_id": ObjectId(vendor_id)},
        {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    return {"message": "Vendor deleted successfully"}

@router.post("/{vendor_id}/upload-pricing")
async def upload_vendor_pricing(
    vendor_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(vendor_id):
        raise HTTPException(status_code=400, detail="Invalid vendor ID")
    
    vendor = await db.vendors.find_one({"_id": ObjectId(vendor_id)})
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # Parse PDF for pricing information
        pdf_parser = PDFParser()
        content = await file.read()
        pricing_data = await pdf_parser.extract_pricing_from_pdf(content)
        
        # Update vendor with extracted pricing
        await db.vendors.update_one(
            {"_id": ObjectId(vendor_id)},
            {
                "$push": {"pricing": {"$each": pricing_data}},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        return {"message": f"Successfully extracted {len(pricing_data)} pricing items", "items": pricing_data}
    
    except Exception as e:
        logger.error(f"Error processing PDF: {e}")
        raise HTTPException(status_code=500, detail="Error processing PDF file")

@router.get("/categories/list")
async def get_vendor_categories(
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    """Get list of all vendor categories"""
    pipeline = [
        {"$match": {"is_active": True}},
        {"$group": {"_id": "$category"}},
        {"$sort": {"_id": 1}}
    ]
    categories = await db.vendors.aggregate(pipeline).to_list(length=None)
    return [cat["_id"] for cat in categories if cat["_id"]]
