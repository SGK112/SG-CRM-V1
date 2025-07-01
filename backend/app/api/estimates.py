from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from typing import List, Optional
from datetime import datetime, timedelta
import secrets

from app.models.estimate import Estimate, EstimateCreate, EstimateUpdate, EstimateResponse, EstimateStatus
from app.models.user import User
from app.api.auth import get_current_active_user
from app.database import get_database
from app.services.pdf_generator import PDFGenerator
from app.services.email_service import EmailService
from bson import ObjectId
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

def generate_estimate_number():
    """Generate unique estimate number"""
    timestamp = datetime.now().strftime("%Y%m%d")
    random_part = secrets.token_hex(3).upper()
    return f"EST-{timestamp}-{random_part}"

def calculate_totals(line_items, tax_rate):
    """Calculate estimate totals"""
    subtotal = sum(item.total for item in line_items)
    tax_amount = subtotal * (tax_rate / 100)
    total = subtotal + tax_amount
    return subtotal, tax_amount, total

@router.post("/", response_model=EstimateResponse)
async def create_estimate(
    estimate: EstimateCreate,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    # Calculate totals
    subtotal, tax_amount, total = calculate_totals(estimate.line_items, estimate.tax_rate)
    
    estimate_dict = estimate.dict()
    estimate_dict.update({
        "estimate_number": generate_estimate_number(),
        "subtotal": subtotal,
        "tax_amount": tax_amount,
        "total": total,
        "created_by": current_user.id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })
    
    new_estimate = Estimate(**estimate_dict)
    result = await db.estimates.insert_one(new_estimate.dict(by_alias=True))
    created_estimate = await db.estimates.find_one({"_id": result.inserted_id})
    
    return EstimateResponse(
        id=str(created_estimate["_id"]),
        **{k: v for k, v in created_estimate.items() if k != "_id"}
    )

@router.get("/", response_model=List[EstimateResponse])
async def get_estimates(
    skip: int = 0,
    limit: int = 100,
    status: Optional[EstimateStatus] = None,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    query = {}
    if status:
        query["status"] = status
    
    cursor = db.estimates.find(query).skip(skip).limit(limit).sort("created_at", -1)
    estimates = await cursor.to_list(length=limit)
    
    return [
        EstimateResponse(
            id=str(estimate["_id"]),
            **{k: v for k, v in estimate.items() if k != "_id"}
        )
        for estimate in estimates
    ]

@router.get("/{estimate_id}", response_model=EstimateResponse)
async def get_estimate(
    estimate_id: str,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(estimate_id):
        raise HTTPException(status_code=400, detail="Invalid estimate ID")
    
    estimate = await db.estimates.find_one({"_id": ObjectId(estimate_id)})
    if not estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")
    
    return EstimateResponse(
        id=str(estimate["_id"]),
        **{k: v for k, v in estimate.items() if k != "_id"}
    )

@router.put("/{estimate_id}", response_model=EstimateResponse)
async def update_estimate(
    estimate_id: str,
    estimate_update: EstimateUpdate,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(estimate_id):
        raise HTTPException(status_code=400, detail="Invalid estimate ID")
    
    existing_estimate = await db.estimates.find_one({"_id": ObjectId(estimate_id)})
    if not existing_estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")
    
    update_data = {k: v for k, v in estimate_update.dict().items() if v is not None}
    
    # Recalculate totals if line items or tax rate changed
    if "line_items" in update_data or "tax_rate" in update_data:
        line_items = update_data.get("line_items", existing_estimate["line_items"])
        tax_rate = update_data.get("tax_rate", existing_estimate["tax_rate"])
        subtotal, tax_amount, total = calculate_totals(line_items, tax_rate)
        update_data.update({
            "subtotal": subtotal,
            "tax_amount": tax_amount,
            "total": total
        })
    
    update_data["updated_at"] = datetime.utcnow()
    
    await db.estimates.update_one(
        {"_id": ObjectId(estimate_id)},
        {"$set": update_data}
    )
    
    updated_estimate = await db.estimates.find_one({"_id": ObjectId(estimate_id)})
    return EstimateResponse(
        id=str(updated_estimate["_id"]),
        **{k: v for k, v in updated_estimate.items() if k != "_id"}
    )

@router.post("/{estimate_id}/generate-pdf")
async def generate_estimate_pdf(
    estimate_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(estimate_id):
        raise HTTPException(status_code=400, detail="Invalid estimate ID")
    
    estimate = await db.estimates.find_one({"_id": ObjectId(estimate_id)})
    if not estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")
    
    try:
        # Generate PDF
        pdf_generator = PDFGenerator()
        pdf_url = await pdf_generator.generate_estimate_pdf(estimate)
        
        # Update estimate with PDF URL
        await db.estimates.update_one(
            {"_id": ObjectId(estimate_id)},
            {"$set": {"pdf_url": pdf_url, "updated_at": datetime.utcnow()}}
        )
        
        return {"message": "PDF generated successfully", "pdf_url": pdf_url}
    
    except Exception as e:
        logger.error(f"Error generating PDF: {e}")
        raise HTTPException(status_code=500, detail="Error generating PDF")

@router.post("/{estimate_id}/send")
async def send_estimate(
    estimate_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(estimate_id):
        raise HTTPException(status_code=400, detail="Invalid estimate ID")
    
    estimate = await db.estimates.find_one({"_id": ObjectId(estimate_id)})
    if not estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")
    
    try:
        # Generate PDF if not exists
        if not estimate.get("pdf_url"):
            pdf_generator = PDFGenerator()
            pdf_url = await pdf_generator.generate_estimate_pdf(estimate)
            await db.estimates.update_one(
                {"_id": ObjectId(estimate_id)},
                {"$set": {"pdf_url": pdf_url}}
            )
            estimate["pdf_url"] = pdf_url
        
        # Send email
        email_service = EmailService()
        background_tasks.add_task(
            email_service.send_estimate_email,
            estimate["client_email"],
            estimate["client_name"],
            estimate,
            estimate["pdf_url"]
        )
        
        # Update status
        await db.estimates.update_one(
            {"_id": ObjectId(estimate_id)},
            {"$set": {"status": EstimateStatus.SENT, "updated_at": datetime.utcnow()}}
        )
        
        return {"message": "Estimate sent successfully"}
    
    except Exception as e:
        logger.error(f"Error sending estimate: {e}")
        raise HTTPException(status_code=500, detail="Error sending estimate")

@router.post("/{estimate_id}/duplicate", response_model=EstimateResponse)
async def duplicate_estimate(
    estimate_id: str,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(estimate_id):
        raise HTTPException(status_code=400, detail="Invalid estimate ID")
    
    original_estimate = await db.estimates.find_one({"_id": ObjectId(estimate_id)})
    if not original_estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")
    
    # Create duplicate
    duplicate_data = {k: v for k, v in original_estimate.items() if k not in ["_id", "estimate_number", "pdf_url", "created_at", "updated_at"]}
    duplicate_data.update({
        "estimate_number": generate_estimate_number(),
        "title": f"{original_estimate['title']} (Copy)",
        "status": EstimateStatus.DRAFT,
        "created_by": current_user.id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })
    
    new_estimate = Estimate(**duplicate_data)
    result = await db.estimates.insert_one(new_estimate.dict(by_alias=True))
    created_estimate = await db.estimates.find_one({"_id": result.inserted_id})
    
    return EstimateResponse(
        id=str(created_estimate["_id"]),
        **{k: v for k, v in created_estimate.items() if k != "_id"}
    )

@router.delete("/{estimate_id}")
async def delete_estimate(
    estimate_id: str,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(estimate_id):
        raise HTTPException(status_code=400, detail="Invalid estimate ID")
    
    result = await db.estimates.delete_one({"_id": ObjectId(estimate_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Estimate not found")
    
    return {"message": "Estimate deleted successfully"}
