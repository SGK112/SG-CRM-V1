// Payment Integration Service
// This will replace Thryv Pay functionality

import Stripe from 'stripe';
import QuickBooks from 'node-quickbooks';

class PaymentService {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    this.quickbooks = new QuickBooks({
      consumerKey: process.env.QB_CONSUMER_KEY,
      consumerSecret: process.env.QB_CONSUMER_SECRET,
      token: process.env.QB_ACCESS_TOKEN,
      tokenSecret: process.env.QB_ACCESS_TOKEN_SECRET,
      sandbox: process.env.NODE_ENV !== 'production'
    });
  }

  // Create payment intent for estimates
  async createPaymentIntent(amount, customerId, estimateId) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      customer: customerId,
      metadata: {
        estimateId: estimateId,
        type: 'estimate_payment'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  }

  // Sync payment to QuickBooks
  async syncPaymentToQuickBooks(paymentData) {
    const payment = {
      CustomerRef: { value: paymentData.customerId },
      TotalAmt: paymentData.amount,
      Line: [{
        Amount: paymentData.amount,
        LinkedTxn: [{
          TxnId: paymentData.invoiceId,
          TxnType: 'Invoice'
        }]
      }]
    };

    return await this.quickbooks.createPayment(payment);
  }

  // Create customer in both Stripe and QuickBooks
  async createCustomer(customerData) {
    // Create in Stripe
    const stripeCustomer = await this.stripe.customers.create({
      email: customerData.email,
      name: customerData.name,
      phone: customerData.phone,
      address: customerData.address
    });

    // Create in QuickBooks
    const qbCustomer = await this.quickbooks.createCustomer({
      Name: customerData.name,
      PrimaryEmailAddr: { Address: customerData.email },
      PrimaryPhone: { FreeFormNumber: customerData.phone },
      BillAddr: customerData.address
    });

    return {
      stripeId: stripeCustomer.id,
      quickbooksId: qbCustomer.Id
    };
  }

  // Generate invoice and sync to QuickBooks
  async createInvoice(invoiceData) {
    const invoice = {
      CustomerRef: { value: invoiceData.customerId },
      Line: invoiceData.items.map(item => ({
        Amount: item.amount,
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          ItemRef: { value: item.itemId },
          Qty: item.quantity,
          UnitPrice: item.unitPrice
        }
      }))
    };

    return await this.quickbooks.createInvoice(invoice);
  }
}

export default PaymentService;
