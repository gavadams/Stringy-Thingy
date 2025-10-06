// Test email function
console.log('🧪 Testing email function...');

// Test the email endpoint
fetch('/api/test-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'test@example.com',
    orderId: 'test-order-123',
    total: 99.99,
    products: [{
      name: 'Test Kit',
      kit_type: 'starter',
      quantity: 1,
      price: 99.99
    }],
    kitCodes: [{
      code: 'TEST123',
      kit_type: 'starter',
      max_generations: 2
    }]
  })
})
.then(response => {
  console.log('Email test response status:', response.status);
  return response.text();
})
.then(text => {
  console.log('Email test response:', text);
})
.catch(error => {
  console.error('Email test error:', error);
});
