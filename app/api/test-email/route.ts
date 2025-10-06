import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmation } from '@/lib/email/send';

export async function POST(request: NextRequest) {
  try {
    const orderDetails = await request.json();
    
    console.log('🧪 Testing email with data:', orderDetails);
    
    const result = await sendOrderConfirmation(orderDetails);
    
    console.log('✅ Email test result:', result);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully',
      result 
    });
  } catch (error) {
    console.error('❌ Email test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
