from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, Optional
from ..services.grok_ai import GrokAI
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    success: bool

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(message: ChatMessage):
    """Chat with the AI Assistant"""
    try:
        grok_ai = GrokAI()
        response = await grok_ai.get_smart_response(message.message, message.context)
        
        return ChatResponse(
            response=response,
            success=True
        )
    except Exception as e:
        logger.error(f"Error in AI chat: {e}")
        return ChatResponse(
            response="I'm having trouble processing your request right now. Please try again.",
            success=False
        )

@router.post("/analyze-document")
async def analyze_document(document_text: str):
    """Analyze a document using Grok AI"""
    try:
        grok_ai = GrokAI()
        analysis = await grok_ai.analyze_vendor_document(document_text)
        
        return {
            "success": True,
            "analysis": analysis
        }
    except Exception as e:
        logger.error(f"Error analyzing document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/score-lead")
async def score_lead(lead_data: Dict[str, Any]):
    """Score a lead using Grok AI"""
    try:
        grok_ai = GrokAI()
        score = await grok_ai.score_lead(lead_data)
        
        return {
            "success": True,
            "score": score
        }
    except Exception as e:
        logger.error(f"Error scoring lead: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/test")
async def test_ai_connection():
    """Test the AI connection"""
    try:
        grok_ai = GrokAI()
        response = await grok_ai.get_smart_response("Hello, can you help me with my CRM?")
        
        return {
            "success": True,
            "message": "AI connection working",
            "test_response": response
        }
    except Exception as e:
        logger.error(f"Error testing AI connection: {e}")
        return {
            "success": False,
            "message": f"AI connection failed: {str(e)}"
        }
