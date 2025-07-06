from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
from bson import ObjectId

from ..database import get_database

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/feedback", tags=["feedback"])

class ElementInfo(BaseModel):
    tagName: str
    className: Optional[str] = None
    id: Optional[str] = None
    textContent: Optional[str] = None
    position: Dict[str, float]
    styles: Dict[str, str]
    xpath: Optional[str] = None
    selector: Optional[str] = None

class ScreenshotInfo(BaseModel):
    viewport: Dict[str, Any]

class FeedbackAnnotation(BaseModel):
    id: int
    type: str = Field(..., description="Issue type: bug, ui, broken-link, performance, feature, improvement")
    priority: str = Field(..., description="Priority: low, medium, high, critical")
    title: str
    description: str
    element: ElementInfo
    screenshot: Optional[ScreenshotInfo] = None
    url: str
    timestamp: str
    status: str = "open"

class SessionInfo(BaseModel):
    url: str
    userAgent: str
    timestamp: str
    viewport: Dict[str, int]

class FeedbackSubmission(BaseModel):
    annotations: List[FeedbackAnnotation]
    sessionInfo: SessionInfo

class FeedbackAnalysis(BaseModel):
    id: Optional[str] = None
    submission_id: str
    analysis_type: str
    findings: List[Dict[str, Any]]
    recommendations: List[str]
    severity_score: int = Field(ge=1, le=10)
    created_at: datetime = Field(default_factory=datetime.utcnow)

@router.post("/", response_model=Dict[str, str])
async def submit_feedback(feedback: FeedbackSubmission, db=Depends(get_database)):
    """
    Submit feedback annotations from the frontend.
    This will store the feedback and trigger analysis.
    """
    try:
        # Store the feedback submission
        submission_doc = {
            "annotations": [annotation.dict() for annotation in feedback.annotations],
            "session_info": feedback.sessionInfo.dict(),
            "submitted_at": datetime.utcnow(),
            "status": "received",
            "analysis_status": "pending"
        }
        
        result = await db.feedback_submissions.insert_one(submission_doc)
        submission_id = str(result.inserted_id)
        
        # Trigger analysis (async in background)
        analysis_result = await analyze_feedback(feedback, submission_id, db)
        
        logger.info(f"Feedback submitted successfully: {submission_id}")
        
        return {
            "message": "Feedback submitted successfully",
            "submission_id": submission_id,
            "analysis_id": analysis_result.get("analysis_id") if analysis_result else None
        }
        
    except Exception as e:
        logger.error(f"Error submitting feedback: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit feedback")

@router.get("/submissions", response_model=List[Dict[str, Any]])
async def get_feedback_submissions(skip: int = 0, limit: int = 50, db=Depends(get_database)):
    """Get all feedback submissions with pagination."""
    try:
        cursor = db.feedback_submissions.find().skip(skip).limit(limit).sort("submitted_at", -1)
        submissions = []
        
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            submissions.append(doc)
            
        return submissions
        
    except Exception as e:
        logger.error(f"Error fetching feedback submissions: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch feedback submissions")

@router.get("/analysis/{submission_id}", response_model=Dict[str, Any])
async def get_feedback_analysis(submission_id: str, db=Depends(get_database)):
    """Get analysis results for a specific feedback submission."""
    try:
        analysis = await db.feedback_analysis.find_one({"submission_id": submission_id})
        
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
            
        analysis["_id"] = str(analysis["_id"])
        return analysis
        
    except Exception as e:
        logger.error(f"Error fetching feedback analysis: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch feedback analysis")

async def analyze_feedback(feedback: FeedbackSubmission, submission_id: str, db) -> Dict[str, Any]:
    """
    Analyze the submitted feedback and generate insights.
    This function categorizes issues and provides actionable recommendations.
    """
    try:
        findings = []
        recommendations = []
        severity_score = 1
        
        # Analyze each annotation
        for annotation in feedback.annotations:
            finding = analyze_single_annotation(annotation, feedback.sessionInfo)
            findings.append(finding)
            
            # Calculate severity
            priority_weights = {"low": 1, "medium": 2, "high": 3, "critical": 4}
            type_weights = {"bug": 3, "broken-link": 3, "performance": 2, "ui": 2, "feature": 1, "improvement": 1}
            
            annotation_severity = priority_weights.get(annotation.priority, 1) * type_weights.get(annotation.type, 1)
            severity_score = max(severity_score, annotation_severity)
        
        # Generate recommendations based on findings
        recommendations = generate_recommendations(findings, feedback.sessionInfo)
        
        # Store analysis
        analysis_doc = {
            "submission_id": submission_id,
            "analysis_type": "automated",
            "findings": findings,
            "recommendations": recommendations,
            "severity_score": min(severity_score, 10),
            "created_at": datetime.utcnow(),
            "metadata": {
                "total_annotations": len(feedback.annotations),
                "page_url": feedback.sessionInfo.url,
                "user_agent": feedback.sessionInfo.userAgent
            }
        }
        
        result = await db.feedback_analysis.insert_one(analysis_doc)
        
        return {
            "analysis_id": str(result.inserted_id),
            "severity_score": severity_score,
            "findings_count": len(findings),
            "recommendations_count": len(recommendations)
        }
        
    except Exception as e:
        logger.error(f"Error analyzing feedback: {str(e)}")
        return {"error": str(e)}

