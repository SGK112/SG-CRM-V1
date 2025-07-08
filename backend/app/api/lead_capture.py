from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Optional
from datetime import datetime
from bson import ObjectId
import logging

from ..models.client import ClientCreate, Client
from ..database import get_database
from ..services.email_service import EmailService
from ..services.grok_ai import GrokAI

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/public/lead-capture")
async def capture_lead(
    lead_data: dict,
    request: Request,
    db=Depends(get_database)
):
    """
    Public endpoint for capturing leads from website forms
    No authentication required
    """
    try:
        # Extract lead information
        lead_info = {
            "first_name": lead_data.get("first_name", ""),
            "last_name": lead_data.get("last_name", ""),
            "email": lead_data.get("email", ""),
            "phone": lead_data.get("phone", ""),
            "project_type": lead_data.get("project_type", ""),
            "project_description": lead_data.get("project_description", ""),
            "budget": lead_data.get("budget"),
            "timeline": lead_data.get("timeline", ""),
            "address": lead_data.get("address", ""),
            "lead_source": lead_data.get("lead_source", "website"),
            "preferred_contact": lead_data.get("preferred_contact", "email"),
            "preferred_appointment_time": lead_data.get("preferred_appointment_time"),
            "notes": lead_data.get("notes", ""),
            "project_status": "new_lead",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "lead_score": 0,
            "ip_address": request.client.host,
            "user_agent": request.headers.get("user-agent", ""),
        }
        
        # Use AI to score the lead
        grok_ai = GrokAI()
        try:
            lead_score = await grok_ai.score_lead(lead_info)
            lead_info["lead_score"] = lead_score
        except Exception as e:
            logger.warning(f"Failed to score lead with AI: {e}")
            # Basic scoring fallback
            lead_info["lead_score"] = calculate_basic_lead_score(lead_info)
        
        # Save lead to database
        result = await db.clients.insert_one(lead_info)
        lead_id = str(result.inserted_id)
        
        # Send welcome email
        email_service = EmailService()
        try:
            await email_service.send_welcome_email(
                lead_info["email"], 
                lead_info["first_name"], 
                lead_info
            )
        except Exception as e:
            logger.error(f"Failed to send welcome email: {e}")
        
        # Create follow-up task
        await create_follow_up_task(db, lead_id, lead_info)
        
        logger.info(f"New lead captured: {lead_id} - {lead_info['email']}")
        
        return {
            "success": True,
            "message": "Thank you for your interest! We'll contact you soon.",
            "lead_id": lead_id,
            "lead_score": lead_info["lead_score"]
        }
        
    except Exception as e:
        logger.error(f"Error capturing lead: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit lead")

@router.get("/public/lead-form")
async def get_lead_form():
    """
    Get lead capture form configuration
    """
    return {
        "form_fields": [
            {
                "name": "first_name",
                "label": "First Name",
                "type": "text",
                "required": True
            },
            {
                "name": "last_name", 
                "label": "Last Name",
                "type": "text",
                "required": True
            },
            {
                "name": "email",
                "label": "Email",
                "type": "email",
                "required": True
            },
            {
                "name": "phone",
                "label": "Phone",
                "type": "tel",
                "required": False
            },
            {
                "name": "project_type",
                "label": "Project Type",
                "type": "select",
                "required": True,
                "options": [
                    {"value": "kitchen", "label": "Kitchen Remodel"},
                    {"value": "bathroom", "label": "Bathroom Remodel"},
                    {"value": "countertops", "label": "Countertops Only"},
                    {"value": "commercial", "label": "Commercial Project"},
                    {"value": "other", "label": "Other"}
                ]
            },
            {
                "name": "project_description",
                "label": "Project Description",
                "type": "textarea",
                "required": True
            },
            {
                "name": "budget",
                "label": "Budget Range",
                "type": "select",
                "required": False,
                "options": [
                    {"value": "under_5k", "label": "Under $5,000"},
                    {"value": "5k_10k", "label": "$5,000 - $10,000"},
                    {"value": "10k_25k", "label": "$10,000 - $25,000"},
                    {"value": "25k_50k", "label": "$25,000 - $50,000"},
                    {"value": "over_50k", "label": "Over $50,000"}
                ]
            },
            {
                "name": "timeline",
                "label": "Timeline",
                "type": "select",
                "required": False,
                "options": [
                    {"value": "asap", "label": "ASAP"},
                    {"value": "1_month", "label": "Within 1 month"},
                    {"value": "3_months", "label": "Within 3 months"},
                    {"value": "6_months", "label": "Within 6 months"},
                    {"value": "planning", "label": "Just planning"}
                ]
            },
            {
                "name": "address",
                "label": "Project Address",
                "type": "text",
                "required": False
            },
            {
                "name": "preferred_contact",
                "label": "Preferred Contact Method",
                "type": "select",
                "required": False,
                "options": [
                    {"value": "email", "label": "Email"},
                    {"value": "phone", "label": "Phone"},
                    {"value": "text", "label": "Text Message"}
                ]
            },
            {
                "name": "notes",
                "label": "Additional Notes",
                "type": "textarea",
                "required": False
            }
        ]
    }

