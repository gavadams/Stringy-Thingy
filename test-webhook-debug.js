// Simple test to check webhook functionality
// Run this in your browser console on the success page

console.log('Testing webhook functionality...');

// Check if we can see the order data
fetch('/api/orders/session/cs_test_a1MTPOrfCg32BKEaxJm0BjOghLy5WgS7LtUv1Uf3ht9bGrDhUDz46jSzJH')
  .then(response => response.json())
  .then(data => {
    console.log('Order data:', data);
    
    if (data.kit_codes && data.kit_codes.length > 0) {
      console.log('✅ Kit codes found:', data.kit_codes);
    } else {
      console.log('❌ No kit codes found');
    }
    
    if (data.order_items && data.order_items.length > 0) {
      console.log('✅ Order items found:', data.order_items);
    } else {
      console.log('❌ No order items found');
    }
  })
  .catch(error => {
    console.error('❌ Error fetching order:', error);
  });
