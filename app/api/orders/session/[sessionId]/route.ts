import { NextRequest, NextResponse } from 'next/server';
import { getOrderBySessionId } from '@/lib/orders/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await getOrderBySessionId(sessionId);

    if (error) {
      return NextResponse.json(
        { error },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { 
          error: 'Order not found. The webhook may still be processing your payment.',
          order: null 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching order by session ID:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
