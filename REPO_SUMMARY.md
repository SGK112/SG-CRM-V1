# SG-CRM-V1 - Repository Summary

## Description
Complete CRM and Estimating Application for Construction/Granite Industry

## Technology Stack
- FastAPI (Python Backend)
- React (Frontend)
- MongoDB (Database)
- Material-UI (UI Framework)
- Stripe (Payments)
- Docker (Containerization)

## Key Features
- Client Management
- Vendor Management
- Estimate Generation
- Contract Management
- Payment Processing
- PDF Generation
- File Upload/Management
- AI Integration (Grok AI)
- Authentication (JWT)
- Email Services

## Project Structure

### Backend (FastAPI backend with MongoDB)
- app/main.py - FastAPI application entry point
- app/database.py - MongoDB connection
- app/api/ - API route modules
- app/models/ - Pydantic data models
- app/services/ - Business logic services

### Frontend (React frontend with Material-UI)
- src/App.jsx - Main React application
- src/components/ - Reusable UI components
- src/pages/ - Page components
- src/services/ - API client services

## API Endpoints
### Authentication
- /api/auth/register
- /api/auth/token
- /api/auth/me

### Clients
- /api/clients
- /api/clients/{id}

### Vendors
- /api/vendors
- /api/vendors/{id}

### Estimates
- /api/estimates
- /api/estimates/{id}
- /api/estimates/{id}/generate-pdf

### Contracts
- /api/contracts
- /api/contracts/{id}

### Payments
- /api/payments
- /api/payments/process


## Database Collections
- users - User accounts and authentication
- clients - Client information and projects
- vendors - Vendor details and pricing
- estimates - Project estimates and line items
- contracts - Contracts and agreements
- services - Available services and pricing

## Deployment Status
- **Status**: Production Ready
- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **Database**: MongoDB running in Docker

## Recent Developments
- Full CRM functionality implemented
- MongoDB integration with sample vendor data
- React frontend with all major pages
- Estimate builder with line items
- PDF generation and email services
- Stripe payment integration
- AI integration with Grok AI
- Complete authentication system
