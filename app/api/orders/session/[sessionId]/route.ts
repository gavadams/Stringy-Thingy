import { NextRequest, NextResponse } from 'next/server';
import { getOrderBySessionId } from '@/lib/orders/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    console.log('Orders API called with sessionId:', sessionId);

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await getOrderBySessionId(sessionId);

    console.log('Order query result:', { data: !!data, error });

    if (error) {
      console.error('Order query error:', error);
      return NextResponse.json(
        { error },
        { status: 500 }
      );
    }

    if (!data) {
      console.log('No order found for session:', sessionId);
      return NextResponse.json(
        { 
          error: 'Order not found. The webhook may still be processing your payment.',
          order: null 
        },
        { status: 404 }
      );
    }

    console.log('Order found, returning data');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching order by session ID:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