def analyze_single_annotation(annotation: FeedbackAnnotation, session_info: SessionInfo) -> Dict[str, Any]:
    """Analyze a single feedback annotation and extract insights."""
    
    finding = {
        "annotation_id": annotation.id,
        "type": annotation.type,
        "priority": annotation.priority,
        "title": annotation.title,
        "description": annotation.description,
        "element_analysis": {},
        "context_analysis": {},
        "actionable_items": []
    }
    
    # Element analysis
    element = annotation.element
    finding["element_analysis"] = {
        "element_type": element.tagName,
        "has_id": bool(element.id),
        "has_classes": bool(element.className),
        "is_interactive": element.tagName.lower() in ['button', 'a', 'input', 'select', 'textarea'],
        "position": element.position,
        "selector_specificity": calculate_selector_specificity(element)
    }
    
    # Context analysis
    finding["context_analysis"] = {
        "page_url": annotation.url,
        "page_section": determine_page_section(annotation.url),
        "viewport_size": f"{session_info.viewport['width']}x{session_info.viewport['height']}",
        "element_visibility": analyze_element_visibility(element)
    }
    
    # Generate actionable items based on issue type
    finding["actionable_items"] = generate_actionable_items(annotation)
    
    return finding

def calculate_selector_specificity(element: ElementInfo) -> str:
    """Calculate CSS selector specificity."""
    if element.id:
        return "high"
    elif element.className and len(element.className.split()) > 1:
        return "medium"
    else:
        return "low"

def determine_page_section(url: str) -> str:
    """Determine which section of the app the feedback is from."""
    if "/dashboard" in url:
        return "dashboard"
    elif "/clients" in url:
        return "clients"
    elif "/estimates" in url:
        return "estimates"
    elif "/calendar" in url:
        return "calendar"
    elif "/login" in url:
        return "authentication"
    else:
        return "general"

def analyze_element_visibility(element: ElementInfo) -> Dict[str, Any]:
    """Analyze element visibility and accessibility."""
    position = element.position
    viewport_issues = []
    
    # Check if element is outside viewport
    if position["x"] < 0 or position["y"] < 0:
        viewport_issues.append("Element positioned outside viewport")
    
    # Check if element is too small
    if position["width"] < 10 or position["height"] < 10:
        viewport_issues.append("Element too small for interaction")
    
    return {
        "viewport_issues": viewport_issues,
        "size": f"{position['width']}x{position['height']}",
        "coordinates": f"({position['x']}, {position['y']})"
    }

def generate_actionable_items(annotation: FeedbackAnnotation) -> List[str]:
    """Generate specific actionable items based on the annotation type."""
    items = []
    
    if annotation.type == "bug":
        items.extend([
            "Investigate root cause of the reported bug",
            "Add error handling if missing",
            "Create unit test to prevent regression",
            f"Fix {annotation.element.tagName} element behavior"
        ])
    
    elif annotation.type == "ui":
        items.extend([
            "Review UI/UX design consistency",
            "Check responsive design behavior",
            "Validate accessibility standards",
            "Consider user experience improvements"
        ])
    
    elif annotation.type == "broken-link":
        items.extend([
            "Verify link destination exists",
            "Check routing configuration",
            "Update navigation structure",
            "Add 404 error handling"
        ])
    
    elif annotation.type == "performance":
        items.extend([
            "Profile component rendering performance",
            "Optimize loading strategies",
            "Check for memory leaks",
            "Implement caching if applicable"
        ])
    
    elif annotation.type == "feature":
        items.extend([
            "Evaluate feature feasibility",
            "Create user story and acceptance criteria",
            "Design implementation approach",
            "Estimate development effort"
        ])
    
    elif annotation.type == "improvement":
        items.extend([
            "Analyze current implementation",
            "Research best practices",
            "Plan incremental improvements",
            "Consider user feedback patterns"
        ])
    
    return items

def generate_recommendations(findings: List[Dict[str, Any]], session_info: SessionInfo) -> List[str]:
    """Generate high-level recommendations based on all findings."""
    recommendations = []
    
    # Count issue types
    issue_counts = {}
    priority_counts = {}
    section_issues = {}
    
    for finding in findings:
        issue_type = finding["type"]
        priority = finding["priority"]
        section = finding["context_analysis"]["page_section"]
        
        issue_counts[issue_type] = issue_counts.get(issue_type, 0) + 1
        priority_counts[priority] = priority_counts.get(priority, 0) + 1
        section_issues[section] = section_issues.get(section, 0) + 1
    
    # Generate recommendations based on patterns
    if issue_counts.get("bug", 0) > 2:
        recommendations.append("🐛 High bug count detected - Consider implementing more comprehensive testing")
    
    if issue_counts.get("ui", 0) > 1:
        recommendations.append("🎨 UI consistency issues found - Review design system implementation")
    
    if priority_counts.get("critical", 0) > 0:
        recommendations.append("🚨 Critical issues require immediate attention")
    
    if priority_counts.get("high", 0) > 1:
        recommendations.append("⚠️ Multiple high-priority issues - Plan focused sprint for fixes")
    
    # Section-specific recommendations
    max_section = max(section_issues.items(), key=lambda x: x[1]) if section_issues else None
    if max_section and max_section[1] > 1:
        recommendations.append(f"📍 Focus on {max_section[0]} section - has {max_section[1]} reported issues")
    
    # General recommendations
    recommendations.extend([
        "📝 Document all fixes and improvements made",
        "🧪 Add automated tests for reported issues",
        "👥 Consider user testing for UI/UX improvements",
        "📊 Monitor metrics after implementing fixes"
    ])
    
    return recommendations[:10]  # Limit to top 10 recommendations
