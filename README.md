# CRM & Estimating Application

A comprehensive Customer Relationship Management and Estimating application built with FastAPI, React, MongoDB, and Stripe integration.

## Features

- **Vendor Management**: Store and manage vendor information, pricing, and documents
- **Estimates**: Create, send, and track professional estimates
- **Contracts**: Generate contracts from estimates with electronic signatures
- **Payments**: Process payments through Stripe integration
- **PDF Processing**: Upload and parse PDF documents for vendor pricing
- **Document Management**: Store files using Cloudinary
- **Email Integration**: Send estimates and contracts via email

## Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **MongoDB**: NoSQL database with Motor (async driver)
- **Stripe**: Payment processing
- **Cloudinary**: File storage and management
- **ReportLab**: PDF generation
- **PyPDF2**: PDF parsing
- **SMTP**: Email sending

### Frontend
- **React 18**: Modern React with hooks
- **Material-UI**: Professional UI components
- **React Query**: Data fetching and caching
- **React Router**: Navigation
- **Stripe Elements**: Payment forms
- **React Hook Form**: Form management

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB running locally or connection string
- Stripe account for payments
- Cloudinary account for file storage
- Email account for SMTP

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your actual values:
   ```env
   MONGODB_URL=mongodb://localhost:27017
   DATABASE_NAME=crm_estimating_db
   SECRET_KEY=your-secret-key-here
   
   # Stripe
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Email
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   ```

5. **Load sample data** (optional):
   ```bash
   python load_csv_data.py
   ```

6. **Start the server**:
   ```bash
   uvicorn app.main:app --reload
   ```

   The API will be available at `http://localhost:8000`
   
   API Documentation: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:8000/api
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   ```

4. **Start the development server**:
   ```bash
   npm start
   ```

   The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/token` - Login
- `GET /api/auth/me` - Get current user

### Vendors
- `GET /api/vendors` - List vendors
- `POST /api/vendors` - Create vendor
- `GET /api/vendors/{id}` - Get vendor
- `PUT /api/vendors/{id}` - Update vendor
- `DELETE /api/vendors/{id}` - Delete vendor
- `POST /api/vendors/{id}/upload-pricing` - Upload pricing PDF

### Estimates
- `GET /api/estimates` - List estimates
- `POST /api/estimates` - Create estimate
- `GET /api/estimates/{id}` - Get estimate
- `PUT /api/estimates/{id}` - Update estimate
- `POST /api/estimates/{id}/generate-pdf` - Generate PDF
- `POST /api/estimates/{id}/send` - Send estimate
- `POST /api/estimates/{id}/duplicate` - Duplicate estimate

### Contracts
- `GET /api/contracts` - List contracts
- `POST /api/contracts` - Create contract
- `GET /api/contracts/{id}` - Get contract
- `PUT /api/contracts/{id}` - Update contract
- `POST /api/contracts/{id}/generate-pdf` - Generate PDF
- `POST /api/contracts/{id}/send` - Send contract
- `POST /api/contracts/{id}/sign` - Sign contract
- `POST /api/contracts/from-estimate/{estimate_id}` - Create from estimate

### Payments
- `POST /api/payments/create-payment-intent` - Create payment intent
- `POST /api/payments/webhook` - Stripe webhook
- `GET /api/payments/payment-status/{contract_id}` - Get payment status

### File Upload
- `POST /api/upload/pdf` - Upload and parse PDF
- `POST /api/upload/image` - Upload image
- `POST /api/upload/documents` - Upload document
- `POST /api/upload/bulk-upload` - Bulk upload files

## Project Structure

```
vendor-data/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── database.py          # MongoDB connection
│   │   ├── api/                 # API routes
│   │   │   ├── auth.py          # Authentication
│   │   │   ├── vendors.py       # Vendor management
│   │   │   ├── estimates.py     # Estimate management
│   │   │   ├── contracts.py     # Contract management
│   │   │   ├── payments.py      # Payment processing
│   │   │   └── pdf_upload.py    # File upload
│   │   ├── models/              # Pydantic models
│   │   │   ├── user.py
│   │   │   ├── vendor.py
│   │   │   ├── estimate.py
│   │   │   └── contract.py
│   │   └── services/            # Business logic
│   │       ├── pdf_parser.py    # PDF parsing
│   │       ├── pdf_generator.py # PDF generation
│   │       ├── email_service.py # Email sending
│   │       ├── stripe_service.py# Stripe integration
│   │       └── grok_ai.py       # AI integration
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main app component
│   │   ├── contexts/            # React contexts
│   │   ├── components/          # Reusable components
│   │   ├── pages/               # Page components
│   │   └── services/            # API services
│   ├── package.json
│   └── public/
│
└── README.md
```

## Development

### Running Tests
```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test
```

### Database Setup
The application uses MongoDB. Make sure MongoDB is running and accessible at the URL specified in your `.env` file.

### Stripe Setup
1. Create a Stripe account
2. Get your API keys from the Stripe dashboard
3. Set up webhooks pointing to `http://localhost:8000/api/payments/webhook`
4. Configure the webhook secret in your `.env` file

### Cloudinary Setup
1. Create a Cloudinary account
2. Get your cloud name, API key, and API secret
3. Configure them in your `.env` file

## Deployment

### Backend Deployment
- Deploy to services like Heroku, DigitalOcean, or AWS
- Ensure environment variables are set
- Use a production MongoDB instance
- Configure proper CORS settings

### Frontend Deployment
- Build the React app: `npm run build`
- Deploy to services like Netlify, Vercel, or AWS S3
- Update API URLs for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue on the GitHub repository or contact the development team.
