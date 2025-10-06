// Test webhook logic without signature verification
console.log('🧪 Testing webhook logic...');

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

fetch('/api/webhooks/stripe-test', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testPayload)
})
.then(response => {
  console.log('Test webhook response status:', response.status);
  return response.text();
})
.then(text => {
  console.log('Test webhook response:', text);
})
.catch(error => {
  console.error('Test webhook error:', error);
});
