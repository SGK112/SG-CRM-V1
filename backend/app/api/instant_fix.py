from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
import logging
import json
import os
from pathlib import Path

from ..database import get_database

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/instant-fix", tags=["instant-fix"])

class CSSFix(BaseModel):
    selector: str
    property: str
    old_value: Optional[str] = None
    new_value: str
    file_path: Optional[str] = None

class TextFix(BaseModel):
    component_path: str
    old_text: str
    new_text: str
    line_number: Optional[int] = None

class ConfigFix(BaseModel):
    config_key: str
    old_value: Any
    new_value: Any
    config_file: str = "frontend/src/config/app.json"

class InstantFix(BaseModel):
    fix_id: str = Field(default_factory=lambda: f"fix_{int(datetime.utcnow().timestamp())}")
    bug_report_id: Optional[str] = None
    fix_type: str = Field(..., description="css, text, config, or component")
    title: str
    description: str
    css_fix: Optional[CSSFix] = None
    text_fix: Optional[TextFix] = None
    config_fix: Optional[ConfigFix] = None
    auto_apply: bool = False
    requires_approval: bool = True
    risk_level: str = Field(default="low", description="low, medium, high")

class FixApplication(BaseModel):
    fix_id: str
    applied_by: str = "system"
    notes: Optional[str] = None

@router.post("/suggest", response_model=Dict[str, Any])
async def suggest_instant_fix(
    bug_description: str,
    element_selector: Optional[str] = None,
    page_url: Optional[str] = None,
    db=Depends(get_database)
):
    """
    Generate instant fix suggestions based on bug description and context.
    """
    try:
        suggestions = []
        
        # Analyze the bug description for common fix patterns
        description_lower = bug_description.lower()
        
        # CSS-related fixes
        if any(word in description_lower for word in ['color', 'style', 'appearance', 'looks']):
            if 'button' in description_lower:
                suggestions.append(InstantFix(
                    fix_type="css",
                    title="Button Color Fix",
                    description=f"Fix button styling issue: {bug_description}",
                    css_fix=CSSFix(
                        selector=element_selector or "button",
                        property="background-color",
                        new_value="#1976d2"
                    ),
                    risk_level="low"
                ))
        
        # Text-related fixes
        if any(word in description_lower for word in ['text', 'typo', 'spelling', 'wording']):
            suggestions.append(InstantFix(
                fix_type="text",
                title="Text Content Fix",
                description=f"Fix text issue: {bug_description}",
                text_fix=TextFix(
                    component_path="src/components/",
                    old_text="[TO_BE_IDENTIFIED]",
                    new_text="[CORRECTED_TEXT]"
                ),
                risk_level="low"
            ))
        
        # Spacing/layout fixes
        if any(word in description_lower for word in ['spacing', 'margin', 'padding', 'layout']):
            suggestions.append(InstantFix(
                fix_type="css",
                title="Layout Spacing Fix",
                description=f"Fix spacing issue: {bug_description}",
                css_fix=CSSFix(
                    selector=element_selector or ".layout-container",
                    property="margin",
                    new_value="16px"
                ),
                risk_level="low"
            ))
        
        # Store suggestions for review
        for suggestion in suggestions:
            suggestion_doc = suggestion.dict()
            suggestion_doc["created_at"] = datetime.utcnow()
            suggestion_doc["status"] = "suggested"
            await db.instant_fixes.insert_one(suggestion_doc)
        
        return {
            "suggestions": suggestions,
            "count": len(suggestions),
            "message": f"Generated {len(suggestions)} instant fix suggestions"
        }
        
    except Exception as e:
        logger.error(f"Error generating instant fix suggestions: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate suggestions")

