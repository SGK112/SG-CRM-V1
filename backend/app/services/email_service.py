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

    async def _send_email(
        self,
        to_email: str,
        subject: str,
        text_body: Optional[str] = None,
        html_body: Optional[str] = None
    ):
        """Send basic email"""
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = self.smtp_username
        msg['To'] = to_email
        
        if text_body:
            msg.attach(MIMEText(text_body, 'plain'))
        
        if html_body:
            msg.attach(MIMEText(html_body, 'html'))
        
        # Send email
        with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
            server.starttls()
            server.login(self.smtp_username, self.smtp_password)
            server.send_message(msg)

    async def _send_email_with_attachment(
        self,
        to_email: str,
        subject: str,
        html_body: str,
        attachment_url: Optional[str] = None,
        attachment_name: str = "attachment.pdf"
    ):
        """Send email with PDF attachment from URL"""
        msg = MIMEMultipart()
        msg['Subject'] = subject
        msg['From'] = self.smtp_username
        msg['To'] = to_email
        
        # Add HTML body
        msg.attach(MIMEText(html_body, 'html'))
        
        # Add attachment if URL provided
        if attachment_url:
            try:
                # Download file from URL
                response = requests.get(attachment_url)
                response.raise_for_status()
                
                # Create attachment
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(response.content)
                encoders.encode_base64(part)
                part.add_header(
                    'Content-Disposition',
                    f'attachment; filename= {attachment_name}'
                )
                msg.attach(part)
            
            except Exception as e:
                logger.warning(f"Could not attach file: {e}")
        
        # Send email
        with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
            server.starttls()
            server.login(self.smtp_username, self.smtp_password)
            server.send_message(msg)

    async def send_welcome_email(self, to_email: str, user_name: str):
        """Send welcome email to new users"""
        subject = "Welcome to Our CRM System!"
        
        html_body = f"""
        <html>
            <head></head>
            <body>
                <h2>Welcome {user_name}!</h2>
                
                <p>Thank you for joining our CRM and Estimating platform. You can now:</p>
                
                <ul>
                    <li>Manage vendor relationships</li>
                    <li>Create professional estimates</li>
                    <li>Generate contracts</li>
                    <li>Process payments</li>
                    <li>Upload and parse PDF documents</li>
                </ul>
                
                <p>If you need any assistance getting started, please don't hesitate to contact our support team.</p>
                
                <p>Best regards,<br/>
                The CRM Team</p>
            </body>
        </html>
        """
        
        await self._send_email(to_email, subject, html_body=html_body)
