import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@supabase/supabase-js';
import { generateKitCodes } from '@/lib/codes/generator';
import { sendOrderConfirmation } from '@/lib/email/send';

export async function POST(request: NextRequest) {
  console.log('Webhook received!');
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  console.log('Webhook signature:', signature ? 'Present' : 'Missing');
  console.log('Webhook body length:', body.length);

  if (!signature) {
    console.error('No Stripe signature found');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('Received webhook event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object.id);
        break;
      
      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object.id);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      event: event?.type
    });
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: { id: string; customer_email: string | null; metadata: Record<string, string> | null; payment_intent: string | { id: string } | null; shipping_details?: { address: Record<string, unknown> } | null; customer_details?: { name?: string | null; phone?: string | null; address?: Record<string, unknown> } | null }) {
  console.log('Processing checkout session completed:', session.id);
  console.log('Session metadata:', session.metadata);
  console.log('Customer email:', session.customer_email);

  // Check if customer email is available
  if (!session.customer_email) {
    console.error('No customer email found in session');
    throw new Error('Customer email is required');
  }

  // Check if metadata is available
  if (!session.metadata) {
    console.error('No metadata found in session');
    throw new Error('Session metadata is required');
  }

  // Check if payment intent is available
  if (!session.payment_intent) {
    console.error('No payment intent found in session');
    throw new Error('Payment intent is required');
  }

  // Extract payment intent ID (could be string or object)
  const paymentIntentId = typeof session.payment_intent === 'string' 
    ? session.payment_intent 
    : session.payment_intent.id;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Extract order details from session metadata
    const productIds = session.metadata.productIds;
    const kitTypes = session.metadata.kitTypes;
    const quantities = session.metadata.quantities;

    if (!productIds || !kitTypes || !quantities) {
      throw new Error('Missing required metadata in session');
    }

    const productIdArray = productIds.split(',');
    // const kitTypeArray = kitTypes.split(',');
    const quantityArray = quantities.split(',').map((q: string) => parseInt(q, 10));

    // Get product details from database
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, kit_type, images')
      .in('id', productIdArray);

    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`);
    }

    if (!products || products.length !== productIdArray.length) {
      throw new Error('Some products not found');
    }

    // Calculate total
    const total = products.reduce((sum, product, index) => {
      return sum + (product.price * quantityArray[index]);
    }, 0);

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
        shipping_address: session.shipping_details?.address || null,
        billing_address: session.customer_details?.address || null,
        order_items: products.map((product, index) => ({
          id: product.id,
          name: product.name,
          kit_type: product.kit_type,
          quantity: quantityArray[index],
          price: product.price,
          image: (product.images && product.images.length > 0) ? product.images[0] : null
        })),
        notes: 'Order created via Stripe webhook'
      })
      .select()
      .single();

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    console.log('Order created:', order.id);

    // Generate kit codes for each product
    const allKitCodes: Array<{ code: string; kit_type: string; max_generations: number }> = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const quantity = quantityArray[i];
      
      // Generate codes for this product
      const codeResult = await generateKitCodes(quantity, product.kit_type);
      
      if (!codeResult.success || !codeResult.codes) {
        throw new Error(`Failed to generate codes for ${product.name}: ${codeResult.error}`);
      }

      // Add to our collection
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
      
      console.log('Confirmation email sent to:', session.customer_email);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the webhook for email errors
    }

    console.log('Successfully processed order:', order.id);
  } catch (error) {
    console.error('Error processing checkout session:', error);
    console.error('Session details:', {
      id: session.id,
      customer_email: session.customer_email,
      metadata: session.metadata
    });
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
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
