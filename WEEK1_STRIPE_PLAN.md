# Week 1 Action Plan - Stripe Integration

## ✅ COMPLETED
- [x] Stripe API connection verified
- [x] Live secret key working
- [x] Webhook secret configured
- [x] Account validated (charges enabled)

## 🎯 THIS WEEK'S GOALS

### Day 1-2: Basic Payment Processing
- [ ] Create payment intent API endpoint
- [ ] Build simple payment form in frontend
- [ ] Test $1 payment end-to-end
- [ ] Set up webhook endpoint in production

### Day 3-4: Estimate Payment Integration  
- [ ] Add "Pay Now" button to estimates
- [ ] Integrate with existing estimate system
- [ ] Send payment confirmation emails
- [ ] Update estimate status after payment

### Day 5-7: QuickBooks Sync
- [ ] Set up QuickBooks developer account
- [ ] Build QB payment sync
- [ ] Test with bookkeeper workflow
- [ ] Automated invoice creation

## 💰 IMMEDIATE COST SAVINGS
**Once this week is complete:**
- Replace Thryv Pay processing fees
- Direct Stripe rates: 2.9% + 30¢ vs Thryv's higher fees
- Potential savings: $100-300/month just on processing

## 🛠️ TECHNICAL TASKS

### Backend APIs Needed:
1. `POST /api/payments/create-intent` - Create payment
2. `POST /api/payments/confirm` - Confirm payment
3. `POST /webhooks/stripe` - Handle notifications (DONE)
4. `GET /api/payments/:id/status` - Check payment status

### Frontend Components Needed:
1. PaymentForm component (Stripe Elements)
2. PaymentStatus component
3. Update EstimateDialog with payment option
4. Payment confirmation page

### Database Updates:
1. Add payment_status to estimates table
2. Create payments table for tracking
3. Add stripe_customer_id to customers

## 🧪 TESTING CHECKLIST
- [ ] Test payment with test card numbers
- [ ] Verify webhook delivery
- [ ] Test failed payment scenarios
- [ ] Confirm email notifications work
- [ ] Test QuickBooks sync

## 🚀 SUCCESS METRICS
- Process first $1 test payment
- Receive webhook notification
- Generate payment confirmation
- Sync payment to QuickBooks
- Ready to go live and replace Thryv Pay!

## NEXT: Once payments work, add email automation to replace Thryv marketing
