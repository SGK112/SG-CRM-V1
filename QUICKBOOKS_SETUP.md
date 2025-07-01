# QuickBooks Online API Setup Guide

## 🎯 Goal: Connect Your QB Account to Save Bookkeeper Time

### **Step 1: Create QuickBooks App**
1. Go to: [https://developer.intuit.com/app/developer/myapps](https://developer.intuit.com/app/developer/myapps)
2. Sign in with your Intuit account (same one for QB)
3. Click **"Create an App"**
4. Choose **"QuickBooks Online Accounting API"**
5. **App Name:** "Surprise Granite CRM"
6. **App Description:** "Custom CRM integration for countertop business"

### **Step 2: Get Your API Keys**
After creating the app, you'll see:
```
Client ID: ABCxyxbY5fhq4qN7t9rqn3qewf3asdfgh
Client Secret: jUvJZlJJ9O2fhq4qN7t9rqn3qevdf3Rh
```

**Add to your .env file:**
```bash
QB_CONSUMER_KEY=ABCxyxbY5fhq4qN7t9rqn3qewf3asdfgh
QB_CONSUMER_SECRET=jUvJZlJJ9O2fhq4qN7t9rqn3qevdf3Rh
```

### **Step 3: Configure Redirect URI**
In your QB app settings, add:
```
Development: http://localhost:8000/auth/quickbooks/callback
Production: https://yourdomain.com/auth/quickbooks/callback
```

### **Step 4: Connect Your Actual QB Company**
This requires OAuth (we'll build this):

1. **OAuth Flow:** User clicks "Connect QuickBooks" in your CRM
2. **Redirects to Intuit:** QB login page opens
3. **User Authorizes:** Grants permission to access their QB data
4. **Gets Tokens:** Returns access token and company ID
5. **Store Tokens:** Save in your database for API calls

### **Step 5: What You'll Get**
```bash
QB_ACCESS_TOKEN=qyprGJ9OZhHfq4qN7t9rqn3Rh (changes periodically)
QB_REFRESH_TOKEN=L0vJ8xOJJ9O2fhq4qNrqn3Re (used to get new access tokens)
QB_COMPANY_ID=193528205294 (your specific QB company)
```

## 🔧 **Technical Implementation**

### **What We'll Sync:**
- ✅ **Customers** (from CRM to QB)
- ✅ **Invoices** (estimates become QB invoices)
- ✅ **Payments** (Stripe payments sync to QB)
- ✅ **Items** (countertop services/materials)
- ✅ **Vendors** (material suppliers)

### **Sample API Calls:**
```javascript
// Create customer in QuickBooks
await qb.createCustomer({
  Name: "John Smith",
  CompanyName: "Smith Residence", 
  PrimaryEmailAddr: { Address: "john@email.com" },
  PrimaryPhone: { FreeFormNumber: "555-123-4567" },
  BillAddr: {
    Line1: "123 Main St",
    City: "Surprise",
    CountrySubDivisionCode: "AZ",
    PostalCode: "85374"
  }
});

// Create invoice from estimate
await qb.createInvoice({
  CustomerRef: { value: "123" },
  Line: [{
    Amount: 5000.00,
    DetailType: "SalesItemLineDetail",
    SalesItemLineDetail: {
      ItemRef: { value: "granite_countertop" },
      Qty: 45, // square feet
      UnitPrice: 111.11
    }
  }]
});

// Record payment from Stripe
await qb.createPayment({
  CustomerRef: { value: "123" },
  TotalAmt: 5000.00,
  Line: [{
    Amount: 5000.00,
    LinkedTxn: [{ TxnId: "invoice_id", TxnType: "Invoice" }]
  }]
});
```

## 💰 **Business Benefits:**

### **For Your Bookkeeper:**
- ✅ **No Manual Entry** - Payments automatically sync
- ✅ **Accurate Records** - No typing errors
- ✅ **Real-Time Updates** - Instant synchronization
- ✅ **Proper Categories** - Items automatically categorized

### **For You:**
- ✅ **Time Savings** - Hours per week saved
- ✅ **Better Reporting** - Real-time financial data
- ✅ **Cash Flow Tracking** - Know exactly where you stand
- ✅ **Tax Preparation** - QB data ready for accountant

## 🚀 **Implementation Timeline:**

### **Week 1: Basic Connection**
- Set up QB app and get credentials
- Build OAuth connection flow
- Test basic customer creation

### **Week 2: Payment Sync**
- Connect Stripe payments to QB
- Automatic invoice creation
- Payment recording

### **Week 3: Full Integration**
- Vendor sync for material costs
- Service item management
- Reporting and reconciliation

## 🔐 **Security Notes:**
- QB tokens expire every 180 days
- We'll build automatic refresh system
- All data encrypted in transit
- Only authorized CRM users can trigger sync
- Full audit trail of all QB operations

**Bottom Line:** Your bookkeeper's workflow stays exactly the same, but data flows automatically from your CRM to QuickBooks!
