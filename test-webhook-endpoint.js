// Test webhook endpoint manually
// Run this in your browser console

console.log('Testing webhook endpoint...');

fetch('/api/webhooks/stripe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'stripe-signature': 'test-signature'
  },
  body: JSON.stringify({
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_manual',
        customer_email: 'test@example.com',
        metadata: {
          productIds: 'test-product-id',
          kitTypes: 'starter',
          quantities: '1'
        }
      }
    }
  })
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
