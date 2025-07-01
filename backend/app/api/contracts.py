from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from typing import List, Optional
from datetime import datetime
import secrets

from app.models.contract import Contract, ContractCreate, ContractUpdate, ContractResponse, ContractStatus, PaymentStatus
from app.models.user import User
from app.api.auth import get_current_active_user
from app.database import get_database
from app.services.pdf_generator import PDFGenerator
from app.services.email_service import EmailService
from bson import ObjectId
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

def generate_contract_number():
    """Generate unique contract number"""
    timestamp = datetime.now().strftime("%Y%m%d")
    random_part = secrets.token_hex(3).upper()
    return f"CON-{timestamp}-{random_part}"

def calculate_contract_totals(line_items, tax_rate, deposit_percentage):
    """Calculate contract totals"""
    subtotal = sum(item.total for item in line_items)
    tax_amount = subtotal * (tax_rate / 100)
    total = subtotal + tax_amount
    deposit_amount = total * (deposit_percentage / 100)
    balance_due = total - deposit_amount
    return subtotal, tax_amount, total, deposit_amount, balance_due

@router.post("/", response_model=ContractResponse)
async def create_contract(
    contract: ContractCreate,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    # Calculate totals
    subtotal, tax_amount, total, deposit_amount, balance_due = calculate_contract_totals(
        contract.line_items, contract.tax_rate, contract.deposit_percentage
    )
    
    contract_dict = contract.dict()
    contract_dict.update({
        "contract_number": generate_contract_number(),
        "subtotal": subtotal,
        "tax_amount": tax_amount,
        "total": total,
        "deposit_amount": deposit_amount,
        "balance_due": balance_due,
        "created_by": current_user.id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })
    
    # Convert estimate_id to ObjectId if provided
    if contract_dict.get("estimate_id"):
        contract_dict["estimate_id"] = ObjectId(contract_dict["estimate_id"])
    
    new_contract = Contract(**contract_dict)
    result = await db.contracts.insert_one(new_contract.dict(by_alias=True))
    created_contract = await db.contracts.find_one({"_id": result.inserted_id})
    
    return ContractResponse(
        id=str(created_contract["_id"]),
        estimate_id=str(created_contract["estimate_id"]) if created_contract.get("estimate_id") else None,
        **{k: v for k, v in created_contract.items() if k not in ["_id", "estimate_id"]}
    )

@router.get("/", response_model=List[ContractResponse])
async def get_contracts(
    skip: int = 0,
    limit: int = 100,
    status: Optional[ContractStatus] = None,
    payment_status: Optional[PaymentStatus] = None,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    query = {}
    if status:
        query["status"] = status
    if payment_status:
        query["payment_status"] = payment_status
    
    cursor = db.contracts.find(query).skip(skip).limit(limit).sort("created_at", -1)
    contracts = await cursor.to_list(length=limit)
    
    return [
        ContractResponse(
            id=str(contract["_id"]),
            estimate_id=str(contract["estimate_id"]) if contract.get("estimate_id") else None,
            **{k: v for k, v in contract.items() if k not in ["_id", "estimate_id"]}
        )
        for contract in contracts
    ]

@router.get("/{contract_id}", response_model=ContractResponse)
async def get_contract(
    contract_id: str,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(contract_id):
        raise HTTPException(status_code=400, detail="Invalid contract ID")
    
    contract = await db.contracts.find_one({"_id": ObjectId(contract_id)})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    return ContractResponse(
        id=str(contract["_id"]),
        estimate_id=str(contract["estimate_id"]) if contract.get("estimate_id") else None,
        **{k: v for k, v in contract.items() if k not in ["_id", "estimate_id"]}
    )

@router.put("/{contract_id}", response_model=ContractResponse)
async def update_contract(
    contract_id: str,
    contract_update: ContractUpdate,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(contract_id):
        raise HTTPException(status_code=400, detail="Invalid contract ID")
    
    existing_contract = await db.contracts.find_one({"_id": ObjectId(contract_id)})
    if not existing_contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    update_data = {k: v for k, v in contract_update.dict().items() if v is not None}
    
    # Recalculate totals if relevant fields changed
    if any(field in update_data for field in ["line_items", "tax_rate", "deposit_percentage"]):
        line_items = update_data.get("line_items", existing_contract["line_items"])
        tax_rate = update_data.get("tax_rate", existing_contract["tax_rate"])
        deposit_percentage = update_data.get("deposit_percentage", existing_contract["deposit_percentage"])
        
        subtotal, tax_amount, total, deposit_amount, balance_due = calculate_contract_totals(
            line_items, tax_rate, deposit_percentage
        )
        update_data.update({
            "subtotal": subtotal,
            "tax_amount": tax_amount,
            "total": total,
            "deposit_amount": deposit_amount,
            "balance_due": balance_due
        })
    
    update_data["updated_at"] = datetime.utcnow()
    
    await db.contracts.update_one(
        {"_id": ObjectId(contract_id)},
        {"$set": update_data}
    )
    
    updated_contract = await db.contracts.find_one({"_id": ObjectId(contract_id)})
    return ContractResponse(
        id=str(updated_contract["_id"]),
        estimate_id=str(updated_contract["estimate_id"]) if updated_contract.get("estimate_id") else None,
        **{k: v for k, v in updated_contract.items() if k not in ["_id", "estimate_id"]}
    )

@router.post("/{contract_id}/generate-pdf")
async def generate_contract_pdf(
    contract_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(contract_id):
        raise HTTPException(status_code=400, detail="Invalid contract ID")
    
    contract = await db.contracts.find_one({"_id": ObjectId(contract_id)})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    try:
        # Generate PDF
        pdf_generator = PDFGenerator()
        pdf_url = await pdf_generator.generate_contract_pdf(contract)
        
        # Update contract with PDF URL
        await db.contracts.update_one(
            {"_id": ObjectId(contract_id)},
            {"$set": {"pdf_url": pdf_url, "updated_at": datetime.utcnow()}}
        )
        
        return {"message": "PDF generated successfully", "pdf_url": pdf_url}
    
    except Exception as e:
        logger.error(f"Error generating PDF: {e}")
        raise HTTPException(status_code=500, detail="Error generating PDF")

@router.post("/{contract_id}/send")
async def send_contract(
    contract_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(contract_id):
        raise HTTPException(status_code=400, detail="Invalid contract ID")
    
    contract = await db.contracts.find_one({"_id": ObjectId(contract_id)})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    try:
        # Generate PDF if not exists
        if not contract.get("pdf_url"):
            pdf_generator = PDFGenerator()
            pdf_url = await pdf_generator.generate_contract_pdf(contract)
            await db.contracts.update_one(
                {"_id": ObjectId(contract_id)},
                {"$set": {"pdf_url": pdf_url}}
            )
            contract["pdf_url"] = pdf_url
        
        # Send email
        email_service = EmailService()
        background_tasks.add_task(
            email_service.send_contract_email,
            contract["client_email"],
            contract["client_name"],
            contract,
            contract["pdf_url"]
        )
        
        # Update status
        await db.contracts.update_one(
            {"_id": ObjectId(contract_id)},
            {"$set": {"status": ContractStatus.SENT, "updated_at": datetime.utcnow()}}
        )
        
        return {"message": "Contract sent successfully"}
    
    except Exception as e:
        logger.error(f"Error sending contract: {e}")
        raise HTTPException(status_code=500, detail="Error sending contract")

@router.post("/{contract_id}/sign")
async def sign_contract(
    contract_id: str,
    signature_data: dict,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(contract_id):
        raise HTTPException(status_code=400, detail="Invalid contract ID")
    
    contract = await db.contracts.find_one({"_id": ObjectId(contract_id)})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Update contract with signature
    await db.contracts.update_one(
        {"_id": ObjectId(contract_id)},
        {
            "$set": {
                "status": ContractStatus.SIGNED,
                "signature_data": signature_data,
                "signed_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Contract signed successfully"}

@router.post("/from-estimate/{estimate_id}", response_model=ContractResponse)
async def create_contract_from_estimate(
    estimate_id: str,
    deposit_percentage: float = 25.0,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(estimate_id):
        raise HTTPException(status_code=400, detail="Invalid estimate ID")
    
    estimate = await db.estimates.find_one({"_id": ObjectId(estimate_id)})
    if not estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")
    
    # Create contract from estimate
    subtotal, tax_amount, total, deposit_amount, balance_due = calculate_contract_totals(
        estimate["line_items"], estimate["tax_rate"], deposit_percentage
    )
    
    contract_data = {
        "contract_number": generate_contract_number(),
        "estimate_id": ObjectId(estimate_id),
        "title": estimate["title"],
        "client_name": estimate["client_name"],
        "client_email": estimate["client_email"],
        "client_phone": estimate.get("client_phone"),
        "client_address": estimate.get("client_address"),
        "line_items": estimate["line_items"],
        "subtotal": subtotal,
        "tax_rate": estimate["tax_rate"],
        "tax_amount": tax_amount,
        "total": total,
        "deposit_percentage": deposit_percentage,
        "deposit_amount": deposit_amount,
        "balance_due": balance_due,
        "terms": estimate.get("terms"),
        "created_by": current_user.id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    new_contract = Contract(**contract_data)
    result = await db.contracts.insert_one(new_contract.dict(by_alias=True))
    created_contract = await db.contracts.find_one({"_id": result.inserted_id})
    
    return ContractResponse(
        id=str(created_contract["_id"]),
        estimate_id=str(created_contract["estimate_id"]),
        **{k: v for k, v in created_contract.items() if k not in ["_id", "estimate_id"]}
    )

@router.delete("/{contract_id}")
async def delete_contract(
    contract_id: str,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(contract_id):
        raise HTTPException(status_code=400, detail="Invalid contract ID")
    
    # Only allow deletion of draft contracts
    contract = await db.contracts.find_one({"_id": ObjectId(contract_id)})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    if contract["status"] != ContractStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Only draft contracts can be deleted")
    
    result = await db.contracts.delete_one({"_id": ObjectId(contract_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    return {"message": "Contract deleted successfully"}
