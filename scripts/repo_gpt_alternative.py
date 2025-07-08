#!/usr/bin/env python3
"""
Simplified repo-gpt alternative for SG-CRM-V1
Creates a concise, GPT-friendly repository summary
"""
import os
import json
from pathlib import Path

def create_repo_summary():
    """Create a concise repository summary for AI analysis"""
    
    summary = {
        "project": "SG-CRM-V1",
        "description": "Complete CRM and Estimating Application for Construction/Granite Industry",
        "technology_stack": [
            "FastAPI (Python Backend)",
            "React (Frontend)",
            "MongoDB (Database)",
            "Material-UI (UI Framework)",
            "Stripe (Payments)",
            "Docker (Containerization)"
        ],
        "key_features": [
            "Client Management",
            "Vendor Management", 
            "Estimate Generation",
            "Contract Management",
            "Payment Processing",
            "PDF Generation",
            "File Upload/Management",
            "AI Integration (Grok AI)",
            "Authentication (JWT)",
            "Email Services"
        ],
        "project_structure": {
            "backend/": {
                "description": "FastAPI backend with MongoDB",
                "key_files": [
                    "app/main.py - FastAPI application entry point",
                    "app/database.py - MongoDB connection",
                    "app/api/ - API route modules",
                    "app/models/ - Pydantic data models",
                    "app/services/ - Business logic services"
                ]
            },
            "frontend/": {
                "description": "React frontend with Material-UI",
                "key_files": [
                    "src/App.jsx - Main React application",
                    "src/components/ - Reusable UI components",
                    "src/pages/ - Page components",
                    "src/services/ - API client services"
                ]
            }
        },
        "api_endpoints": {
            "authentication": ["/api/auth/register", "/api/auth/token", "/api/auth/me"],
            "clients": ["/api/clients", "/api/clients/{id}"],
            "vendors": ["/api/vendors", "/api/vendors/{id}"],
            "estimates": ["/api/estimates", "/api/estimates/{id}", "/api/estimates/{id}/generate-pdf"],
            "contracts": ["/api/contracts", "/api/contracts/{id}"],
            "payments": ["/api/payments", "/api/payments/process"]
        },
        "database_collections": [
            "users - User accounts and authentication",
            "clients - Client information and projects",
            "vendors - Vendor details and pricing",
            "estimates - Project estimates and line items",
            "contracts - Contracts and agreements",
            "services - Available services and pricing"
        ],
        "deployment_info": {
            "status": "Production Ready",
            "backend_url": "http://localhost:8000",
            "frontend_url": "http://localhost:3000",
            "api_docs": "http://localhost:8000/docs",
            "database": "MongoDB running in Docker",
            "sample_data": "Vendor data loaded from CSV"
        },
        "recent_developments": [
            "Full CRM functionality implemented",
            "MongoDB integration with sample vendor data",
            "React frontend with all major pages",
            "Estimate builder with line items",
            "PDF generation and email services",
            "Stripe payment integration",
            "AI integration with Grok AI",
            "Complete authentication system"
        ]
    }
    
    return summary

def save_summary():
    """Save summary to file and display"""
    summary = create_repo_summary()
    
    # Save to JSON
    with open('repo_summary.json', 'w') as f:
        json.dump(summary, f, indent=2)
    
    # Create markdown version
    md_content = f"""# {summary['project']} - Repository Summary

## Description
{summary['description']}

## Technology Stack
{chr(10).join(f"- {tech}" for tech in summary['technology_stack'])}

## Key Features
{chr(10).join(f"- {feature}" for feature in summary['key_features'])}

## Project Structure

### Backend ({summary['project_structure']['backend/']['description']})
{chr(10).join(f"- {file}" for file in summary['project_structure']['backend/']['key_files'])}

### Frontend ({summary['project_structure']['frontend/']['description']})
{chr(10).join(f"- {file}" for file in summary['project_structure']['frontend/']['key_files'])}

## API Endpoints
{chr(10).join(f"### {category.title()}{chr(10)}{chr(10).join(f'- {endpoint}' for endpoint in endpoints)}{chr(10)}" for category, endpoints in summary['api_endpoints'].items())}

## Database Collections
{chr(10).join(f"- {collection}" for collection in summary['database_collections'])}

## Deployment Status
- **Status**: {summary['deployment_info']['status']}
- **Backend**: {summary['deployment_info']['backend_url']}
- **Frontend**: {summary['deployment_info']['frontend_url']}
- **API Docs**: {summary['deployment_info']['api_docs']}
- **Database**: {summary['deployment_info']['database']}

## Recent Developments
{chr(10).join(f"- {dev}" for dev in summary['recent_developments'])}
"""
    
    with open('REPO_SUMMARY.md', 'w') as f:
        f.write(md_content)
    
    print("📊 Repository Summary Generated!")
    print("=" * 50)
    print(f"📁 Project: {summary['project']}")
    print(f"📝 Description: {summary['description']}")
    print(f"🛠️  Tech Stack: {', '.join(summary['technology_stack'][:3])}...")
    print(f"✨ Features: {len(summary['key_features'])} key features")
    print(f"🔗 API Endpoints: {sum(len(endpoints) for endpoints in summary['api_endpoints'].values())} endpoints")
    print(f"🗄️  Database: {len(summary['database_collections'])} collections")
    print(f"🚀 Status: {summary['deployment_info']['status']}")
    print("=" * 50)
    print("📄 Files created:")
    print("  - repo_summary.json (machine-readable)")
    print("  - REPO_SUMMARY.md (human-readable)")
    
    return summary

if __name__ == "__main__":
    save_summary()
