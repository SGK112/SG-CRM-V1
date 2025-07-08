from twilio.rest import Client
from decouple import config
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class SMSService:
    def __init__(self):
        self.account_sid = config("TWILIO_ACCOUNT_SID", default="")
        self.auth_token = config("TWILIO_AUTH_TOKEN", default="")
        self.phone_number = config("TWILIO_PHONE_NUMBER", default="")
        
        if self.account_sid and self.auth_token:
            self.client = Client(self.account_sid, self.auth_token)
        else:
            self.client = None
            logger.warning("Twilio credentials not configured - SMS service disabled")

    async def send_welcome_sms(self, to_phone: str, client_name: str):
        """Send welcome SMS to new leads"""
        if not self.client:
            logger.warning("SMS service not configured")
            return False
        
        try:
            message = f"Hi {client_name}! Thanks for your interest in our services. We'll contact you within 24 hours to discuss your project. - StoneCraft Team"
            
            self.client.messages.create(
                body=message,
                from_=self.phone_number,
                to=to_phone
            )
            
            logger.info(f"Welcome SMS sent to {to_phone}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send welcome SMS to {to_phone}: {e}")
            return False

    async def send_appointment_reminder(self, to_phone: str, client_name: str, appointment_time: str):
        """Send appointment reminder SMS"""
        if not self.client:
            logger.warning("SMS service not configured")
            return False
        
        try:
            message = f"Hi {client_name}, this is a reminder about your consultation appointment tomorrow at {appointment_time}. Reply CONFIRM to confirm or call us to reschedule. - StoneCraft"
            
            self.client.messages.create(
                body=message,
                from_=self.phone_number,
                to=to_phone
            )
            
            logger.info(f"Appointment reminder SMS sent to {to_phone}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send appointment reminder to {to_phone}: {e}")
            return False

    async def send_estimate_notification(self, to_phone: str, client_name: str, estimate_number: str):
        """Send estimate ready notification SMS"""
        if not self.client:
            logger.warning("SMS service not configured")
            return False
        
        try:
            message = f"Hi {client_name}, your estimate #{estimate_number} is ready! Check your email for details or call us at (555) 123-4567. - StoneCraft"
            
            self.client.messages.create(
                body=message,
                from_=self.phone_number,
                to=to_phone
            )
            
            logger.info(f"Estimate notification SMS sent to {to_phone}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send estimate notification to {to_phone}: {e}")
            return False

    async def send_contract_reminder(self, to_phone: str, client_name: str, contract_number: str):
        """Send contract signing reminder SMS"""
        if not self.client:
            logger.warning("SMS service not configured")
            return False
        
        try:
            message = f"Hi {client_name}, your contract #{contract_number} is ready for signature. Please check your email or call us to schedule signing. - StoneCraft"
            
            self.client.messages.create(
                body=message,
                from_=self.phone_number,
                to=to_phone
            )
            
            logger.info(f"Contract reminder SMS sent to {to_phone}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send contract reminder to {to_phone}: {e}")
            return False

    async def send_payment_reminder(self, to_phone: str, client_name: str, amount: float, due_date: str):
        """Send payment reminder SMS"""
        if not self.client:
            logger.warning("SMS service not configured")
            return False
        
        try:
            message = f"Hi {client_name}, friendly reminder: Payment of ${amount:.2f} is due on {due_date}. Pay online or call (555) 123-4567. Thanks! - StoneCraft"
            
            self.client.messages.create(
                body=message,
                from_=self.phone_number,
                to=to_phone
            )
            
            logger.info(f"Payment reminder SMS sent to {to_phone}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send payment reminder to {to_phone}: {e}")
            return False

    async def send_project_update(self, to_phone: str, client_name: str, update_message: str):
        """Send project status update SMS"""
        if not self.client:
            logger.warning("SMS service not configured")
            return False
        
        try:
            message = f"Hi {client_name}, project update: {update_message} Have questions? Call (555) 123-4567. - StoneCraft"
            
            self.client.messages.create(
                body=message,
                from_=self.phone_number,
                to=to_phone
            )
            
            logger.info(f"Project update SMS sent to {to_phone}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send project update to {to_phone}: {e}")
            return False

    async def send_custom_sms(self, to_phone: str, message: str):
        """Send custom SMS message"""
        if not self.client:
            logger.warning("SMS service not configured")
            return False
        
        try:
            # Add company signature if not present
            if "StoneCraft" not in message:
                message += " - StoneCraft"
            
            self.client.messages.create(
                body=message,
                from_=self.phone_number,
                to=to_phone
            )
            
            logger.info(f"Custom SMS sent to {to_phone}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send custom SMS to {to_phone}: {e}")
            return False

    def is_configured(self) -> bool:
        """Check if SMS service is properly configured"""
        return self.client is not None and bool(self.phone_number)

    async def get_message_history(self, phone_number: Optional[str] = None):
        """Get SMS message history"""
        if not self.client:
            return []
        
        try:
            if phone_number:
                messages = self.client.messages.list(to=phone_number, limit=50)
            else:
                messages = self.client.messages.list(limit=100)
            
            return [
                {
                    "sid": msg.sid,
                    "from": msg.from_,
                    "to": msg.to,
                    "body": msg.body,
                    "status": msg.status,
                    "date_sent": msg.date_sent.isoformat() if msg.date_sent else None,
                    "date_created": msg.date_created.isoformat() if msg.date_created else None
                }
                for msg in messages
            ]
            
        except Exception as e:
            logger.error(f"Failed to get message history: {e}")
            return []
