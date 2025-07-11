# 🔗 CRM System Connection Guide

## Current Status Summary

### ✅ Working Systems
- Frontend: React app compiles successfully 
- Backend: FastAPI server running
- Dependencies: All packages installed
- Authentication: JWT system configured

### 🚨 Systems Needing Configuration

## 1. 🍃 MongoDB Database Connection

### Quick Setup Options:

#### Option A: MongoDB Atlas (Cloud - Recommended)
```bash
# 1. Create account at https://www.mongodb.com/atlas
# 2. Create a cluster (free tier available)
# 3. Get connection string like: mongodb+srv://username:password@cluster0.xyz.mongodb.net/crm_db
# 4. Update backend/.env:
MONGODB_URL=mongodb+srv://username:password@cluster0.xyz.mongodb.net/crm_db
DATABASE_NAME=crm_estimating_db
```

#### Option B: Local MongoDB
```bash
# Install MongoDB locally
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Update backend/.env:
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=crm_estimating_db
```

#### Option C: Docker MongoDB
```bash
# Run MongoDB in Docker
docker run --name mongodb -d -p 27017:27017 mongo:latest

# Update backend/.env:
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=crm_estimating_db
```

### Test MongoDB Connection:
```bash
cd /workspaces/SG-CRM-V1/backend
python create_test_user.py
```

## 2. 💳 Stripe Payment Integration

### Setup Steps:
1. Create account at https://stripe.com
2. Get API keys from Dashboard > Developers > API keys
3. Update `backend/.env`:

```env
# Test keys (safe for development)
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
STRIPE_SECRET_KEY=sk_test_your_actual_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Test Stripe Integration:
```bash
cd /workspaces/SG-CRM-V1/backend
node test-stripe.js
```

## 3. 📧 Email System Setup

### Option A: SendGrid (Recommended)
1. Create account at https://sendgrid.com
2. Generate API key in Settings > API Keys
3. Update `backend/.env`:

```env
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
FROM_EMAIL=noreply@yourdomain.com
```

### Option B: Gmail SMTP
1. Enable 2-factor authentication on Gmail
2. Generate App Password in Security settings
3. Update `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your.email@gmail.com
SMTP_PASSWORD=your_16_character_app_password
FROM_EMAIL=your.email@gmail.com
```

### Test Email System:
```bash
cd /workspaces/SG-CRM-V1/backend
python -c "
from app.services.email_service import send_email
import asyncio
asyncio.run(send_email('test@example.com', 'Test Subject', 'Test message'))
"
```

## 4. 🔐 Security Configuration

Update `backend/.env` with secure values:

```env
# Generate secure keys
JWT_SECRET=$(openssl rand -hex 32)
SECRET_KEY=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
```

## 5. 🌐 Environment URLs

```env
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
NODE_ENV=development
PORT=8000
```

## 6. 🚀 Start the System

### Quick Start Script:
```bash
# From project root
bash setup_and_run.sh
```

### Manual Start:
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 - Frontend  
cd frontend
npm start
```

## 7. 🧪 Test Everything

### Backend API Test:
```bash
curl http://localhost:8000/docs
```

### Frontend Test:
```bash
# Should open in browser
http://localhost:3000
```

### Full System Test:
```bash
cd scripts
bash full_system_test.sh
```

## 8. 🔍 Common Issues & Solutions

### Issue: "Address already in use"
```bash
# Kill existing processes
pkill -f "uvicorn"
pkill -f "npm start"
```

### Issue: MongoDB connection failed
```bash
# Check if MongoDB is running
mongosh # or mongo
# If fails, restart MongoDB service
sudo systemctl restart mongodb
```

### Issue: Frontend won't start
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Issue: Backend errors
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

## 9. 📱 Mobile Responsiveness

The system includes mobile-first design. Test on:
- Desktop: Chrome, Firefox, Safari
- Mobile: Responsive design mode
- Tablets: iPad sizes

## 10. 🎯 Next Steps

1. **Configure MongoDB** (Priority 1)
2. **Set up Stripe keys** (Priority 2)  
3. **Configure email** (Priority 3)
4. **Test full workflow**
5. **Deploy to production**

## 🆘 Need Help?

- Check backend logs: `tail -f backend/logs/app.log`
- Check frontend console: Browser Dev Tools > Console
- Run diagnostics: `bash scripts/test_api.sh`

---

*Last updated: $(date)*
