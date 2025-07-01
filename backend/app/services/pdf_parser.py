import PyPDF2
import re
from typing import List, Dict, Any
import logging
from io import BytesIO

logger = logging.getLogger(__name__)

class PDFParser:
    def __init__(self):
        self.pricing_patterns = [
            # Pattern for "Item - $Price" format
            r'([A-Za-z0-9\s\-\.]+)\s*[-–—]\s*\$?(\d+(?:\.\d{2})?)',
            # Pattern for "Item: $Price" format
            r'([A-Za-z0-9\s\-\.]+):\s*\$?(\d+(?:\.\d{2})?)',
            # Pattern for tabular data
            r'([A-Za-z0-9\s\-\.]+)\s+\$?(\d+(?:\.\d{2})?)\s*(?:ea|each|per|unit)?',
            # Pattern for "Price: $XX.XX Item" format
            r'\$?(\d+(?:\.\d{2})?)\s+([A-Za-z0-9\s\-\.]+)',
        ]
        
        self.unit_patterns = [
            r'(\d+(?:\.\d+)?)\s*(sq\s?ft|square\s?feet?|linear\s?ft?|lf|each|ea|per|unit|lb|pound|gallon|gal)',
            r'(sq\s?ft|square\s?feet?|linear\s?ft?|lf|each|ea|per|unit|lb|pound|gallon|gal)\s*(\d+(?:\.\d+)?)',
        ]

    async def extract_data_from_pdf(self, pdf_content: bytes) -> Dict[str, Any]:
        """Extract all data from PDF"""
        try:
            text = self._extract_text_from_pdf(pdf_content)
            
            return {
                "text": text,
                "pricing_data": await self.extract_pricing_from_text(text),
                "contact_info": self._extract_contact_info(text),
                "company_info": self._extract_company_info(text)
            }
        except Exception as e:
            logger.error(f"Error extracting data from PDF: {e}")
            return {"error": str(e)}

    async def extract_pricing_from_pdf(self, pdf_content: bytes) -> List[Dict[str, Any]]:
        """Extract pricing information from PDF"""
        try:
            text = self._extract_text_from_pdf(pdf_content)
            return await self.extract_pricing_from_text(text)
        except Exception as e:
            logger.error(f"Error extracting pricing from PDF: {e}")
            return []

    def _extract_text_from_pdf(self, pdf_content: bytes) -> str:
        """Extract text from PDF bytes"""
        try:
            pdf_file = BytesIO(pdf_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            
            return text
        except Exception as e:
            logger.error(f"Error reading PDF: {e}")
            raise

    async def extract_pricing_from_text(self, text: str) -> List[Dict[str, Any]]:
        """Extract pricing information from text"""
        pricing_items = []
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Try each pricing pattern
            for pattern in self.pricing_patterns:
                matches = re.finditer(pattern, line, re.IGNORECASE)
                for match in matches:
                    if len(match.groups()) >= 2:
                        item_name = match.group(1).strip()
                        price_str = match.group(2).strip()
                        
                        # Skip if item name is too short or looks like a number
                        if len(item_name) < 3 or item_name.isdigit():
                            continue
                        
                        try:
                            price = float(price_str)
                            
                            # Extract unit information
                            unit = self._extract_unit(line)
                            
                            pricing_item = {
                                "item_name": item_name,
                                "price": price,
                                "unit": unit,
                                "description": line,
                                "category": self._guess_category(item_name)
                            }
                            
                            # Avoid duplicates
                            if not any(item["item_name"].lower() == item_name.lower() for item in pricing_items):
                                pricing_items.append(pricing_item)
                        
                        except ValueError:
                            continue
        
        return pricing_items

    def _extract_unit(self, text: str) -> str:
        """Extract unit from text"""
        for pattern in self.unit_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                # Return the unit part of the match
                groups = match.groups()
                for group in groups:
                    if not group.replace('.', '').isdigit():
                        return group.strip()
        return "each"

    def _extract_contact_info(self, text: str) -> Dict[str, str]:
        """Extract contact information from text"""
        contact_info = {}
        
        # Email pattern
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        if emails:
            contact_info["email"] = emails[0]
        
        # Phone pattern
        phone_pattern = r'(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})'
        phones = re.findall(phone_pattern, text)
        if phones:
            contact_info["phone"] = phones[0]
        
        # Website pattern
        website_pattern = r'(https?://[^\s]+|www\.[^\s]+)'
        websites = re.findall(website_pattern, text)
        if websites:
            contact_info["website"] = websites[0]
        
        return contact_info

    def _extract_company_info(self, text: str) -> Dict[str, str]:
        """Extract company information from text"""
        company_info = {}
        lines = text.split('\n')
        
        # Look for company name (usually in the first few lines)
        for i, line in enumerate(lines[:5]):
            line = line.strip()
            if line and len(line) > 5 and not re.search(r'\d{3}[-.\s]?\d{3}[-.\s]?\d{4}', line):
                if not company_info.get("name"):
                    company_info["name"] = line
                break
        
        # Look for address patterns
        address_pattern = r'\d+\s+[A-Za-z0-9\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)'
        addresses = re.findall(address_pattern, text, re.IGNORECASE)
        if addresses:
            company_info["address"] = addresses[0]
        
        return company_info

    def _guess_category(self, item_name: str) -> str:
        """Guess category based on item name"""
        categories = {
            "materials": ["lumber", "wood", "steel", "concrete", "brick", "stone", "tile", "roofing", "siding"],
            "labor": ["install", "labor", "work", "service", "repair", "maintenance"],
            "electrical": ["wire", "outlet", "switch", "panel", "fixture", "electrical"],
            "plumbing": ["pipe", "faucet", "toilet", "sink", "plumbing", "water"],
            "hvac": ["duct", "hvac", "heating", "cooling", "air", "ventilation"],
            "tools": ["tool", "equipment", "machinery", "rental"]
        }
        
        item_lower = item_name.lower()
        for category, keywords in categories.items():
            if any(keyword in item_lower for keyword in keywords):
                return category
        
        return "other"
