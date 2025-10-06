import { Resend } from 'resend';
import { OrderConfirmationEmail } from './templates';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set in environment variables');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export interface OrderDetails {
  email: string;
  orderId: string;
  total: number;
  products: Array<{
    name: string;
    kit_type: string;
    quantity: number;
    price: number;
  }>;
  kitCodes: Array<{
    code: string;
    kit_type: string;
    max_generations: number;
  }>;
}

export async function sendOrderConfirmation(orderDetails: OrderDetails) {
  try {
    console.log('📧 Attempting to send email to:', orderDetails.email);
    console.log('📧 Order details:', {
      orderId: orderDetails.orderId,
      total: orderDetails.total,
      productsCount: orderDetails.products.length,
      kitCodesCount: orderDetails.kitCodes.length
    });

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(orderDetails.email)) {
      throw new Error(`Invalid email format: ${orderDetails.email}`);
    }

    // Use a verified domain or fallback to a simple email
    const fromEmail = 'Stringy-Thingy <onboarding@resend.dev>'; // Use Resend's default domain for testing
    
    console.log('📧 Sending email from:', fromEmail);
    console.log('📧 Sending email to:', orderDetails.email);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [orderDetails.email],
      subject: `🎨 Your Stringy-Thingy Order is Confirmed! #${orderDetails.orderId.slice(-8).toUpperCase()}`,
      react: OrderConfirmationEmail({
        orderId: orderDetails.orderId,
        total: orderDetails.total,
        products: orderDetails.products,
        kitCodes: orderDetails.kitCodes
      }),
    });

    if (error) {
      console.error('❌ Resend error:', error);
      throw new Error(`Failed to send email: ${JSON.stringify(error)}`);
    }

    console.log('✅ Order confirmation email sent successfully:', data);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    throw error;
  }
}

export async function sendShippingNotification(email: string, orderId: string, trackingNumber?: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Stringy-Thingy <shipping@stringy-thingy.com>',
      to: [email],
      subject: `📦 Your Stringy-Thingy Order Has Shipped! #${orderId.slice(-8).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">📦 Your Order Has Shipped!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Order #${orderId.slice(-8).toUpperCase()}</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #E5E7EB; border-top: none;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              Great news! Your Stringy-Thingy kit is on its way to you.
            </p>
            
            ${trackingNumber ? `
              <div style="background: #F0FDF4; border: 2px solid #22C55E; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #166534; margin: 0 0 10px 0;">Tracking Information</h3>
                <p style="margin: 0; font-family: monospace; font-size: 18px; font-weight: bold; color: #166534;">
                  ${trackingNumber}
                </p>
              </div>
            ` : ''}
            
            <div style="background: #EFF6FF; border: 1px solid #3B82F6; border-radius: 6px; padding: 20px;">
              <h3 style="color: #1E40AF; margin: 0 0 10px 0;">What's Next?</h3>
              <ul style="margin: 0; padding-left: 20px; color: #1E40AF;">
                <li style="margin-bottom: 8px;">Your kit will arrive within 3-5 business days</li>
                <li style="margin-bottom: 8px;">Check your email for your kit codes</li>
                <li style="margin-bottom: 8px;">Start creating beautiful string art!</li>
              </ul>
            </div>
          </div>
          
          <div style="background: #F3F4F6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #E5E7EB; border-top: none;">
            <p style="margin: 0; font-size: 12px; color: #6B7280;">
              © 2024 Stringy-Thingy. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(`Failed to send shipping email: ${error.message}`);
    }

    console.log('Shipping notification email sent:', data);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error sending shipping notification:', error);
    throw error;
  }
}
