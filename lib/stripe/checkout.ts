import { stripe } from './client';
// import { Database } from '@/types/database.types';

// type Product = Database['public']['Tables']['products']['Row'];

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  kit_type: string;
  images?: string[];
}

export interface CheckoutSessionData {
  items: CartItem[];
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession({
  items,
  customerEmail,
  successUrl,
  cancelUrl,
}: CheckoutSessionData) {
  try {
    // Validate items
    if (!items || items.length === 0) {
      throw new Error('No items in cart');
    }

    // Create line items for Stripe
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: `${item.kit_type} String Art Kit`,
          images: item.images && item.images.length > 0 ? [item.images[0]] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Create metadata for order tracking
    const metadata = {
      productIds: items.map(item => item.id).join(','),
      kitTypes: items.map(item => item.kit_type).join(','),
      quantities: items.map(item => item.quantity.toString()).join(','),
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0).toString(),
    };

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE'],
      },
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
    });

    return {
      success: true,
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create checkout session',
    };
  }
}
