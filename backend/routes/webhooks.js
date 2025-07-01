// Stripe Webhook Handler
// This processes payment notifications from Stripe

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// Webhook endpoint for Stripe events
router.post('/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // Now properly configured!

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log('✅ Webhook signature verified:', event.type);
  } catch (err) {
    console.log(`❌ Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaid(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoiceFailed(event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'charge.dispute.created':
        await handleChargeback(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({error: 'Webhook processing failed'});
  }
});

// Handle successful payment
async function handlePaymentSuccess(paymentIntent) {
  console.log('💳 Payment succeeded:', paymentIntent.id);
  
  try {
    // Get estimate/invoice ID from metadata
    const estimateId = paymentIntent.metadata.estimateId;
    const customerId = paymentIntent.customer;
    const amount = paymentIntent.amount_received / 100; // Convert from cents

    // Update estimate status in database
    if (estimateId) {
      await updateEstimateStatus(estimateId, 'paid', {
        stripePaymentId: paymentIntent.id,
        amountPaid: amount,
        paidAt: new Date()
      });
    }

    // Sync to QuickBooks
    await syncPaymentToQuickBooks({
      stripePaymentId: paymentIntent.id,
      customerId: customerId,
      amount: amount,
      estimateId: estimateId,
      description: paymentIntent.description
    });

    // Send confirmation email to customer
    await sendPaymentConfirmationEmail(customerId, {
      amount: amount,
      paymentId: paymentIntent.id,
      estimateId: estimateId
    });

    // Trigger next workflow step (e.g., schedule installation)
    if (estimateId) {
      await triggerProjectWorkflow(estimateId, 'payment_received');
    }

  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

// Handle failed payment
async function handlePaymentFailed(paymentIntent) {
  console.log('❌ Payment failed:', paymentIntent.id);
  
  try {
    const estimateId = paymentIntent.metadata.estimateId;
    const customerId = paymentIntent.customer;
    
    // Update estimate status
    if (estimateId) {
      await updateEstimateStatus(estimateId, 'payment_failed', {
        stripePaymentId: paymentIntent.id,
        failureReason: paymentIntent.last_payment_error?.message
      });
    }

    // Send payment failed notification
    await sendPaymentFailedEmail(customerId, {
      estimateId: estimateId,
      failureReason: paymentIntent.last_payment_error?.message,
      retryUrl: `${process.env.FRONTEND_URL}/pay/${estimateId}`
    });

    // Notify sales team
    await notifyTeamPaymentFailed(estimateId, customerId);

  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

// Handle invoice payment success
async function handleInvoicePaid(invoice) {
  console.log('📄 Invoice paid:', invoice.id);
  
  try {
    // Update invoice status in CRM
    await updateInvoiceStatus(invoice.id, 'paid');
    
    // Sync to QuickBooks
    await syncInvoicePaymentToQuickBooks(invoice);
    
    // Send receipt
    await sendInvoiceReceiptEmail(invoice.customer, invoice);
    
  } catch (error) {
    console.error('Error handling invoice payment:', error);
  }
}

// Handle chargeback/dispute
async function handleChargeback(charge) {
  console.log('⚠️ Chargeback created:', charge.id);
  
  try {
    // Notify team immediately
    await notifyTeamChargeback({
      chargeId: charge.id,
      amount: charge.amount / 100,
      reason: charge.dispute_reason,
      customer: charge.customer
    });
    
    // Log in CRM for follow-up
    await logChargebackInCRM(charge);
    
  } catch (error) {
    console.error('Error handling chargeback:', error);
  }
}

// Test webhook endpoint
router.get('/webhooks/stripe/test', (req, res) => {
  res.json({
    message: 'Stripe webhook endpoint is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

module.exports = router;
