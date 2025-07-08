import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import aiofiles
import requests
from decouple import config
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_host = config("SMTP_HOST")
        self.smtp_port = int(config("SMTP_PORT"))
        self.smtp_username = config("SMTP_USERNAME")
        self.smtp_password = config("SMTP_PASSWORD")

    async def send_estimate_email(
        self,
        to_email: str,
        client_name: str,
        estimate_data: Dict[str, Any],
        pdf_url: Optional[str] = None
    ):
        """Send estimate email to client"""
        try:
            subject = f"Estimate #{estimate_data.get('estimate_number')} - {estimate_data.get('title')}"
            
            # Create email content
            html_body = f"""
            <html>
                <head></head>
                <body>
                    <h2>Hello {client_name},</h2>
                    
                    <p>Thank you for your interest in our services. Please find your estimate attached.</p>
                    
                    <h3>Estimate Details:</h3>
                    <ul>
                        <li><strong>Estimate Number:</strong> {estimate_data.get('estimate_number')}</li>
                        <li><strong>Project:</strong> {estimate_data.get('title')}</li>
                        <li><strong>Total Amount:</strong> ${estimate_data.get('total', 0):.2f}</li>
                        <li><strong>Valid Until:</strong> {estimate_data.get('valid_until', 'N/A')}</li>
                    </ul>
                    
                    <p>If you have any questions or would like to proceed with this estimate, please don't hesitate to contact us.</p>
                    
                    <p>Best regards,<br/>
                    Your Company Name<br/>
                    (555) 123-4567<br/>
                    info@yourcompany.com</p>
                </body>
            </html>
            """
            
            # Send email with PDF attachment
            await self._send_email_with_attachment(
                to_email=to_email,
                subject=subject,
                html_body=html_body,
                attachment_url=pdf_url,
                attachment_name=f"Estimate_{estimate_data.get('estimate_number')}.pdf"
            )
            
            logger.info(f"Estimate email sent to {to_email}")
        
        except Exception as e:
            logger.error(f"Error sending estimate email: {e}")
            raise

    async def send_contract_email(
        self,
        to_email: str,
        client_name: str,
        contract_data: Dict[str, Any],
        pdf_url: Optional[str] = None
    ):
        """Send contract email to client"""
        try:
            subject = f"Contract #{contract_data.get('contract_number')} - {contract_data.get('title')}"
            
            html_body = f"""
            <html>
                <head></head>
                <body>
                    <h2>Hello {client_name},</h2>
                    
                    <p>Your contract is ready for review and signature. Please find the contract attached.</p>
                    
                    <h3>Contract Details:</h3>
                    <ul>
                        <li><strong>Contract Number:</strong> {contract_data.get('contract_number')}</li>
                        <li><strong>Project:</strong> {contract_data.get('title')}</li>
                        <li><strong>Total Amount:</strong> ${contract_data.get('total', 0):.2f}</li>
                        <li><strong>Deposit Required:</strong> ${contract_data.get('deposit_amount', 0):.2f}</li>
                        <li><strong>Start Date:</strong> {contract_data.get('start_date', 'TBD')}</li>
                    </ul>
                    
                    <p>Please review the contract and let us know if you have any questions. To proceed, please sign and return the contract along with the deposit payment.</p>
                    
                    <p>Best regards,<br/>
                    Your Company Name<br/>
                    (555) 123-4567<br/>
                    info@yourcompany.com</p>
                </body>
            </html>
            """
            
            await self._send_email_with_attachment(
                to_email=to_email,
                subject=subject,
                html_body=html_body,
                attachment_url=pdf_url,
                attachment_name=f"Contract_{contract_data.get('contract_number')}.pdf"
            )
            
            logger.info(f"Contract email sent to {to_email}")
        
        except Exception as e:
            logger.error(f"Error sending contract email: {e}")
            raise

    async def send_payment_confirmation_email(
        self,
        to_email: str,
        client_name: str,
        payment_data: Dict[str, Any]
    ):
        """Send payment confirmation email"""
        try:
            subject = f"Payment Confirmation - {payment_data.get('description', 'Payment')}"
            
            html_body = f"""
            <html>
                <head></head>
                <body>
                    <h2>Hello {client_name},</h2>
                    
                    <p>We have successfully received your payment. Thank you!</p>
                    
                    <h3>Payment Details:</h3>
                    <ul>
                        <li><strong>Amount:</strong> ${payment_data.get('amount', 0):.2f}</li>
                        <li><strong>Payment Method:</strong> {payment_data.get('payment_method', 'Card')}</li>
                        <li><strong>Transaction ID:</strong> {payment_data.get('transaction_id', 'N/A')}</li>
                        <li><strong>Date:</strong> {payment_data.get('date', 'N/A')}</li>
                    </ul>
                    
                    <p>If you have any questions about this payment, please contact us.</p>
                    
                    <p>Best regards,<br/>
                    Your Company Name<br/>
                    (555) 123-4567<br/>
                    info@yourcompany.com</p>
                </body>
            </html>
            """
            
            await self._send_email(
                to_email=to_email,
                subject=subject,
                html_body=html_body
            )
            
            logger.info(f"Payment confirmation email sent to {to_email}")
        
        except Exception as e:
            logger.error(f"Error sending payment confirmation email: {e}")
            raise

    async def send_notification_email(
        self,
        to_email: str,
        subject: str,
        message: str,
        is_html: bool = False
    ):
        """Send general notification email"""
        try:
            if is_html:
                await self._send_email(to_email, subject, html_body=message)
            else:
                await self._send_email(to_email, subject, text_body=message)
            
            logger.info(f"Notification email sent to {to_email}")
        
        except Exception as e:
            logger.error(f"Error sending notification email: {e}")
            raise

    async def send_welcome_email(
        self,
        to_email: str,
        client_name: str,
        lead_info: Dict[str, Any]
    ):
        """Send welcome email to new leads"""
        try:
            subject = f"Thank you for your interest, {client_name}!"
            
            html_body = f"""
            <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .header {{ background-color: #f8f9fa; padding: 20px; text-align: center; }}
                        .content {{ padding: 20px; }}
                        .highlight {{ background-color: #e9ecef; padding: 15px; border-radius: 5px; }}
                        .button {{ background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }}
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>Welcome to StoneCraft Granite & Countertops!</h2>
                    </div>
                    
                    <div class="content">
                        <h3>Hello {client_name},</h3>
                        
                        <p>Thank you for your interest in our {lead_info.get('project_type', 'renovation')} services! We're excited to help bring your vision to life.</p>
                        
                        <div class="highlight">
                            <h4>What happens next?</h4>
                            <ul>
                                <li>Our team will review your project details</li>
                                <li>We'll contact you within 24 hours to discuss your needs</li>
                                <li>We'll schedule a free consultation at your convenience</li>
                                <li>You'll receive a detailed estimate within 48 hours of consultation</li>
                            </ul>
                        </div>
                        
                        <h4>Your Project Details:</h4>
                        <ul>
                            <li><strong>Project Type:</strong> {lead_info.get('project_type', 'N/A')}</li>
                            <li><strong>Timeline:</strong> {lead_info.get('timeline', 'N/A')}</li>
                            <li><strong>Description:</strong> {lead_info.get('project_description', 'N/A')}</li>
                        </ul>
                        
                        <p>In the meantime, feel free to browse our portfolio and learn more about our services:</p>
                        
                        <p style="text-align: center;">
                            <a href="https://yourwebsite.com/portfolio" class="button">View Our Portfolio</a>
                        </p>
                        
                        <p>If you have any immediate questions, don't hesitate to contact us:</p>
                        <ul>
                            <li>📞 Phone: (555) 123-4567</li>
                            <li>📧 Email: info@yourcompany.com</li>
                            <li>🌐 Website: www.yourcompany.com</li>
                        </ul>
                        
                        <p>Best regards,<br/>
                        The StoneCraft Team</p>
                    </div>
                </body>
            </html>
            """
            
            await self._send_email(
                to_email=to_email,
                subject=subject,
                html_body=html_body
            )
            
            logger.info(f"Welcome email sent to {to_email}")
        
        except Exception as e:
            logger.error(f"Error sending welcome email: {e}")
            raise

    async def send_follow_up_email(
        self,
        to_email: str,
        client_name: str,
        follow_up_type: str = "general",
        custom_message: str = None
    ):
        """Send follow-up emails based on type"""
        try:
            templates = {
                "initial": {
                    "subject": f"Following up on your {client_name} project",
                    "message": "We wanted to follow up on your recent inquiry. Are you still interested in moving forward with your project?"
                },
                "consultation": {
                    "subject": f"Ready to schedule your consultation, {client_name}?",
                    "message": "We're ready to schedule your free consultation. When would be a good time for you?"
                },
                "estimate": {
                    "subject": f"Your estimate is ready, {client_name}!",
                    "message": "We've prepared your detailed estimate. Would you like to schedule a time to review it together?"
                },
                "contract": {
                    "subject": f"Contract signing - {client_name}",
                    "message": "Your contract is ready for signature. We're excited to get started on your project!"
                }
            }
            
            template = templates.get(follow_up_type, templates["initial"])
            subject = template["subject"]
            message = custom_message or template["message"]
            
            html_body = f"""
            <html>
                <head></head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h3>Hello {client_name},</h3>
                    
                    <p>{message}</p>
                    
                    <p>We're here to answer any questions you might have about:</p>
                    <ul>
                        <li>Materials and design options</li>
                        <li>Timeline and scheduling</li>
                        <li>Pricing and payment options</li>
                        <li>Installation process</li>
                    </ul>
                    
                    <p>Please reply to this email or call us at (555) 123-4567 to discuss your project further.</p>
                    
                    <p>Best regards,<br/>
                    The StoneCraft Team</p>
                </body>
            </html>
            """
            
            await self._send_email(
                to_email=to_email,
                subject=subject,
                html_body=html_body
            )
            
            logger.info(f"Follow-up email ({follow_up_type}) sent to {to_email}")
        
        except Exception as e:
            logger.error(f"Error sending follow-up email: {e}")
            raise

    async def send_payment_reminder(
        self,
        to_email: str,
        client_name: str,
        invoice_data: Dict[str, Any],
        reminder_type: str = "gentle"
    ):
        """Send payment reminder emails"""
        try:
            templates = {
                "gentle": {
                    "subject": f"Payment Reminder - Invoice #{invoice_data.get('invoice_number')}",
                    "tone": "friendly"
                },
                "urgent": {
                    "subject": f"URGENT: Payment Overdue - Invoice #{invoice_data.get('invoice_number')}",
                    "tone": "urgent"
                },
                "final": {
                    "subject": f"FINAL NOTICE - Invoice #{invoice_data.get('invoice_number')}",
                    "tone": "final"
                }
            }
            
            template = templates.get(reminder_type, templates["gentle"])
            subject = template["subject"]
            
            html_body = f"""
            <html>
                <head></head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h3>Hello {client_name},</h3>
                    
                    <p>This is a {"friendly" if reminder_type == "gentle" else "urgent"} reminder that payment for your invoice is {"approaching its due date" if reminder_type == "gentle" else "overdue"}.</p>
                    
                    <h4>Invoice Details:</h4>
                    <ul>
                        <li><strong>Invoice Number:</strong> {invoice_data.get('invoice_number')}</li>
                        <li><strong>Amount Due:</strong> ${invoice_data.get('amount', 0):.2f}</li>
                        <li><strong>Due Date:</strong> {invoice_data.get('due_date')}</li>
                    </ul>
                    
                    <p>You can pay your invoice online using our secure payment portal:</p>
                    <p><a href="{invoice_data.get('payment_link', '#')}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Pay Now</a></p>
                    
                    <p>If you have any questions about this invoice or need to discuss payment arrangements, please contact us immediately.</p>
                    
                    <p>Thank you for your business!</p>
                    
                    <p>Best regards,<br/>
                    StoneCraft Billing Department<br/>
                    (555) 123-4567</p>
                </body>
            </html>
            """
            
            await self._send_email(
                to_email=to_email,
                subject=subject,
                html_body=html_body
            )
            
            logger.info(f"Payment reminder ({reminder_type}) sent to {to_email}")
        
        except Exception as e:
            logger.error(f"Error sending payment reminder: {e}")
            raise

    async def _send_email(
        self,
        to_email: str,
        subject: str,
        html_body: str,
        attachments: list = None
    ):
        """Send email using SMTP"""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.smtp_username
            msg['To'] = to_email
            
            # Add HTML content
            html_part = MIMEText(html_body, 'html')
            msg.attach(html_part)
            
            # Add attachments if provided
            if attachments:
                for attachment in attachments:
                    msg.attach(attachment)
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to_email}")
        
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            raise
