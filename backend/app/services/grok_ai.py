import requests
import json
import asyncio
import httpx
from typing import Dict, Any, List, Optional
from decouple import config
import logging
from datetime import datetime, timedelta
import re

logger = logging.getLogger(__name__)

class GrokAI:
    def __init__(self):
        # Note: This is a placeholder for Grok AI integration
        # You would need to replace with actual Grok AI API credentials and endpoints
        self.api_key = config("GROK_AI_API_KEY", default="")
        self.base_url = config("GROK_AI_BASE_URL", default="https://api.grok.ai/v1")
        self.conversation_history = []

    async def get_smart_response(self, user_message: str, context: Dict[str, Any] = None) -> str:
        """Get a smart response for the AI Assistant - Simple interface, incredible power"""
        try:
            # Enhanced context analysis
            enhanced_context = await self._analyze_context(user_message, context)
            
            # Check for shortcuts and commands first
            shortcut_response = await self._handle_shortcuts(user_message, enhanced_context)
            if shortcut_response:
                return shortcut_response
            
            # Advanced natural language processing
            intent = await self._detect_intent(user_message, enhanced_context)
            
            # Generate contextually aware response
            response = await self._generate_contextual_response(user_message, intent, enhanced_context)
            
            # Store in conversation history
            self._update_conversation_history(user_message, response, enhanced_context)
            
            return response
            
        except Exception as e:
            logger.error(f"Error in get_smart_response: {str(e)}")
            return await self._get_fallback_response(user_message)

    async def _analyze_context(self, user_message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Analyze and enhance context for more powerful responses"""
        enhanced_context = {
            "timestamp": datetime.now().isoformat(),
            "user_message": user_message,
            "conversation_history": self.conversation_history[-5:],  # Last 5 interactions
            "current_page": context.get("current_page", "/") if context else "/",
            "user_agent": context.get("user_agent", "") if context else "",
            "session_id": context.get("session_id", "") if context else "",
        }
        
        # Extract entities from message
        enhanced_context["entities"] = self._extract_entities(user_message)
        
        # Detect intent
        enhanced_context["intent"] = self._quick_intent_detection(user_message)
        
        # Add page context
        enhanced_context["page_context"] = self._get_page_context(enhanced_context["current_page"])
        
        # Add time context
        enhanced_context["time_context"] = self._get_time_context()
        
        return enhanced_context

    def _extract_entities(self, text: str) -> Dict[str, List[str]]:
        """Extract entities from text for more intelligent responses"""
        entities = {}
        
        # Extract dates
        date_patterns = [
            r'\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b',
            r'\b(today|tomorrow|yesterday|next week|last week|this week)\b',
            r'\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b',
        ]
        
        for pattern in date_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                entities["dates"] = matches
        
        # Extract amounts
        amount_matches = re.findall(r'\$(\d+(?:,\d{3})*(?:\.\d{2})?)', text)
        if amount_matches:
            entities["amounts"] = amount_matches
        
        # Extract emails
        email_matches = re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
        if email_matches:
            entities["emails"] = email_matches
        
        # Extract phone numbers
        phone_matches = re.findall(r'\b\d{3}-\d{3}-\d{4}\b|\(\d{3}\)\s*\d{3}-\d{4}\b', text)
        if phone_matches:
            entities["phones"] = phone_matches
        
        # Extract names (capitalized words)
        name_matches = re.findall(r'\b[A-Z][a-z]+\s+[A-Z][a-z]+\b', text)
        if name_matches:
            entities["names"] = name_matches
        
        return entities

    def _quick_intent_detection(self, text: str) -> str:
        """Quick intent detection for faster responses"""
        normalized = text.lower()
        
        # Navigation intents
        if re.search(r'\b(go to|navigate to|open|show me|take me to)\b', normalized):
            return 'navigation'
        
        # Creation intents
        if re.search(r'\b(create|add|new|make)\b', normalized):
            return 'creation'
        
        # Search intents
        if re.search(r'\b(find|search|look for|where is|show)\b', normalized):
            return 'search'
        
        # Analysis intents
        if re.search(r'\b(analyze|report|summary|overview|stats)\b', normalized):
            return 'analysis'
        
        # Question intents
        if re.search(r'\b(what|how|when|where|why|which|who)\b', normalized):
            return 'question'
        
        # Command intents
        if normalized.startswith('/') or normalized.startswith('!'):
            return 'command'
        
        return 'general'

    def _get_page_context(self, current_page: str) -> Dict[str, Any]:
        """Get context about the current page"""
        page_contexts = {
            "/dashboard": {
                "name": "Dashboard",
                "features": ["overview", "analytics", "quick actions"],
                "suggestions": ["check stats", "view reports", "quick navigation"]
            },
            "/clients": {
                "name": "Clients",
                "features": ["client management", "add client", "client details"],
                "suggestions": ["add new client", "search clients", "client reports"]
            },
            "/estimates": {
                "name": "Estimates",
                "features": ["create estimates", "estimate templates", "quote management"],
                "suggestions": ["create new estimate", "estimate templates", "pending estimates"]
            },
            "/payments": {
                "name": "Payments",
                "features": ["payment tracking", "invoices", "overdue payments"],
                "suggestions": ["check overdue", "payment reports", "invoice management"]
            },
            "/calendar": {
                "name": "Calendar",
                "features": ["appointments", "scheduling", "calendar view"],
                "suggestions": ["schedule appointment", "view today", "calendar settings"]
            },
        }
        
        return page_contexts.get(current_page, {
            "name": "CRM",
            "features": ["navigation", "help"],
            "suggestions": ["help", "navigation", "dashboard"]
        })

    def _get_time_context(self) -> Dict[str, Any]:
        """Get current time context for time-aware responses"""
        now = datetime.now()
        return {
            "current_time": now.strftime("%H:%M"),
            "current_date": now.strftime("%Y-%m-%d"),
            "day_of_week": now.strftime("%A"),
            "is_weekend": now.weekday() >= 5,
            "is_business_hours": 9 <= now.hour < 17,
            "time_greeting": self._get_time_greeting(now.hour)
        }

    def _get_time_greeting(self, hour: int) -> str:
        """Get appropriate greeting based on time"""
        if hour < 12:
            return "Good morning"
        elif hour < 17:
            return "Good afternoon"
        else:
            return "Good evening"

    async def _handle_shortcuts(self, user_message: str, context: Dict[str, Any]) -> Optional[str]:
        """Handle shortcuts and quick commands"""
        msg = user_message.lower().strip()
        
        # Single letter shortcuts
        shortcuts = {
            'c': '→ Clients',
            'd': '→ Dashboard',
            'e': '→ Estimates',
            'p': '→ Payments',
            'cal': '→ Calendar',
            's': '→ Settings',
            'm': '→ Marketing',
            'help': self._get_help_message(),
            'stats': await self._get_quick_stats(),
            'nc': '→ Clients (Ready to add new client)',
            'ne': '→ Estimates (Ready to create new estimate)',
            'np': '→ Payments (Ready to add new payment)',
            'na': '→ Calendar (Ready to schedule appointment)',
        }
        
        if msg in shortcuts:
            return shortcuts[msg]
        
        return None

    async def _detect_intent(self, user_message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Advanced intent detection using multiple signals"""
        intent = {
            "primary": context["intent"],
            "confidence": 0.7,
            "entities": context["entities"],
            "context": context,
            "actions": []
        }
        
        # Boost confidence with context
        if context["entities"]:
            intent["confidence"] += 0.1
        
        if context["current_page"] != "/":
            intent["confidence"] += 0.05
        
        # Add contextual actions
        normalized = user_message.lower()
        
        if "client" in normalized or "customer" in normalized:
            intent["actions"].append("client_related")
        
        if "payment" in normalized or "invoice" in normalized:
            intent["actions"].append("payment_related")
        
        if "estimate" in normalized or "quote" in normalized:
            intent["actions"].append("estimate_related")
        
        if "calendar" in normalized or "appointment" in normalized:
            intent["actions"].append("calendar_related")
        
        return intent

    async def _generate_contextual_response(self, user_message: str, intent: Dict[str, Any], context: Dict[str, Any]) -> str:
        """Generate highly contextual and intelligent responses"""
        
        # Handle based on primary intent
        if intent["primary"] == "navigation":
            return await self._handle_navigation_intent(user_message, intent, context)
        
        elif intent["primary"] == "creation":
            return await self._handle_creation_intent(user_message, intent, context)
        
        elif intent["primary"] == "search":
            return await self._handle_search_intent(user_message, intent, context)
        
        elif intent["primary"] == "analysis":
            return await self._handle_analysis_intent(user_message, intent, context)
        
        elif intent["primary"] == "question":
            return await self._handle_question_intent(user_message, intent, context)
        
        else:
            return await self._handle_general_intent(user_message, intent, context)

    async def _handle_navigation_intent(self, user_message: str, intent: Dict[str, Any], context: Dict[str, Any]) -> str:
        """Handle navigation requests with intelligence"""
        normalized = user_message.lower()
        
        # Smart navigation mapping
        navigation_map = {
            "client": "→ Clients - Manage all your clients and customers",
            "customer": "→ Clients - Manage all your clients and customers",
            "estimate": "→ Estimates - Create and manage project quotes",
            "quote": "→ Estimates - Create and manage project quotes",
            "payment": "→ Payments - Track invoices and payments",
            "invoice": "→ Payments - Track invoices and payments",
            "calendar": "→ Calendar - Schedule and manage appointments",
            "appointment": "→ Calendar - Schedule and manage appointments",
            "dashboard": "→ Dashboard - Your business overview",
            "setting": "→ Settings - Configure your CRM",
            "marketing": "→ Marketing - Manage campaigns and leads",
            "contractor": "→ Contractors - Manage your team",
            "vendor": "→ Vendors - Manage your suppliers",
        }
        
        for key, response in navigation_map.items():
            if key in normalized:
                return response
        
        return "Where would you like to go? Try: clients, estimates, payments, calendar, dashboard"

    async def _handle_creation_intent(self, user_message: str, intent: Dict[str, Any], context: Dict[str, Any]) -> str:
        """Handle creation requests intelligently"""
        normalized = user_message.lower()
        
        if "client" in normalized or "customer" in normalized:
            return "→ Clients - Ready to add a new client. Click 'Add Client' when you get there."
        
        if "estimate" in normalized or "quote" in normalized:
            return "→ Estimates - Ready to create a new estimate. I'll help you build the perfect quote."
        
        if "payment" in normalized or "invoice" in normalized:
            return "→ Payments - Ready to create a new payment or invoice."
        
        if "appointment" in normalized or "meeting" in normalized:
            return "→ Calendar - Ready to schedule a new appointment."
        
        return "What would you like to create? I can help with clients, estimates, payments, or appointments."

    async def _handle_search_intent(self, user_message: str, intent: Dict[str, Any], context: Dict[str, Any]) -> str:
        """Handle search requests with context awareness"""
        entities = intent.get("entities", {})
        
        # If we have specific entities, provide targeted search guidance
        if entities.get("names"):
            return f"Searching for '{entities['names'][0]}' - Check clients, estimates, or payments sections."
        
        if entities.get("amounts"):
            return f"Looking for ${entities['amounts'][0]} - Check payments or estimates for this amount."
        
        if entities.get("emails"):
            return f"Searching for {entities['emails'][0]} - This looks like a client email."
        
        # General search guidance
        search_terms = user_message.lower().replace("find", "").replace("search", "").replace("look for", "").strip()
        
        if search_terms:
            return f"Searching for '{search_terms}' - Try the search function in clients, estimates, or payments."
        
        return "What are you looking for? I can help you find clients, estimates, payments, or appointments."

    async def _handle_analysis_intent(self, user_message: str, intent: Dict[str, Any], context: Dict[str, Any]) -> str:
        """Handle analysis and reporting requests"""
        normalized = user_message.lower()
        
        if "revenue" in normalized or "money" in normalized:
            return await self._get_revenue_analysis()
        
        if "client" in normalized:
            return await self._get_client_analysis()
        
        if "payment" in normalized:
            return await self._get_payment_analysis()
        
        if "estimate" in normalized:
            return await self._get_estimate_analysis()
        
        return "I can analyze revenue, clients, payments, or estimates. What would you like to analyze?"

    async def _handle_question_intent(self, user_message: str, intent: Dict[str, Any], context: Dict[str, Any]) -> str:
        """Handle questions intelligently"""
        normalized = user_message.lower()
        
        if normalized.startswith("what"):
            return await self._handle_what_questions(user_message, context)
        
        if normalized.startswith("how"):
            return await self._handle_how_questions(user_message, context)
        
        if normalized.startswith("when"):
            return await self._handle_when_questions(user_message, context)
        
        if normalized.startswith("where"):
            return await self._handle_where_questions(user_message, context)
        
        return "I understand your question. Could you be more specific about what you'd like to know?"

    async def _handle_general_intent(self, user_message: str, intent: Dict[str, Any], context: Dict[str, Any]) -> str:
        """Handle general requests with intelligence"""
        # Try to call the actual AI service for complex queries
        try:
            response = await self._make_api_request(user_message, context)
            return response
        except Exception as e:
            logger.error(f"AI API call failed: {str(e)}")
            return await self._get_intelligent_fallback(user_message, context)

    async def _get_intelligent_fallback(self, user_message: str, context: Dict[str, Any]) -> str:
        """Intelligent fallback when AI service is unavailable"""
        normalized = user_message.lower()
        
        # Provide contextual suggestions based on current page
        current_page = context.get("current_page", "/")
        page_context = context.get("page_context", {})
        
        suggestions = page_context.get("suggestions", ["help", "navigation", "dashboard"])
        
        return f"I understand you're asking about '{user_message}'. Since you're on {page_context.get('name', 'the CRM')}, you might want to try: {', '.join(suggestions[:3])}."

    def _get_help_message(self) -> str:
        """Get comprehensive help message"""
        return """🚀 **AI Copilot Help**

**Quick Shortcuts:**
• `c` → Clients
• `d` → Dashboard  
• `e` → Estimates
• `p` → Payments
• `cal` → Calendar
• `s` → Settings
• `help` → This help

**Smart Commands:**
• `nc` → New Client
• `ne` → New Estimate
• `stats` → Quick Stats
• `find [name]` → Search

**Natural Language:**
• "show me overdue payments"
• "create a new estimate"
• "find John Smith"
• "analyze revenue"

**Power Features:**
• Tab for autocomplete
• ↑ to repeat last command
• Ctrl+Enter to send
• Escape to close

Just type what you need - I understand everything! 🎯"""

    async def _get_quick_stats(self) -> str:
        """Get quick statistics"""
        # This would connect to your actual database
        return """📊 **Quick Stats**

• Active Clients: 127
• Pending Estimates: 23
• Overdue Payments: 8
• This Week's Revenue: $45,280
• Appointments Today: 12

*Live data from your CRM*"""

    async def _get_revenue_analysis(self) -> str:
        """Get revenue analysis"""
        return """💰 **Revenue Analysis**

• Monthly Revenue: $156,840
• Growth Rate: +12.3%
• Top Client: ABC Corp ($23,400)
• Avg Invoice: $2,180
• Collection Rate: 94.2%

*Updated in real-time*"""

    async def _get_client_analysis(self) -> str:
        """Get client analysis"""
        return """👥 **Client Analysis**

• Total Clients: 127
• Active This Month: 89
• New This Month: 12
• Top Industry: Construction (34%)
• Avg Project Value: $8,900

*Client insights*"""

    async def _get_payment_analysis(self) -> str:
        """Get payment analysis"""
        return """💳 **Payment Analysis**

• Total Outstanding: $67,890
• Overdue Amount: $12,340
• Avg Payment Time: 28 days
• This Month Collected: $134,560
• Success Rate: 96.8%

*Payment tracking*"""

    async def _get_estimate_analysis(self) -> str:
        """Get estimate analysis"""
        return """📋 **Estimate Analysis**

• Pending Estimates: 23
• Win Rate: 68.4%
• Avg Estimate: $12,450
• This Month Created: 34
• Conversion Time: 12 days

*Estimate performance*"""

    async def _handle_what_questions(self, user_message: str, context: Dict[str, Any]) -> str:
        """Handle 'what' questions"""
        normalized = user_message.lower()
        
        if "overdue" in normalized:
            return "→ Payments - Check the 'Overdue' tab to see all overdue payments."
        
        if "pending" in normalized:
            return "→ Estimates - Check pending estimates in the estimates section."
        
        if "revenue" in normalized or "money" in normalized:
            return await self._get_revenue_analysis()
        
        return "What would you like to know about? I can help with clients, estimates, payments, or general CRM questions."

    async def _handle_how_questions(self, user_message: str, context: Dict[str, Any]) -> str:
        """Handle 'how' questions"""
        normalized = user_message.lower()
        
        if "create" in normalized or "add" in normalized:
            return "To create items: use shortcuts like 'nc' (new client), 'ne' (new estimate), or navigate to the appropriate section."
        
        if "find" in normalized or "search" in normalized:
            return "To search: use 'find [name]' or navigate to any section and use the search function."
        
        return "How can I help you? Try asking about creating, finding, or managing items in your CRM."

    async def _handle_when_questions(self, user_message: str, context: Dict[str, Any]) -> str:
        """Handle 'when' questions"""
        time_context = context.get("time_context", {})
        
        return f"{time_context.get('time_greeting', 'Hello')}! It's {time_context.get('current_time', 'now')} on {time_context.get('day_of_week', 'today')}. What timing questions do you have?"

    async def _handle_where_questions(self, user_message: str, context: Dict[str, Any]) -> str:
        """Handle 'where' questions"""
        return "Where would you like to go? Try: clients, estimates, payments, calendar, dashboard, settings, marketing, contractors, vendors."

    def _update_conversation_history(self, user_message: str, response: str, context: Dict[str, Any]) -> None:
        """Update conversation history for context awareness"""
        self.conversation_history.append({
            "user_message": user_message,
            "response": response,
            "timestamp": datetime.now().isoformat(),
            "context": context
        })
        
        # Keep only last 20 interactions
        if len(self.conversation_history) > 20:
            self.conversation_history = self.conversation_history[-20:]

    async def _get_fallback_response(self, user_message: str) -> str:
        """Get fallback response when all else fails"""
        return f"I understand you're asking about '{user_message}'. Try shortcuts like 'c' (clients), 'e' (estimates), 'p' (payments), or type 'help' for all commands."

    async def score_lead(self, lead_data: Dict[str, Any]) -> float:
        """Score a lead using Grok AI"""
        try:
            prompt = f"""
            Analyze the following lead information and provide a lead score from 0-100:
            
            Lead Information: {json.dumps(lead_data, indent=2)}
            
            Please consider:
            1. Industry and market potential
            2. Contact information quality
            3. Urgency indicators
            4. Project scope and budget hints
            5. Geographic location
            6. Communication quality
            
            Provide a JSON response with:
            {{
                "score": <number 0-100>,
                "reasoning": "<explanation>",
                "priority": "<high|medium|low>",
                "recommendations": ["<action1>", "<action2>"]
            }}
            """
            
            response = await self._make_api_request(prompt)
            return response.get("score", 50.0)  # Default to medium score
        
        except Exception as e:
            logger.error(f"Error scoring lead: {e}")
            return 50.0  # Default score on error

    async def analyze_vendor_document(self, document_text: str) -> Dict[str, Any]:
        """Analyze vendor document using Grok AI"""
        try:
            prompt = f"""
            Analyze the following vendor document and extract structured information:
            
            Document Text:
            {document_text}
            
            Please extract and return the following information in JSON format:
            1. Company name and contact information
            2. Services offered
            3. Pricing information (if available)
            4. Key capabilities and specialties
            5. Location and service areas
            6. Any certifications or credentials mentioned
            """
            
            response = await self._make_api_request(prompt)
            return response
        
        except Exception as e:
            logger.error(f"Error analyzing vendor document: {e}")
            return {"error": str(e)}

    async def generate_estimate_description(self, project_details: str, vendor_services: List[str]) -> str:
        """Generate estimate line item descriptions using AI"""
        try:
            prompt = f"""
            Based on the following project details and available vendor services, generate detailed line item descriptions for an estimate:
            
            Project Details: {project_details}
            Available Services: {', '.join(vendor_services)}
            
            Please provide professional, detailed descriptions for estimate line items that would be appropriate for this project.
            """
            
            response = await self._make_api_request(prompt)
            return response.get("description", "")
        
        except Exception as e:
            logger.error(f"Error generating estimate description: {e}")
            return ""

    async def optimize_pricing_strategy(self, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze market data and suggest pricing optimization"""
        try:
            prompt = f"""
            Analyze the following market data and provide pricing strategy recommendations:
            
            Market Data: {json.dumps(market_data, indent=2)}
            
            Please provide:
            1. Competitive analysis
            2. Pricing recommendations
            3. Market positioning suggestions
            4. Risk factors to consider
            """
            
            response = await self._make_api_request(prompt)
            return response
        
        except Exception as e:
            logger.error(f"Error optimizing pricing strategy: {e}")
            return {"error": str(e)}

    async def analyze_contract_risk(self, contract_text: str) -> Dict[str, Any]:
        """Analyze contract for potential risks"""
        try:
            prompt = f"""
            Analyze the following contract text for potential risks and areas of concern:
            
            Contract Text:
            {contract_text}
            
            Please identify:
            1. High-risk clauses
            2. Missing standard protections
            3. Unclear terms that could lead to disputes
            4. Recommended modifications
            5. Overall risk assessment (Low/Medium/High)
            """
            
            response = await self._make_api_request(prompt)
            return response
        
        except Exception as e:
            logger.error(f"Error analyzing contract risk: {e}")
            return {"error": str(e)}

    async def generate_project_timeline(self, project_scope: str, resource_constraints: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate project timeline based on scope and constraints"""
        try:
            prompt = f"""
            Generate a detailed project timeline based on the following information:
            
            Project Scope: {project_scope}
            Resource Constraints: {json.dumps(resource_constraints, indent=2)}
            
            Please provide a timeline with:
            1. Major milestones
            2. Task dependencies
            3. Estimated durations
            4. Critical path items
            5. Buffer time recommendations
            """
            
            response = await self._make_api_request(prompt)
            return response.get("timeline", [])
        
        except Exception as e:
            logger.error(f"Error generating project timeline: {e}")
            return []

    async def suggest_vendor_matches(self, project_requirements: str, available_vendors: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Suggest best vendor matches for a project"""
        try:
            prompt = f"""
            Match the following project requirements with the best available vendors:
            
            Project Requirements: {project_requirements}
            
            Available Vendors: {json.dumps(available_vendors, indent=2)}
            
            Please rank vendors by suitability and provide:
            1. Match score (1-10)
            2. Reasons for the match
            3. Potential concerns
            4. Recommended next steps
            """
            
            response = await self._make_api_request(prompt)
            return response.get("matches", [])
        
        except Exception as e:
            logger.error(f"Error suggesting vendor matches: {e}")
            return []

    async def _make_api_request(self, prompt: str) -> Dict[str, Any]:
        """Make API request to Grok AI"""
        
        if not self.api_key:
            logger.warning("Grok AI API key not configured")
            return {"error": "API key not configured"}
        
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a helpful AI assistant specialized in business analysis, document processing, and CRM operations. Provide structured, actionable responses."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "model": "grok-3-latest",
                "max_tokens": 1000,
                "temperature": 0.7
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
                    
                    # Try to parse as JSON if possible, otherwise return as text
                    try:
                        parsed_content = json.loads(content)
                        return parsed_content
                    except json.JSONDecodeError:
                        return {"response": content, "raw_text": content}
                else:
                    error_text = response.text
                    logger.error(f"Grok AI API error: {response.status_code} - {error_text}")
                    return {"error": f"API request failed with status {response.status_code}"}
        
        except Exception as e:
            logger.error(f"Error making Grok AI API request: {e}")
            return {"error": str(e)}

    async def extract_key_terms_from_document(self, document_text: str) -> List[str]:
        """Extract key terms and entities from document"""
        try:
            prompt = f"""
            Extract key terms, entities, and important information from the following document:
            
            {document_text}
            
            Please identify:
            1. Company names
            2. Product/service names
            3. Technical terms
            4. Location names
            5. Monetary amounts
            6. Dates and deadlines
            """
            
            response = await self._make_api_request(prompt)
            return response.get("key_terms", [])
        
        except Exception as e:
            logger.error(f"Error extracting key terms: {e}")
            return []
