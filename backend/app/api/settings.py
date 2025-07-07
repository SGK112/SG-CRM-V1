from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from ..models.settings import Settings, SettingsUpdate, SettingsResponse, CompanyInfo, IntegrationCredentials, FeatureFlags, UserPermissions
from ..models.user import User
from ..database import get_database
from .auth import get_current_user

router = APIRouter()

@router.get("/company", response_model=CompanyInfo)
async def get_company_info(
    db=Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """Get company information (public endpoint for branding)"""
    settings = await db.settings.find_one({})
    if not settings:
        # Return default company info if no settings exist
        return CompanyInfo()
    
    return CompanyInfo(**settings.get("company_info", {}))

@router.get("/", response_model=SettingsResponse)
async def get_settings(
    db=Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """Get all settings (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    settings = await db.settings.find_one({})
    if not settings:
        # Create default settings if none exist
        default_settings = Settings()
        result = await db.settings.insert_one(default_settings.dict(by_alias=True, exclude={"id"}))
        settings = await db.settings.find_one({"_id": result.inserted_id})
    
    return SettingsResponse(
        id=str(settings["_id"]),
        **{k: v for k, v in settings.items() if k != "_id"}
    )

@router.put("/", response_model=SettingsResponse)
async def update_settings(
    settings_update: SettingsUpdate,
    db=Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """Update settings (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Get existing settings
    existing_settings = await db.settings.find_one({})
    if not existing_settings:
        # Create new settings if none exist
        new_settings = Settings()
        if settings_update.company_info:
            new_settings.company_info = settings_update.company_info
        if settings_update.integrations:
            new_settings.integrations = settings_update.integrations
        if settings_update.features:
            new_settings.features = settings_update.features
        if settings_update.default_permissions:
            new_settings.default_permissions = settings_update.default_permissions
        
        result = await db.settings.insert_one(new_settings.dict(by_alias=True, exclude={"id"}))
        settings = await db.settings.find_one({"_id": result.inserted_id})
    else:
        # Update existing settings
        update_data = {"updated_at": datetime.utcnow()}
        
        if settings_update.company_info:
            update_data["company_info"] = settings_update.company_info.dict()
        if settings_update.integrations:
            update_data["integrations"] = settings_update.integrations.dict()
        if settings_update.features:
            update_data["features"] = settings_update.features.dict()
        if settings_update.default_permissions:
            update_data["default_permissions"] = settings_update.default_permissions.dict()
        
        await db.settings.update_one(
            {"_id": existing_settings["_id"]},
            {"$set": update_data}
        )
        settings = await db.settings.find_one({"_id": existing_settings["_id"]})
    
    return SettingsResponse(
        id=str(settings["_id"]),
        **{k: v for k, v in settings.items() if k != "_id"}
    )

@router.get("/public", response_model=dict)
async def get_public_settings(db=Depends(get_database)):
    """Get public settings (no authentication required)"""
    settings = await db.settings.find_one({})
    if not settings:
        # Return default public settings
        return {
            "theme": "light",
            "company_name": "SG CRM",
            "features": {
                "marketing_enabled": True,
                "stripe_enabled": True
            }
        }
    
    # Return only public settings
    public_settings = {
        "theme": settings.get("theme", "light"),
        "company_name": settings.get("company_info", {}).get("name", "SG CRM"),
        "features": settings.get("feature_flags", {})
    }
    
    return public_settings

@router.post("/test-integration/{integration_type}")
async def test_integration(
    integration_type: str,
    db=Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """Test integration connectivity (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    settings = await db.settings.find_one({})
    if not settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Settings not found"
        )
    
    integrations = settings.get("integrations", {})
    
    try:
        if integration_type == "stripe":
            if not integrations.get("stripe_secret_key"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Stripe credentials not configured"
                )
            
            import stripe
            stripe.api_key = integrations["stripe_secret_key"]
            
            # Test the connection by retrieving account info
            account = stripe.Account.retrieve()
            return {
                "success": True,
                "message": f"Connected to Stripe account: {account.display_name or account.id}",
                "data": {
                    "account_id": account.id,
                    "display_name": account.display_name,
                    "country": account.country
                }
            }
        
        elif integration_type == "quickbooks":
            if not integrations.get("quickbooks_client_id") or not integrations.get("quickbooks_client_secret"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="QuickBooks credentials not configured"
                )
            
            # For QuickBooks, we can only validate that credentials are present
            # Full OAuth flow validation would require actual token exchange
            return {
                "success": True,
                "message": "QuickBooks credentials configured. OAuth flow ready.",
                "data": {
                    "client_id": integrations["quickbooks_client_id"],
                    "sandbox": integrations.get("quickbooks_sandbox", True)
                }
            }
        
        elif integration_type == "twilio":
            if not integrations.get("twilio_account_sid") or not integrations.get("twilio_auth_token"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Twilio credentials not configured"
                )
            
            from twilio.rest import Client
            client = Client(integrations["twilio_account_sid"], integrations["twilio_auth_token"])
            
            # Test the connection by retrieving account info
            account = client.api.accounts(integrations["twilio_account_sid"]).fetch()
            return {
                "success": True,
                "message": f"Connected to Twilio account: {account.friendly_name}",
                "data": {
                    "account_sid": account.sid,
                    "friendly_name": account.friendly_name,
                    "status": account.status
                }
            }
        
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Integration type '{integration_type}' not supported"
            )
    
    except Exception as e:
        return {
            "success": False,
            "message": f"Integration test failed: {str(e)}",
            "data": None
        }