def calculate_basic_lead_score(lead_info):
    """
    Calculate basic lead score based on available information
    """
    score = 0
    
    # Email provided
    if lead_info.get("email"):
        score += 10
    
    # Phone provided
    if lead_info.get("phone"):
        score += 10
    
    # Project type specific
    project_type = lead_info.get("project_type", "")
    if project_type in ["kitchen", "bathroom", "countertops"]:
        score += 15
    elif project_type == "commercial":
        score += 20
    
    # Budget range
    budget = lead_info.get("budget", "")
    if budget == "over_50k":
        score += 25
    elif budget == "25k_50k":
        score += 20
    elif budget == "10k_25k":
        score += 15
    
    # Timeline urgency
    timeline = lead_info.get("timeline", "")
    if timeline == "asap":
        score += 20
    elif timeline == "1_month":
        score += 15
    elif timeline == "3_months":
        score += 10
    
    # Address provided (shows serious intent)
    if lead_info.get("address"):
        score += 10
    
    # Detailed description
    description = lead_info.get("project_description", "")
    if len(description) > 50:
        score += 10
    
    return min(score, 100)  # Cap at 100

async def create_follow_up_task(db, lead_id, lead_info):
    """
    Create automated follow-up task for the lead
    """
    task = {
        "lead_id": lead_id,
        "task_type": "follow_up",
        "priority": "high" if lead_info["lead_score"] >= 70 else "medium",
        "title": f"Follow up with {lead_info['first_name']} {lead_info['last_name']}",
        "description": f"New lead from {lead_info['lead_source']} - {lead_info['project_type']} project",
        "due_date": datetime.utcnow(),
        "status": "pending",
        "assigned_to": None,  # Will be assigned based on lead routing rules
        "created_at": datetime.utcnow(),
        "metadata": {
            "lead_score": lead_info["lead_score"],
            "project_type": lead_info["project_type"],
            "budget": lead_info.get("budget"),
            "timeline": lead_info.get("timeline")
        }
    }
    
    await db.tasks.insert_one(task)

@router.post("/lead-routing")
async def configure_lead_routing(
    routing_config: dict,
    db=Depends(get_database)
):
    """
    Configure lead routing rules
    """
    config = {
        "routing_rules": routing_config,
        "updated_at": datetime.utcnow()
    }
    
    await db.settings.update_one(
        {},
        {"$set": {"lead_routing": config}},
        upsert=True
    )
    
    return {"success": True, "message": "Lead routing configured"}

@router.get("/lead-stats")
async def get_lead_stats(
    db=Depends(get_database)
):
    """
    Get lead capture statistics
    """
    pipeline = [
        {
            "$match": {
                "created_at": {"$gte": datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)}
            }
        },
        {
            "$group": {
                "_id": {
                    "lead_source": "$lead_source",
                    "project_type": "$project_type"
                },
                "count": {"$sum": 1},
                "avg_score": {"$avg": "$lead_score"}
            }
        }
    ]
    
    stats = await db.clients.aggregate(pipeline).to_list(None)
    
    return {
        "today_stats": stats,
        "total_leads": await db.clients.count_documents({})
    }
