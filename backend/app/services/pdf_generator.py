from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from datetime import datetime
from typing import Dict, Any
import io
import cloudinary.uploader
from decouple import config
import logging

logger = logging.getLogger(__name__)

class PDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()

    def _setup_custom_styles(self):
        """Setup custom paragraph styles"""
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        ))
        
        self.styles.add(ParagraphStyle(
            name='CompanyInfo',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=6,
            alignment=TA_RIGHT
        ))
        
        self.styles.add(ParagraphStyle(
            name='ClientInfo',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=6,
            alignment=TA_LEFT
        ))

    async def generate_estimate_pdf(self, estimate_data: Dict[str, Any]) -> str:
        """Generate PDF for estimate and upload to Cloudinary"""
        try:
            # Create PDF in memory
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch)
            story = []
            
            # Header
            story.append(Paragraph("ESTIMATE", self.styles['CustomTitle']))
            story.append(Spacer(1, 20))
            
            # Company and estimate info
            company_info = f"""
            <b>Your Company Name</b><br/>
            123 Business Street<br/>
            City, State 12345<br/>
            Phone: (555) 123-4567<br/>
            Email: info@yourcompany.com
            """
            story.append(Paragraph(company_info, self.styles['CompanyInfo']))
            story.append(Spacer(1, 20))
            
            # Estimate details table
            estimate_info_data = [
                ['Estimate #:', estimate_data.get('estimate_number', 'N/A')],
                ['Date:', datetime.now().strftime('%B %d, %Y')],
                ['Valid Until:', estimate_data.get('valid_until', 'N/A')],
                ['Status:', estimate_data.get('status', 'Draft').title()]
            ]
            
            estimate_info_table = Table(estimate_info_data, colWidths=[1.5*inch, 2*inch])
            estimate_info_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(estimate_info_table)
            story.append(Spacer(1, 30))
            
            # Client information
            client_info = f"""
            <b>Bill To:</b><br/>
            {estimate_data.get('client_name', 'N/A')}<br/>
            """
            
            if estimate_data.get('client_address'):
                addr = estimate_data['client_address']
                if addr.get('street'):
                    client_info += f"{addr['street']}<br/>"
                if addr.get('city') or addr.get('state') or addr.get('zip_code'):
                    city_state_zip = f"{addr.get('city', '')}, {addr.get('state', '')} {addr.get('zip_code', '')}"
                    client_info += f"{city_state_zip.strip()}<br/>"
            
            if estimate_data.get('client_email'):
                client_info += f"Email: {estimate_data['client_email']}<br/>"
            if estimate_data.get('client_phone'):
                client_info += f"Phone: {estimate_data['client_phone']}<br/>"
            
            story.append(Paragraph(client_info, self.styles['ClientInfo']))
            story.append(Spacer(1, 30))
            
            # Line items table
            line_items_data = [['Description', 'Qty', 'Unit', 'Unit Price', 'Total']]
            
            for item in estimate_data.get('line_items', []):
                line_items_data.append([
                    item.get('description', ''),
                    str(item.get('quantity', 0)),
                    item.get('unit', 'ea'),
                    f"${item.get('unit_price', 0):.2f}",
                    f"${item.get('total', 0):.2f}"
                ])
            
            line_items_table = Table(line_items_data, colWidths=[3*inch, 0.75*inch, 0.75*inch, 1*inch, 1*inch])
            line_items_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('ALIGN', (0, 1), (0, -1), 'LEFT'),  # Left align descriptions
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            story.append(line_items_table)
            story.append(Spacer(1, 20))
            
            # Totals section
            totals_data = [
                ['Subtotal:', f"${estimate_data.get('subtotal', 0):.2f}"],
                ['Tax ({:.1f}%):'.format(estimate_data.get('tax_rate', 0)), f"${estimate_data.get('tax_amount', 0):.2f}"],
                ['TOTAL:', f"${estimate_data.get('total', 0):.2f}"]
            ]
            
            totals_table = Table(totals_data, colWidths=[4.5*inch, 1.5*inch])
            totals_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 11),
                ('LINEBELOW', (0, -1), (-1, -1), 2, colors.black),
                ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
            ]))
            story.append(totals_table)
            story.append(Spacer(1, 30))
            
            # Notes and terms
            if estimate_data.get('notes'):
                story.append(Paragraph('<b>Notes:</b>', self.styles['Normal']))
                story.append(Paragraph(estimate_data['notes'], self.styles['Normal']))
                story.append(Spacer(1, 15))
            
            if estimate_data.get('terms'):
                story.append(Paragraph('<b>Terms & Conditions:</b>', self.styles['Normal']))
                story.append(Paragraph(estimate_data['terms'], self.styles['Normal']))
            
            # Build PDF
            doc.build(story)
            buffer.seek(0)
            
            # Upload to Cloudinary
            upload_result = cloudinary.uploader.upload(
                buffer.getvalue(),
                resource_type="raw",
                folder="estimates",
                public_id=f"estimate_{estimate_data.get('estimate_number', 'unknown')}_{int(datetime.now().timestamp())}",
                format="pdf"
            )
            
            return upload_result["secure_url"]
        
        except Exception as e:
            logger.error(f"Error generating estimate PDF: {e}")
            raise

    async def generate_contract_pdf(self, contract_data: Dict[str, Any]) -> str:
        """Generate PDF for contract and upload to Cloudinary"""
        try:
            # Create PDF in memory
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch)
            story = []
            
            # Header
            story.append(Paragraph("SERVICE CONTRACT", self.styles['CustomTitle']))
            story.append(Spacer(1, 20))
            
            # Contract details
            contract_info_data = [
                ['Contract #:', contract_data.get('contract_number', 'N/A')],
                ['Date:', datetime.now().strftime('%B %d, %Y')],
                ['Start Date:', contract_data.get('start_date', 'TBD')],
                ['Completion Date:', contract_data.get('completion_date', 'TBD')]
            ]
            
            contract_info_table = Table(contract_info_data, colWidths=[1.5*inch, 2*inch])
            contract_info_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(contract_info_table)
            story.append(Spacer(1, 30))
            
            # Parties section
            story.append(Paragraph('<b>PARTIES:</b>', self.styles['Heading2']))
            story.append(Spacer(1, 10))
            
            contractor_info = """
            <b>Contractor:</b><br/>
            Your Company Name<br/>
            123 Business Street<br/>
            City, State 12345<br/>
            Phone: (555) 123-4567
            """
            story.append(Paragraph(contractor_info, self.styles['Normal']))
            story.append(Spacer(1, 15))
            
            client_info = f"""
            <b>Client:</b><br/>
            {contract_data.get('client_name', 'N/A')}<br/>
            """
            
            if contract_data.get('client_address'):
                addr = contract_data['client_address']
                if addr.get('street'):
                    client_info += f"{addr['street']}<br/>"
                if addr.get('city') or addr.get('state') or addr.get('zip_code'):
                    city_state_zip = f"{addr.get('city', '')}, {addr.get('state', '')} {addr.get('zip_code', '')}"
                    client_info += f"{city_state_zip.strip()}<br/>"
            
            story.append(Paragraph(client_info, self.styles['Normal']))
            story.append(Spacer(1, 20))
            
            # Scope of work
            if contract_data.get('scope_of_work'):
                story.append(Paragraph('<b>SCOPE OF WORK:</b>', self.styles['Heading2']))
                story.append(Paragraph(contract_data['scope_of_work'], self.styles['Normal']))
                story.append(Spacer(1, 20))
            
            # Contract amount and payment terms
            story.append(Paragraph('<b>CONTRACT AMOUNT:</b>', self.styles['Heading2']))
            
            payment_info = f"""
            Total Contract Amount: ${contract_data.get('total', 0):.2f}<br/>
            Deposit Required ({contract_data.get('deposit_percentage', 0):.0f}%): ${contract_data.get('deposit_amount', 0):.2f}<br/>
            Balance Due: ${contract_data.get('balance_due', 0):.2f}
            """
            story.append(Paragraph(payment_info, self.styles['Normal']))
            story.append(Spacer(1, 20))
            
            # Terms and conditions
            if contract_data.get('terms'):
                story.append(Paragraph('<b>TERMS & CONDITIONS:</b>', self.styles['Heading2']))
                story.append(Paragraph(contract_data['terms'], self.styles['Normal']))
                story.append(Spacer(1, 30))
            
            # Signature section
            signature_data = [
                ['Contractor Signature:', 'Date:'],
                ['', ''],
                ['', ''],
                ['Client Signature:', 'Date:'],
                ['', '']
            ]
            
            signature_table = Table(signature_data, colWidths=[4*inch, 2*inch])
            signature_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('LINEBELOW', (0, 1), (0, 1), 1, colors.black),
                ('LINEBELOW', (1, 1), (1, 1), 1, colors.black),
                ('LINEBELOW', (0, 4), (0, 4), 1, colors.black),
                ('LINEBELOW', (1, 4), (1, 4), 1, colors.black),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            story.append(signature_table)
            
            # Build PDF
            doc.build(story)
            buffer.seek(0)
            
            # Upload to Cloudinary
            upload_result = cloudinary.uploader.upload(
                buffer.getvalue(),
                resource_type="raw",
                folder="contracts",
                public_id=f"contract_{contract_data.get('contract_number', 'unknown')}_{int(datetime.now().timestamp())}",
                format="pdf"
            )
            
            return upload_result["secure_url"]
        
        except Exception as e:
            logger.error(f"Error generating contract PDF: {e}")
            raise