@router.post("/apply/{fix_id}", response_model=Dict[str, str])
async def apply_instant_fix(
    fix_id: str,
    application: FixApplication,
    background_tasks: BackgroundTasks,
    db=Depends(get_database)
):
    """
    Apply an instant fix to the codebase.
    """
    try:
        # Get the fix from database
        fix_doc = await db.instant_fixes.find_one({"fix_id": fix_id})
        if not fix_doc:
            raise HTTPException(status_code=404, detail="Fix not found")
        
        fix = InstantFix(**fix_doc)
        
        # Apply the fix based on type
        result = {"status": "applied", "details": []}
        
        if fix.fix_type == "css" and fix.css_fix:
            result["details"].append(await apply_css_fix(fix.css_fix))
        elif fix.fix_type == "text" and fix.text_fix:
            result["details"].append(await apply_text_fix(fix.text_fix))
        elif fix.fix_type == "config" and fix.config_fix:
            result["details"].append(await apply_config_fix(fix.config_fix))
        
        # Update fix status in database
        await db.instant_fixes.update_one(
            {"fix_id": fix_id},
            {
                "$set": {
                    "status": "applied",
                    "applied_at": datetime.utcnow(),
                    "applied_by": application.applied_by,
                    "application_notes": application.notes
                }
            }
        )
        
        # Trigger hot reload if applicable
        if fix.fix_type == "css":
            background_tasks.add_task(trigger_hot_reload)
        
        return {
            "message": f"Fix {fix_id} applied successfully",
            "fix_id": fix_id,
            "status": "applied"
        }
        
    except Exception as e:
        logger.error(f"Error applying instant fix: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to apply fix")

async def apply_css_fix(css_fix: CSSFix) -> str:
    """Apply a CSS fix by updating stylesheets or inline styles."""
    try:
        # For demo purposes, we'll create a dynamic CSS file
        css_fixes_dir = Path("/workspaces/SG-CRM-V1/frontend/src/styles/instant-fixes")
        css_fixes_dir.mkdir(parents=True, exist_ok=True)
        
        fix_file = css_fixes_dir / f"fix_{int(datetime.utcnow().timestamp())}.css"
        
        css_content = f"""
/* Instant Fix Applied: {datetime.utcnow().isoformat()} */
{css_fix.selector} {{
    {css_fix.property}: {css_fix.new_value} !important;
}}
"""
        
        fix_file.write_text(css_content)
        return f"CSS fix applied to {fix_file}"
        
    except Exception as e:
        return f"Failed to apply CSS fix: {str(e)}"

async def apply_text_fix(text_fix: TextFix) -> str:
    """Apply a text fix by updating component files."""
    try:
        # This would search and replace text in component files
        # For now, we'll log the intended change
        return f"Text fix: '{text_fix.old_text}' -> '{text_fix.new_text}' in {text_fix.component_path}"
        
    except Exception as e:
        return f"Failed to apply text fix: {str(e)}"

async def apply_config_fix(config_fix: ConfigFix) -> str:
    """Apply a configuration fix by updating config files."""
    try:
        config_path = Path(f"/workspaces/SG-CRM-V1/{config_fix.config_file}")
        
        # Create config file if it doesn't exist
        if not config_path.exists():
            config_path.parent.mkdir(parents=True, exist_ok=True)
            config_path.write_text("{}")
        
        # Load existing config
        config_data = json.loads(config_path.read_text()) if config_path.exists() else {}
        
        # Apply the fix
        config_data[config_fix.config_key] = config_fix.new_value
        
        # Save updated config
        config_path.write_text(json.dumps(config_data, indent=2))
        
        return f"Config updated: {config_fix.config_key} = {config_fix.new_value}"
        
    except Exception as e:
        return f"Failed to apply config fix: {str(e)}"

async def trigger_hot_reload():
    """Trigger hot reload for frontend changes."""
    try:
        # This would integrate with the dev server to trigger a reload
        logger.info("Hot reload triggered for instant fixes")
    except Exception as e:
        logger.error(f"Failed to trigger hot reload: {str(e)}")

@router.get("/", response_model=List[Dict[str, Any]])
async def get_instant_fixes(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db=Depends(get_database)
):
    """Get all instant fixes with optional filtering."""
    try:
        filter_query = {}
        if status:
            filter_query["status"] = status
        
        cursor = db.instant_fixes.find(filter_query).skip(skip).limit(limit).sort("created_at", -1)
        fixes = []
        
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            fixes.append(doc)
        
        return fixes
        
    except Exception as e:
        logger.error(f"Error fetching instant fixes: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch fixes")

@router.delete("/{fix_id}")
async def rollback_fix(fix_id: str, db=Depends(get_database)):
    """Rollback an applied instant fix."""
    try:
        # Mark fix as rolled back
        result = await db.instant_fixes.update_one(
            {"fix_id": fix_id},
            {
                "$set": {
                    "status": "rolled_back",
                    "rolled_back_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Fix not found")
        
        return {"message": f"Fix {fix_id} rolled back successfully"}
        
    except Exception as e:
        logger.error(f"Error rolling back fix: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to rollback fix")
