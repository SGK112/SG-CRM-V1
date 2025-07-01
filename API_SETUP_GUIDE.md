# API Setup Guide - Getting Your Credentials

## 🚀 Priority Order (Start with these for immediate cost savings)

### 1. **STRIPE PAYMENT PROCESSING** ⭐ HIGH PRIORITY
**Replaces: Thryv Pay**
**Savings: $50-100/month in processing fees**

**Steps:**
1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Create account
3. Navigate to Developers → API Keys
4. Copy **Publishable key** (starts with `pk_test_`)
5. Copy **Secret key** (starts with `sk_test_`)
6. For webhooks: Go to Developers → Webhooks → Add endpoint
   - URL: `http://localhost:8000/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `invoice.payment_succeeded`
7. Copy **Webhook signing secret**

**Add to .env:**
```
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
STRIPE_SECRET_KEY=sk_test_your_actual_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_actual_secret_here
```

### 2. **QUICKBOOKS INTEGRATION** ⭐ HIGH PRIORITY
**Replaces: Manual QB sync**
**Benefit: Keeps bookkeeper happy, saves hours of manual work**

**Steps:**
1. Go to [https://developer.intuit.com/app/developer/myapps](https://developer.intuit.com/app/developer/myapps)
2. Sign in with your Intuit account
3. Create new app → Select "QuickBooks Online Accounting API"
4. App name: "CRM Integration"
5. Get your keys from the app dashboard:
   - **Client ID** (Consumer Key)
   - **Client Secret** (Consumer Secret)
6. Set Redirect URI: `http://localhost:8000/auth/quickbooks/callback`

**Add to .env:**
```
QB_CONSUMER_KEY=your_client_id_here
QB_CONSUMER_SECRET=your_client_secret_here
QB_SANDBOX=true
```

**Note:** You'll need to do OAuth flow to get access tokens for your specific QB company.

### 3. **EMAIL AUTOMATION** ⭐ MEDIUM PRIORITY
**Replaces: Thryv email marketing**
**Savings: $50-100/month**

**SendGrid (Recommended):**
1. Go to [https://sendgrid.com/](https://sendgrid.com/)
2. Sign up for free account (100 emails/day free)
3. Go to Settings → API Keys
4. Create new API key with "Full Access"
5. Copy the key (starts with `SG.`)

**Add to .env:**
```
SENDGRID_API_KEY=SG.your_actual_api_key_here
FROM_EMAIL=noreply@yourcompany.com
FROM_NAME=Your Company Name
```

### 4. **SMS NOTIFICATIONS** ⭐ MEDIUM PRIORITY
**Replaces: Thryv SMS**
**Cost: ~$0.01 per SMS (very affordable)**

**Twilio:**
1. Go to [https://console.twilio.com/](https://console.twilio.com/)
2. Sign up (free trial with $15 credit)
3. From dashboard, copy:
   - **Account SID**
   - **Auth Token**
4. Buy a phone number or use trial number

**Add to .env:**
```
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

## 🔄 Secondary Integrations (Add later)

### 5. **FILE STORAGE** - Cloudinary
1. Go to [https://cloudinary.com/](https://cloudinary.com/)
2. Sign up for free account
3. Dashboard → Settings → Security
4. Copy Cloud Name, API Key, API Secret

### 6. **GOOGLE CALENDAR** - For scheduling
1. Go to [https://console.developers.google.com/](https://console.developers.google.com/)
2. Create new project
3. Enable Calendar API
4. Create OAuth 2.0 credentials

### 7. **DOCUSIGN** - For contracts
1. Go to [https://developers.docusign.com/](https://developers.docusign.com/)
2. Create developer account
3. Create integration key

## 🛠️ Quick Test Commands

After adding your API keys, test each integration:

```bash
# Test Stripe connection
curl -u sk_test_your_key: https://api.stripe.com/v1/customers

# Test SendGrid
curl -X "POST" "https://api.sendgrid.com/v3/mail/send" \
     -H "Authorization: Bearer SG.your_key" \
     -H "Content-Type: application/json"

# Test Twilio
curl -X POST https://api.twilio.com/2010-04-01/Accounts/your_sid/Messages.json \
     --data-urlencode "From=+1234567890" \
     --data-urlencode "Body=Test message" \
     --data-urlencode "To=+1234567890" \
     -u your_sid:your_auth_token
```

## 🎯 Immediate Next Steps:

1. **Start with Stripe** - Get payment processing working first
2. **Add QuickBooks** - Keep your bookkeeper workflow intact  
3. **Set up SendGrid** - Replace Thryv email features
4. **Test everything** - Make sure all APIs connect properly

## 💡 Pro Tips:

- Use **test/sandbox modes** for everything initially
- Keep your `.env` file secure (never commit to git)
- Test each API separately before building the full integration
- Start with small test transactions before going live

Ready to start saving $600/month! 🚀
