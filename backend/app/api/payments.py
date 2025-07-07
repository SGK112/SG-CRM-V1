from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import Dict, Any
from datetime import datetime
import stripe
from decouple import config

from ..models.contract import Contract, ContractCreate, PaymentStatus
from ..models.user import User
from .auth import get_current_active_user
from ..database import get_database
from ..services.stripe_service import StripeService
from bson import ObjectId
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize Stripe
stripe.api_key = config("STRIPE_SECRET_KEY")

@router.post("/create-payment-intent")
async def create_payment_intent(
    contract_id: str,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(contract_id):
        raise HTTPException(status_code=400, detail="Invalid contract ID")
    
    contract = await db.contracts.find_one({"_id": ObjectId(contract_id)})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    try:
        stripe_service = StripeService()
        
        # Create payment intent for deposit amount
        amount = int(contract["deposit_amount"] * 100)  # Convert to cents
        
        payment_intent = stripe_service.create_payment_intent(
            amount=amount,
            currency="usd",
            metadata={
                "contract_id": contract_id,
                "client_email": contract["client_email"],
                "contract_number": contract["contract_number"]
            }
        )
        
        # Update contract with payment intent ID
        await db.contracts.update_one(
            {"_id": ObjectId(contract_id)},
            {"$set": {"stripe_payment_intent_id": payment_intent.id}}
        )
        
        return {
            "client_secret": payment_intent.client_secret,
            "payment_intent_id": payment_intent.id
        }
    
    except Exception as e:
        logger.error(f"Error creating payment intent: {e}")
        raise HTTPException(status_code=500, detail="Error creating payment intent")

@router.post("/webhook")
async def stripe_webhook(request: Request, db = Depends(get_database)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    endpoint_secret = config("STRIPE_WEBHOOK_SECRET")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError:
        logger.error("Invalid payload")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        logger.error("Invalid signature")
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        contract_id = payment_intent["metadata"].get("contract_id")
        
        if contract_id and ObjectId.is_valid(contract_id):
            # Update contract payment status
            await db.contracts.update_one(
                {"_id": ObjectId(contract_id)},
                {
                    "$set": {
                        "payment_status": PaymentStatus.PARTIAL,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            logger.info(f"Payment succeeded for contract {contract_id}")
    
    elif event["type"] == "payment_intent.payment_failed":
        payment_intent = event["data"]["object"]
        contract_id = payment_intent["metadata"].get("contract_id")
        logger.warning(f"Payment failed for contract {contract_id}")
    
    return {"status": "success"}

@router.get("/payment-status/{contract_id}")
async def get_payment_status(
    contract_id: str,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(contract_id):
        raise HTTPException(status_code=400, detail="Invalid contract ID")
    
    contract = await db.contracts.find_one({"_id": ObjectId(contract_id)})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    payment_info = {
        "contract_id": contract_id,
        "payment_status": contract["payment_status"],
        "total": contract["total"],
        "deposit_amount": contract["deposit_amount"],
        "balance_due": contract["balance_due"]
    }
    
    # Get Stripe payment details if available
    if contract.get("stripe_payment_intent_id"):
        try:
            payment_intent = stripe.PaymentIntent.retrieve(
                contract["stripe_payment_intent_id"]
            )
            payment_info["stripe_status"] = payment_intent.status
            payment_info["amount_received"] = payment_intent.amount_received / 100
        except Exception as e:
            logger.error(f"Error retrieving Stripe payment: {e}")
    
    return payment_info

@router.post("/process-balance-payment")
async def process_balance_payment(
    contract_id: str,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(contract_id):
        raise HTTPException(status_code=400, detail="Invalid contract ID")
    
    contract = await db.contracts.find_one({"_id": ObjectId(contract_id)})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    if contract["payment_status"] != PaymentStatus.PARTIAL:
        raise HTTPException(status_code=400, detail="Deposit must be paid first")
    
    try:
        stripe_service = StripeService()
        
        # Create payment intent for balance amount
        amount = int(contract["balance_due"] * 100)  # Convert to cents
        
        payment_intent = stripe_service.create_payment_intent(
            amount=amount,
            currency="usd",
            metadata={
                "contract_id": contract_id,
                "client_email": contract["client_email"],
                "contract_number": contract["contract_number"],
                "payment_type": "balance"
            }
        )
        
        return {
            "client_secret": payment_intent.client_secret,
            "payment_intent_id": payment_intent.id
        }
    
    except Exception as e:
        logger.error(f"Error creating balance payment intent: {e}")
        raise HTTPException(status_code=500, detail="Error creating payment intent")

@router.get("/transactions/{contract_id}")
async def get_contract_transactions(
    contract_id: str,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(contract_id):
        raise HTTPException(status_code=400, detail="Invalid contract ID")
    
    contract = await db.contracts.find_one({"_id": ObjectId(contract_id)})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    transactions = []
    
    if contract.get("stripe_payment_intent_id"):
        try:
            # Get all charges for this customer
            charges = stripe.Charge.list(
                limit=100,
                metadata={"contract_id": contract_id}
            )
            
            for charge in charges.data:
                transactions.append({
                    "id": charge.id,
                    "amount": charge.amount / 100,
                    "status": charge.status,
                    "created": charge.created,
                    "description": charge.description,
                    "receipt_url": charge.receipt_url
                })
        
        except Exception as e:
            logger.error(f"Error retrieving transactions: {e}")
    
    return transactions
