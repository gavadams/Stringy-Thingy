import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, CartItem } from '@/lib/stripe/checkout';
import { createClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { items, customerEmail } = await request.json();

    // Validate request
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      );
    }

    // Validate cart items against database
    const supabase = createClient();
    const productIds = items.map((item: CartItem) => item.id);
    
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, kit_type, is_active')
      .in('id', productIds);

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return NextResponse.json(
        { error: 'Failed to validate products' },
        { status: 500 }
      );
    }

    if (!products || products.length !== items.length) {
      return NextResponse.json(
        { error: 'Some products not found or invalid' },
        { status: 400 }
      );
    }

    // Validate that all products are active
    const inactiveProducts = products.filter(p => !p.is_active);
    if (inactiveProducts.length > 0) {
      return NextResponse.json(
        { error: 'Some products are no longer available' },
        { status: 400 }
      );
    }

    // Validate prices to prevent manipulation
    for (const item of items) {
      const product = products.find(p => p.id === item.id);
      console.log('Price validation:', {
        itemId: item.id,
        itemPrice: item.price,
        itemPriceType: typeof item.price,
        productPrice: product?.price,
        productPriceType: typeof product?.price,
        pricesMatch: product?.price === item.price
      });
      
      if (!product || product.price !== item.price) {
        return NextResponse.json(
          { error: 'Product prices have changed. Please refresh and try again.' },
          { status: 400 }
        );
      }
    }

    // Create checkout session
    const result = await createCheckoutSession({
      items,
      customerEmail,
      successUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/cancel`,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sessionId: result.sessionId,
      url: result.url,
    });
  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
