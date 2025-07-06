from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging
import os
from pathlib import Path

from app.api import auth, vendors, estimates, contracts, payments, pdf_upload, clients, contractors, appointments, services, marketing, settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up...")
    # Skip MongoDB for now - using mock data
    yield
    # Shutdown
    logger.info("Shutting down...")

app = FastAPI(
    title="CRM & Estimating API",
    description="A comprehensive CRM and estimating application with vendor management",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://sg-crm-frontend.onrender.com",
        "https://*.onrender.com",
        "https://*.render.com",
        "https://*.app.github.dev",
        "https://shiny-giggle-69gw4wqgg777fr54-3000.app.github.dev",
        "https://super-space-bassoon-v6vwqw9vvw55269r5-3000.app.github.dev"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files if directory exists
static_dir = Path(__file__).parent.parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(clients.router, prefix="/api/clients", tags=["Clients"])
app.include_router(contractors.router, prefix="/api/contractors", tags=["Contractors"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["Appointments"])
app.include_router(services.router, prefix="/api/services", tags=["Services"])
app.include_router(vendors.router, prefix="/api/vendors", tags=["Vendors"])
app.include_router(estimates.router, prefix="/api/estimates", tags=["Estimates"])
app.include_router(contracts.router, prefix="/api/contracts", tags=["Contracts"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(pdf_upload.router, prefix="/api/upload", tags=["File Upload"])
app.include_router(marketing.router, prefix="/api/marketing", tags=["Marketing"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])

@app.get("/")
async def root():
    return {"message": "CRM & Estimating API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
