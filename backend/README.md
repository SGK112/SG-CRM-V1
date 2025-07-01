# CRM & Estimating Backend

FastAPI-based backend for the CRM and Estimating application.

## Features

- **RESTful API**: Built with FastAPI for high performance
- **MongoDB Integration**: Async database operations with Motor
- **Authentication**: JWT-based user authentication
- **File Processing**: PDF parsing and document management
- **Payment Processing**: Stripe integration
- **Email Services**: Automated email sending
- **PDF Generation**: Dynamic PDF creation for estimates and contracts

## API Documentation

Once the server is running, visit:
- Interactive API docs: `http://localhost:8000/docs`
- ReDoc documentation: `http://localhost:8000/redoc`

## Installation

1. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. Run the application:
   ```bash
   uvicorn app.main:app --reload
   ```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | `mongodb://localhost:27017` |
| `DATABASE_NAME` | Database name | `crm_estimating_db` |
| `SECRET_KEY` | JWT secret key | `your-secret-key` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your_api_secret` |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USERNAME` | SMTP username | `your_email@gmail.com` |
| `SMTP_PASSWORD` | SMTP password | `your_app_password` |

## Data Loading

To load sample vendor data from CSV:
```bash
python load_csv_data.py
```

## Project Structure

```
app/
├── main.py              # Application entry point
├── database.py          # Database connection
├── api/                 # API route modules
│   ├── auth.py          # Authentication endpoints
│   ├── vendors.py       # Vendor management
│   ├── estimates.py     # Estimate management
│   ├── contracts.py     # Contract management
│   ├── payments.py      # Payment processing
│   └── pdf_upload.py    # File upload handling
├── models/              # Pydantic data models
│   ├── user.py
│   ├── vendor.py
│   ├── estimate.py
│   └── contract.py
└── services/            # Business logic services
    ├── pdf_parser.py    # PDF parsing utilities
    ├── pdf_generator.py # PDF generation
    ├── email_service.py # Email sending
    ├── stripe_service.py# Stripe integration
    └── grok_ai.py       # AI services (placeholder)
```

## Testing

Run tests with pytest:
```bash
python -m pytest tests/
```

## Development

- Use `uvicorn app.main:app --reload` for development with auto-reload
- API documentation is automatically generated from code
- Follow FastAPI best practices for async/await patterns

## Production Deployment

1. Set environment variables for production
2. Use a production WSGI server like Gunicorn:
   ```bash
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```
3. Set up reverse proxy (nginx) if needed
4. Configure proper CORS settings for your frontend domain
