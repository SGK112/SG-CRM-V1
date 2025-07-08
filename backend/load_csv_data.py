#!/usr/bin/env python3
"""
Script to load vendor data from CSV file into MongoDB
"""
import asyncio
import pandas as pd
import sys
import os
from datetime import datetime

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import connect_to_mongo, get_database
from app.models.vendor import Vendor, ContactInfo, Address, PricingInfo

async def load_csv_data():
    """Load vendor data from CSV file"""
    try:
        # Connect to database
        await connect_to_mongo()
        db = await get_database()
        
        # Read CSV file
        csv_path = "/workspaces/SG-CRM-V1/Ai chat price list 2025 - Sheet1 (11).csv"
        
        if not os.path.exists(csv_path):
            print(f"CSV file not found: {csv_path}")
            return
        
        df = pd.read_csv(csv_path)
        print(f"Loaded {len(df)} rows from CSV")
        
        # Display column names for debugging
        print("CSV Columns:", df.columns.tolist())
        print("First few rows:")
        print(df.head())
        
        vendors_created = 0
        
        # Process each row
        for index, row in df.iterrows():
            try:
                # Extract vendor information from the row
                # You'll need to adjust these column names based on your actual CSV structure
                
                # Try to identify relevant columns
                name_col = None
                price_col = None
                service_col = None
                
                for col in df.columns:
                    col_lower = col.lower()
                    if any(word in col_lower for word in ['name', 'vendor', 'company']):
                        name_col = col
                    elif any(word in col_lower for word in ['price', 'cost', 'rate']):
                        price_col = col
                    elif any(word in col_lower for word in ['service', 'item', 'description']):
                        service_col = col
                
                # Create vendor record
                vendor_name = str(row[name_col]).strip() if name_col and pd.notna(row[name_col]) else f"Vendor {index + 1}"
                
                # Skip if vendor name is empty or invalid
                if not vendor_name or vendor_name == "nan":
                    continue
                
                # Check if vendor already exists
                existing_vendor = await db.vendors.find_one({"name": vendor_name})
                if existing_vendor:
                    print(f"Vendor '{vendor_name}' already exists, skipping...")
                    continue
                
                # Create pricing info if available
                pricing = []
                if price_col and service_col and pd.notna(row[price_col]) and pd.notna(row[service_col]):
                    try:
                        price = float(str(row[price_col]).replace('$', '').replace(',', ''))
                        service = str(row[service_col]).strip()
                        
                        pricing_info = PricingInfo(
                            item_name=service,
                            price=price,
                            unit="each",
                            description=service
                        )
                        pricing.append(pricing_info)
                    except (ValueError, TypeError):
                        pass
                
                # Create vendor object
                vendor = Vendor(
                    name=vendor_name,
                    company_name=vendor_name,
                    category="imported",
                    specialties=["General Services"],
                    contact_info=ContactInfo(),
                    address=Address(),
                    pricing=pricing,
                    is_active=True,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                
                # Insert into database
                result = await db.vendors.insert_one(vendor.dict(by_alias=True))
                vendors_created += 1
                print(f"Created vendor: {vendor_name}")
                
            except Exception as e:
                print(f"Error processing row {index}: {e}")
                continue
        
        print(f"\nSuccessfully created {vendors_created} vendors from CSV data")
        
    except Exception as e:
        print(f"Error loading CSV data: {e}")

if __name__ == "__main__":
    asyncio.run(load_csv_data())
