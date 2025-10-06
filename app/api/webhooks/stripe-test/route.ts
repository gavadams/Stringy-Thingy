import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateKitCodes } from '@/lib/codes/generator';
import { sendOrderConfirmation } from '@/lib/email/send';

// Test webhook without signature verification
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('🧪 Test webhook received!');
  
  try {
    const body = await request.json();
    console.log('📦 Test webhook body:', JSON.stringify(body, null, 2));

    if (body.type === 'checkout.session.completed') {
      const session = body.data.object;
      console.log('🎯 Processing test checkout session:', session.id);
      
      await handleCheckoutSessionCompleted(session);
      
      return NextResponse.json({ success: true, message: 'Test webhook processed' });
    }

    return NextResponse.json({ success: true, message: 'Event type not handled' });
  } catch (error) {
    console.error('❌ Test webhook error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: {
  id: string;
  customer_email: string;
  amount_total: number;
  payment_intent: string | { id: string };
  metadata: {
    productIds: string;
    kitTypes: string;
    quantities: string;
  };
  customer_details?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: Record<string, unknown>;
  };
}) {
  console.log('🎯 Processing test checkout session completed:', session.id);
  console.log('📧 Customer email:', session.customer_email);
  console.log('💰 Amount total:', session.amount_total);
  console.log('📦 Session metadata:', session.metadata);

  // Validate required fields
  if (!session.customer_email) {
    throw new Error('Customer email is required');
  }

  if (!session.metadata) {
    throw new Error('Session metadata is required');
  }

  if (!session.payment_intent) {
    throw new Error('Payment intent is required');
  }

  // Extract payment intent ID
  const paymentIntentId = typeof session.payment_intent === 'string' 
    ? session.payment_intent 
    : session.payment_intent.id;

  console.log('💳 Payment intent ID:', paymentIntentId);

  // Validate environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Extract order details from session metadata
  const { productIds, kitTypes, quantities } = session.metadata;

  if (!productIds || !kitTypes || !quantities) {
    throw new Error('Missing required metadata in session');
  }

  const productIdArray = productIds.split(',');
  const quantityArray = quantities.split(',').map((q: string) => {
    const parsed = parseInt(q, 10);
    if (isNaN(parsed) || parsed <= 0) {
      throw new Error(`Invalid quantity: ${q}`);
    }
    return parsed;
  });

  console.log('📦 Product IDs:', productIdArray);
  console.log('🔢 Quantities:', quantityArray);

  // Get product details from database
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, price, kit_type, images')
    .in('id', productIdArray);

  if (productsError) {
    throw new Error(`Failed to fetch products: ${productsError.message}`);
  }

  if (!products || products.length === 0) {
    throw new Error('No products found');
  }

  if (products.length !== productIdArray.length) {
    throw new Error(`Expected ${productIdArray.length} products, found ${products.length}`);
  }

  console.log('✅ Products found:', products.length);

  // Calculate total
  const total = products.reduce((sum, product, index) => {
    return sum + (product.price * quantityArray[index]);
  }, 0);

  console.log('💰 Total calculated:', total);

  // Create order record
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      email: session.customer_email,
      stripe_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
      total_amount: total,
      status: 'paid',
      customer_name: session.customer_details?.name ?? null,
      phone: session.customer_details?.phone ?? null,
      shipping_address: session.customer_details?.address || null,
      billing_address: session.customer_details?.address || null,
      order_items: products.map((product, index) => ({
        id: product.id,
        name: product.name,
        kit_type: product.kit_type,
        quantity: quantityArray[index],
        price: product.price,
        image: (product.images && product.images.length > 0) ? product.images[0] : null
      })),
      notes: 'Order created via test webhook'
    })
    .select()
    .single();

  if (orderError) {
    throw new Error(`Failed to create order: ${orderError.message}`);
  }

  console.log('✅ Order created:', order.id);

  // Generate kit codes for each product
  const allKitCodes: Array<{ code: string; kit_type: string; max_generations: number }> = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const quantity = quantityArray[i];
    
    console.log(`🔑 Generating ${quantity} codes for ${product.name} (${product.kit_type})`);
    
    const codeResult = await generateKitCodes(quantity, product.kit_type);
    
    if (!codeResult.success || !codeResult.codes) {
      throw new Error(`Failed to generate codes for ${product.name}: ${codeResult.error}`);
    }

    console.log(`✅ Generated codes:`, codeResult.codes);

    codeResult.codes.forEach(code => {
      allKitCodes.push({
        code,
        kit_type: product.kit_type,
        max_generations: getMaxGenerations(product.kit_type)
      });
    });
  }

  // Update order with kit codes
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      kit_codes: allKitCodes.map(kit => kit.code)
    })
    .eq('id', order.id);

  if (updateError) {
    console.error('Failed to update order with kit codes:', updateError);
  } else {
    console.log('✅ Order updated with kit codes');
  }

  // Send confirmation email
  try {
    await sendOrderConfirmation({
      email: session.customer_email,
      orderId: order.id,
      total: total,
      products: products.map((product, index) => ({
        name: product.name,
        kit_type: product.kit_type,
        quantity: quantityArray[index],
        price: product.price
      })),
      kitCodes: allKitCodes
    });
    
    console.log('✅ Confirmation email sent to:', session.customer_email);
  } catch (emailError) {
    console.error('❌ Failed to send confirmation email:', emailError);
    // Don't fail the webhook for email errors
  }

  console.log('🎉 Successfully processed test order:', order.id);
}

function getMaxGenerations(kitType: string): number {
  switch (kitType.toLowerCase()) {
    case 'starter':
      return 2;
    case 'standard':
      return 3;
    case 'premium':
      return 5;
    default:
      return 2;
  }
}
