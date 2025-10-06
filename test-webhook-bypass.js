// Test webhook logic without signature verification
// This will help us see if the webhook logic works

console.log('Testing webhook logic...');

// Create a test payload that matches Stripe's format
const testPayload = {
  id: 'evt_test_webhook',
  object: 'event',
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_manual_webhook',
      customer_email: 'test@example.com',
      amount_total: 4999,
      payment_intent: 'pi_test_manual',
      metadata: {
        productIds: 'test-product-1,test-product-2',
        kitTypes: 'starter,standard',
        quantities: '1,2'
      },
      customer_details: {
        name: 'Test Customer',
        email: 'test@example.com'
      }
    }
  }
};

// Test the webhook endpoint
fetch('/api/webhooks/stripe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'stripe-signature': 't=1234567890,v1=test_signature'
  },
  body: JSON.stringify(testPayload)
})
.then(response => {
  console.log('Webhook response status:', response.status);
  return response.text();
})
.then(text => {
  console.log('Webhook response:', text);
})
.catch(error => {
  console.error('Webhook error:', error);
});
