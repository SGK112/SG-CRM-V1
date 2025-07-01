from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List
import aiofiles
import os
from datetime import datetime

from app.models.user import User
from app.api.auth import get_current_active_user
from app.services.pdf_parser import PDFParser
import cloudinary.uploader
from decouple import config
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Configure Cloudinary
cloudinary.config(
    cloud_name=config("CLOUDINARY_CLOUD_NAME"),
    api_key=config("CLOUDINARY_API_KEY"),
    api_secret=config("CLOUDINARY_API_SECRET")
)

UPLOAD_DIR = "uploads"
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".gif", ".doc", ".docx"}

@router.post("/pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    vendor_id: str = Form(None),
    current_user: User = Depends(get_current_active_user)
):
    """Upload and parse PDF file"""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # Read file content
        content = await file.read()
        
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            content,
            resource_type="raw",
            folder="vendor_documents",
            public_id=f"{vendor_id}_{int(datetime.now().timestamp())}" if vendor_id else f"doc_{int(datetime.now().timestamp())}"
        )
        
        # Parse PDF content
        pdf_parser = PDFParser()
        extracted_data = await pdf_parser.extract_data_from_pdf(content)
        
        return {
            "message": "PDF uploaded and processed successfully",
            "file_url": upload_result["secure_url"],
            "extracted_data": extracted_data,
            "file_info": {
                "filename": file.filename,
                "size": len(content),
                "upload_time": datetime.utcnow().isoformat()
            }
        }
    
    except Exception as e:
        logger.error(f"Error uploading PDF: {e}")
        raise HTTPException(status_code=500, detail="Error processing PDF file")

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Upload image file to Cloudinary"""
    if not any(file.filename.lower().endswith(ext) for ext in ['.png', '.jpg', '.jpeg', '.gif']):
        raise HTTPException(status_code=400, detail="Only image files are allowed")
    
    try:
        # Read file content
        content = await file.read()
        
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            content,
            folder="images",
            public_id=f"img_{int(datetime.now().timestamp())}"
        )
        
        return {
            "message": "Image uploaded successfully",
            "file_url": upload_result["secure_url"],
            "thumbnail_url": upload_result.get("eager", [{}])[0].get("secure_url") if upload_result.get("eager") else None,
            "file_info": {
                "filename": file.filename,
                "size": len(content),
                "width": upload_result.get("width"),
                "height": upload_result.get("height"),
                "format": upload_result.get("format"),
                "upload_time": datetime.utcnow().isoformat()
            }
        }
    
    except Exception as e:
        logger.error(f"Error uploading image: {e}")
        raise HTTPException(status_code=500, detail="Error uploading image")

@router.post("/documents")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Upload general document"""
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    try:
        # Read file content
        content = await file.read()
        
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            content,
            resource_type="raw",
            folder="documents",
            public_id=f"doc_{int(datetime.now().timestamp())}"
        )
        
        return {
            "message": "Document uploaded successfully",
            "file_url": upload_result["secure_url"],
            "file_info": {
                "filename": file.filename,
                "size": len(content),
                "format": upload_result.get("format"),
                "upload_time": datetime.utcnow().isoformat()
            }
        }
    
    except Exception as e:
        logger.error(f"Error uploading document: {e}")
        raise HTTPException(status_code=500, detail="Error uploading document")

@router.post("/bulk-upload")
async def bulk_upload(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Upload multiple files at once"""
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 files allowed per upload")
    
    results = []
    
    for file in files:
        try:
            file_extension = os.path.splitext(file.filename)[1].lower()
            if file_extension not in ALLOWED_EXTENSIONS:
                results.append({
                    "filename": file.filename,
                    "status": "error",
                    "message": f"File type not allowed: {file_extension}"
                })
                continue
            
            # Read file content
            content = await file.read()
            
            # Determine resource type
            resource_type = "image" if file_extension in ['.png', '.jpg', '.jpeg', '.gif'] else "raw"
            
            # Upload to Cloudinary
            upload_result = cloudinary.uploader.upload(
                content,
                resource_type=resource_type,
                folder="bulk_uploads",
                public_id=f"bulk_{int(datetime.now().timestamp())}_{file.filename}"
            )
            
            results.append({
                "filename": file.filename,
                "status": "success",
                "file_url": upload_result["secure_url"],
                "size": len(content)
            })
        
        except Exception as e:
            logger.error(f"Error uploading {file.filename}: {e}")
            results.append({
                "filename": file.filename,
                "status": "error",
                "message": str(e)
            })
    
    return {
        "message": f"Processed {len(files)} files",
        "results": results,
        "successful_uploads": len([r for r in results if r["status"] == "success"]),
        "failed_uploads": len([r for r in results if r["status"] == "error"])
    }

@router.delete("/file")
async def delete_file(
    file_url: str,
    current_user: User = Depends(get_current_active_user)
):
    """Delete file from Cloudinary"""
    try:
        # Extract public_id from URL
        public_id = file_url.split('/')[-1].split('.')[0]
        
        # Delete from Cloudinary
        result = cloudinary.uploader.destroy(public_id)
        
        return {
            "message": "File deleted successfully",
            "result": result
        }
    
    except Exception as e:
        logger.error(f"Error deleting file: {e}")
        raise HTTPException(status_code=500, detail="Error deleting file")
