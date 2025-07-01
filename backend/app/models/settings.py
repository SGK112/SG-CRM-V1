from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
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

class CompanyInfo(BaseModel):
    name: str = "Surprise Granite & Remodeling"
    address: str = ""
    phone: str = ""
    email: str = ""
    website: str = ""
    logo_url: str = ""
    license_number: str = ""
    tax_id: str = ""

class IntegrationCredentials(BaseModel):
    stripe_publishable_key: Optional[str] = None
    stripe_secret_key: Optional[str] = None
    stripe_webhook_secret: Optional[str] = None
    quickbooks_client_id: Optional[str] = None
    quickbooks_client_secret: Optional[str] = None
    quickbooks_sandbox: bool = True
    google_calendar_client_id: Optional[str] = None
    google_calendar_client_secret: Optional[str] = None
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_phone_number: Optional[str] = None
    mailgun_api_key: Optional[str] = None
    mailgun_domain: Optional[str] = None

class FeatureFlags(BaseModel):
    estimates_enabled: bool = True
    invoicing_enabled: bool = True
    scheduling_enabled: bool = True
    customer_portal_enabled: bool = True
    online_payments_enabled: bool = True
    sms_notifications_enabled: bool = True
    email_notifications_enabled: bool = True
    quickbooks_sync_enabled: bool = False
    lead_scoring_enabled: bool = True
    workflow_automation_enabled: bool = True

class UserPermissions(BaseModel):
    can_view_dashboard: bool = True
    can_manage_customers: bool = True
    can_create_estimates: bool = True
    can_approve_estimates: bool = False
    can_manage_invoices: bool = True
    can_manage_payments: bool = False
    can_manage_schedule: bool = True
    can_view_reports: bool = True
    can_manage_settings: bool = False
    can_manage_users: bool = False
    can_manage_integrations: bool = False

class Settings(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    company_info: CompanyInfo = CompanyInfo()
    integrations: IntegrationCredentials = IntegrationCredentials()
    features: FeatureFlags = FeatureFlags()
    default_permissions: UserPermissions = UserPermissions()
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class SettingsUpdate(BaseModel):
    company_info: Optional[CompanyInfo] = None
    integrations: Optional[IntegrationCredentials] = None
    features: Optional[FeatureFlags] = None
    default_permissions: Optional[UserPermissions] = None

class SettingsResponse(BaseModel):
    id: str
    company_info: CompanyInfo
    integrations: IntegrationCredentials
    features: FeatureFlags
    default_permissions: UserPermissions
    created_at: datetime
    updated_at: datetime

    class Config:
        json_encoders = {ObjectId: str}
