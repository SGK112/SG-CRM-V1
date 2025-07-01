// Test Stripe Connection
// Run this to verify your Stripe API keys are working

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testStripeConnection() {
  console.log('🔍 Testing Stripe connection...\n');

  try {
    // Test 1: Get account information
    console.log('1. Testing account access...');
    const account = await stripe.accounts.retrieve();
    console.log(`✅ Connected to Stripe account: ${account.display_name || account.id}`);
    console.log(`   Business Type: ${account.business_type}`);
    console.log(`   Country: ${account.country}`);
    console.log(`   Charges Enabled: ${account.charges_enabled}`);
    console.log(`   Payouts Enabled: ${account.payouts_enabled}\n`);

    // Test 2: Create a test customer
    console.log('2. Testing customer creation...');
    const customer = await stripe.customers.create({
      email: 'test@example.com',
      name: 'Test Customer',
      description: 'CRM Test Customer'
    });
    console.log(`✅ Test customer created: ${customer.id}\n`);

    // Test 3: Create a payment intent
    console.log('3. Testing payment intent creation...');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 10000, // $100.00
      currency: 'usd',
      customer: customer.id,
      metadata: {
        estimateId: 'test-estimate-123',
        type: 'estimate_payment'
      }
    });
    console.log(`✅ Payment intent created: ${paymentIntent.id}`);
    console.log(`   Amount: $${paymentIntent.amount / 100}`);
    console.log(`   Status: ${paymentIntent.status}\n`);

    // Test 4: List recent charges
    console.log('4. Testing charges retrieval...');
    const charges = await stripe.charges.list({ limit: 3 });
    console.log(`✅ Retrieved ${charges.data.length} recent charges`);
    charges.data.forEach(charge => {
      console.log(`   ${charge.id}: $${charge.amount / 100} - ${charge.status}`);
    });

    // Clean up test customer
    await stripe.customers.del(customer.id);
    console.log(`\n🧹 Test customer deleted: ${customer.id}`);

    console.log('\n🎉 All Stripe tests passed! Your connection is working.');
    
    // Next steps
    console.log('\n📋 Next Steps:');
    console.log('1. Set up your webhook endpoint URL in Stripe dashboard');
    console.log('2. Copy the webhook signing secret to your .env file');
    console.log('3. Test webhook with: npm run test-webhook');
    
  } catch (error) {
    console.error('❌ Stripe test failed:', error.message);
    
    if (error.type === 'StripeAuthenticationError') {
      console.log('\n🔧 Fix: Check your STRIPE_SECRET_KEY in .env file');
    } else if (error.type === 'StripeConnectionError') {
      console.log('\n🔧 Fix: Check your internet connection');
    } else {
      console.log('\n🔧 Error details:', error);
    }
  }
}

// Test webhook signature verification
async function testWebhookSecret() {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.log('⚠️  STRIPE_WEBHOOK_SECRET not set in .env file');
    return;
  }

  console.log('🔐 Webhook secret is configured');
  console.log(`   Secret starts with: ${process.env.STRIPE_WEBHOOK_SECRET.substring(0, 10)}...`);
}

// Run tests
if (require.main === module) {
  console.log('🚀 Starting Stripe Connection Tests\n');
  testStripeConnection();
  testWebhookSecret();
}

module.exports = { testStripeConnection, testWebhookSecret };
