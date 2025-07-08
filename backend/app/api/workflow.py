from fastapi import APIRouter, Depends, BackgroundTasks
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from bson import ObjectId
import logging

from ..database import get_database
from ..services.email_service import EmailService
from ..models.user import User
from .auth import get_current_active_user

router = APIRouter()
logger = logging.getLogger(__name__)

class WorkflowEngine:
    def __init__(self, db):
        self.db = db
        self.email_service = EmailService()
    
    async def trigger_lead_workflow(self, lead_id: str, lead_data: Dict[str, Any]):
        """Trigger automated workflow for new leads"""
        try:
            # Step 1: Send welcome email (immediate)
            await self.email_service.send_welcome_email(
                lead_data["email"],
                lead_data["first_name"],
                lead_data
            )
            
            # Step 2: Create follow-up tasks based on lead score
            await self._create_follow_up_tasks(lead_id, lead_data)
            
            # Step 3: Schedule automated follow-up emails
            await self._schedule_follow_up_emails(lead_id, lead_data)
            
            # Step 4: Assign to sales rep based on routing rules
            await self._assign_lead_to_rep(lead_id, lead_data)
            
            logger.info(f"Lead workflow triggered for {lead_id}")
            
        except Exception as e:
            logger.error(f"Error in lead workflow: {e}")
    
    async def _create_follow_up_tasks(self, lead_id: str, lead_data: Dict[str, Any]):
        """Create follow-up tasks based on lead score and type"""
        lead_score = lead_data.get("lead_score", 0)
        project_type = lead_data.get("project_type", "")
        timeline = lead_data.get("timeline", "")
        
        tasks = []
        
        # High priority leads get immediate attention
        if lead_score >= 70:
            tasks.append({
                "lead_id": lead_id,
                "task_type": "call",
                "title": f"URGENT: Call {lead_data['first_name']} {lead_data['last_name']}",
                "description": f"High-score lead ({lead_score}) - {project_type} project",
                "priority": "urgent",
                "due_date": datetime.utcnow() + timedelta(hours=1),
                "status": "pending"
            })
        
        # All leads get consultation scheduling task
        tasks.append({
            "lead_id": lead_id,
            "task_type": "consultation",
            "title": f"Schedule consultation with {lead_data['first_name']} {lead_data['last_name']}",
            "description": f"Project: {project_type}, Timeline: {timeline}",
            "priority": "high" if lead_score >= 50 else "medium",
            "due_date": datetime.utcnow() + timedelta(hours=24),
            "status": "pending"
        })
        
        # ASAP timeline gets special handling
        if timeline == "asap":
            tasks.append({
                "lead_id": lead_id,
                "task_type": "quote",
                "title": f"Rush quote for {lead_data['first_name']} {lead_data['last_name']}",
                "description": "Client needs ASAP timeline - prioritize estimate",
                "priority": "urgent",
                "due_date": datetime.utcnow() + timedelta(hours=12),
                "status": "pending"
            })
        
        # Insert tasks
        for task in tasks:
            task.update({
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
            await self.db.tasks.insert_one(task)
    
    async def _schedule_follow_up_emails(self, lead_id: str, lead_data: Dict[str, Any]):
        """Schedule automated follow-up email sequence"""
        email_sequence = [
            {
                "delay_hours": 24,
                "type": "consultation",
                "subject": "Ready to schedule your free consultation?"
            },
            {
                "delay_hours": 72,
                "type": "follow_up",
                "subject": "Still interested in your project?"
            },
            {
                "delay_hours": 168,  # 1 week
                "type": "offer",
                "subject": "Special offer for your project"
            }
        ]
        
        for email in email_sequence:
            scheduled_email = {
                "lead_id": lead_id,
                "email_type": email["type"],
                "recipient_email": lead_data["email"],
                "recipient_name": lead_data["first_name"],
                "subject": email["subject"],
                "send_at": datetime.utcnow() + timedelta(hours=email["delay_hours"]),
                "status": "scheduled",
                "created_at": datetime.utcnow()
            }
            await self.db.scheduled_emails.insert_one(scheduled_email)
    
    async def _assign_lead_to_rep(self, lead_id: str, lead_data: Dict[str, Any]):
        """Assign lead to sales rep based on routing rules"""
        # Get routing rules from settings
        settings = await self.db.settings.find_one({})
        routing_rules = settings.get("lead_routing", {}).get("routing_rules", {}) if settings else {}
        
        assigned_rep = None
        
        # Project type based assignment
        project_type = lead_data.get("project_type", "")
        if project_type in routing_rules.get("by_project_type", {}):
            assigned_rep = routing_rules["by_project_type"][project_type]
        
        # Lead score based assignment
        elif lead_data.get("lead_score", 0) >= 80:
            assigned_rep = routing_rules.get("high_score_rep")
        
        # Default assignment (round-robin)
        else:
            # Get next rep in rotation
            reps = routing_rules.get("default_reps", [])
            if reps:
                last_assignment = await self.db.lead_assignments.find_one({}, sort=[("created_at", -1)])
                last_rep_index = 0
                if last_assignment:
                    try:
                        last_rep_index = reps.index(last_assignment["assigned_rep"])
                    except ValueError:
                        last_rep_index = 0
                
                next_rep_index = (last_rep_index + 1) % len(reps)
                assigned_rep = reps[next_rep_index]
        
        # Update lead with assignment
        if assigned_rep:
            await self.db.clients.update_one(
                {"_id": ObjectId(lead_id)},
                {
                    "$set": {
                        "assigned_rep": assigned_rep,
                        "assigned_at": datetime.utcnow()
                    }
                }
            )
            
            # Record assignment
            await self.db.lead_assignments.insert_one({
                "lead_id": lead_id,
                "assigned_rep": assigned_rep,
                "created_at": datetime.utcnow()
            })

    async def trigger_estimate_workflow(self, estimate_id: str, estimate_data: Dict[str, Any]):
        """Trigger workflow when estimate is created"""
        try:
            # Send estimate to client
            client_id = estimate_data.get("client_id")
            if client_id:
                client = await self.db.clients.find_one({"_id": ObjectId(client_id)})
                if client:
                    await self.email_service.send_estimate_email(
                        client["email"],
                        client["first_name"],
                        estimate_data,
                        estimate_data.get("pdf_url")
                    )
            
            # Create follow-up task for sales rep
            await self.db.tasks.insert_one({
                "estimate_id": estimate_id,
                "client_id": client_id,
                "task_type": "follow_up_estimate",
                "title": f"Follow up on estimate #{estimate_data.get('estimate_number')}",
                "description": "Check if client has questions about the estimate",
                "priority": "medium",
                "due_date": datetime.utcnow() + timedelta(days=3),
                "status": "pending",
                "created_at": datetime.utcnow()
            })
            
            # Schedule reminder emails
            await self._schedule_estimate_reminders(estimate_id, estimate_data)
            
            logger.info(f"Estimate workflow triggered for {estimate_id}")
            
        except Exception as e:
            logger.error(f"Error in estimate workflow: {e}")
    
    async def _schedule_estimate_reminders(self, estimate_id: str, estimate_data: Dict[str, Any]):
        """Schedule estimate follow-up reminders"""
        client_id = estimate_data.get("client_id")
        if not client_id:
            return
            
        client = await self.db.clients.find_one({"_id": ObjectId(client_id)})
        if not client:
            return
        
        reminders = [
            {
                "delay_days": 3,
                "subject": f"Questions about your estimate #{estimate_data.get('estimate_number')}?"
            },
            {
                "delay_days": 7,
                "subject": f"Ready to move forward with your project?"
            }
        ]
        
        for reminder in reminders:
            scheduled_email = {
                "estimate_id": estimate_id,
                "email_type": "estimate_reminder",
                "recipient_email": client["email"],
                "recipient_name": client["first_name"],
                "subject": reminder["subject"],
                "send_at": datetime.utcnow() + timedelta(days=reminder["delay_days"]),
                "status": "scheduled",
                "created_at": datetime.utcnow()
            }
            await self.db.scheduled_emails.insert_one(scheduled_email)

    async def trigger_contract_workflow(self, contract_id: str, contract_data: Dict[str, Any]):
        """Trigger workflow when contract is created"""
        try:
            # Send contract to client for signature
            client_id = contract_data.get("client_id")
            if client_id:
                client = await self.db.clients.find_one({"_id": ObjectId(client_id)})
                if client:
                    await self.email_service.send_contract_email(
                        client["email"],
                        client["first_name"],
                        contract_data,
                        contract_data.get("pdf_url")
                    )
            
            # Create project setup tasks
            await self._create_project_tasks(contract_id, contract_data)
            
            logger.info(f"Contract workflow triggered for {contract_id}")
            
        except Exception as e:
            logger.error(f"Error in contract workflow: {e}")
    
    async def _create_project_tasks(self, contract_id: str, contract_data: Dict[str, Any]):
        """Create project management tasks when contract is signed"""
        project_tasks = [
            {
                "title": "Schedule site measurement",
                "description": "Schedule precise measurements for fabrication",
                "priority": "high",
                "due_date": datetime.utcnow() + timedelta(days=3)
            },
            {
                "title": "Order materials",
                "description": "Order materials based on final measurements",
                "priority": "medium",
                "due_date": datetime.utcnow() + timedelta(days=7)
            },
            {
                "title": "Schedule fabrication",
                "description": "Schedule fabrication once materials arrive",
                "priority": "medium",
                "due_date": datetime.utcnow() + timedelta(days=14)
            },
            {
                "title": "Schedule installation",
                "description": "Schedule installation appointment with client",
                "priority": "high",
                "due_date": datetime.utcnow() + timedelta(days=21)
            }
        ]
        
        for task in project_tasks:
            task.update({
                "contract_id": contract_id,
                "task_type": "project",
                "status": "pending",
                "created_at": datetime.utcnow()
            })
            await self.db.tasks.insert_one(task)

    async def process_scheduled_emails(self):
        """Process and send scheduled emails"""
        try:
            # Find emails due for sending
            due_emails = await self.db.scheduled_emails.find({
                "status": "scheduled",
                "send_at": {"$lte": datetime.utcnow()}
            }).to_list(None)
            
            for email in due_emails:
                try:
                    await self.email_service.send_follow_up_email(
                        email["recipient_email"],
                        email["recipient_name"],
                        email["email_type"]
                    )
                    
                    # Mark as sent
                    await self.db.scheduled_emails.update_one(
                        {"_id": email["_id"]},
                        {
                            "$set": {
                                "status": "sent",
                                "sent_at": datetime.utcnow()
                            }
                        }
                    )
                    
                except Exception as e:
                    logger.error(f"Failed to send scheduled email {email['_id']}: {e}")
                    # Mark as failed
                    await self.db.scheduled_emails.update_one(
                        {"_id": email["_id"]},
                        {
                            "$set": {
                                "status": "failed",
                                "error": str(e)
                            }
                        }
                    )
            
            logger.info(f"Processed {len(due_emails)} scheduled emails")
            
        except Exception as e:
            logger.error(f"Error processing scheduled emails: {e}")

@router.post("/trigger-lead-workflow")
async def trigger_lead_workflow(
    lead_id: str,
    background_tasks: BackgroundTasks,
    db=Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Manually trigger lead workflow"""
    try:
        lead = await db.clients.find_one({"_id": ObjectId(lead_id)})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        workflow_engine = WorkflowEngine(db)
        background_tasks.add_task(workflow_engine.trigger_lead_workflow, lead_id, lead)
        
        return {"success": True, "message": "Lead workflow triggered"}
    
    except Exception as e:
        logger.error(f"Error triggering lead workflow: {e}")
        raise HTTPException(status_code=500, detail="Failed to trigger workflow")

@router.post("/process-scheduled-tasks")
async def process_scheduled_tasks(
    background_tasks: BackgroundTasks,
    db=Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Process scheduled emails and tasks"""
    workflow_engine = WorkflowEngine(db)
    background_tasks.add_task(workflow_engine.process_scheduled_emails)
    
    return {"success": True, "message": "Scheduled tasks processing started"}

@router.get("/workflow-stats")
async def get_workflow_stats(
    db=Depends(get_database),
    current_user: User = Depends(get_current_active_user)
):
    """Get workflow automation statistics"""
    stats = {
        "pending_tasks": await db.tasks.count_documents({"status": "pending"}),
        "scheduled_emails": await db.scheduled_emails.count_documents({"status": "scheduled"}),
        "completed_workflows": await db.tasks.count_documents({"status": "completed"}),
        "failed_emails": await db.scheduled_emails.count_documents({"status": "failed"})
    }
    
    return stats
