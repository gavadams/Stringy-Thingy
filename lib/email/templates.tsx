import React from 'react';

interface OrderConfirmationEmailProps {
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

export function OrderConfirmationEmail({
  orderId,
  total,
  products,
  kitCodes
}: OrderConfirmationEmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
        color: 'white',
        padding: '30px',
        textAlign: 'center',
        borderRadius: '8px 8px 0 0'
      }}>
        <h1 style={{ margin: '0', fontSize: '28px', fontWeight: 'bold' }}>
          🎨 Stringy-Thingy
        </h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '16px', opacity: '0.9' }}>
          Your Order is Confirmed!
        </p>
      </div>

      {/* Main Content */}
      <div style={{ 
        background: 'white',
        padding: '30px',
        border: '1px solid #E5E7EB',
        borderTop: 'none'
      }}>
        {/* Order Details */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#374151', fontSize: '20px', marginBottom: '15px' }}>
            Order Details
          </h2>
          <div style={{ 
            background: '#F9FAFB',
            padding: '15px',
            borderRadius: '6px',
            border: '1px solid #E5E7EB'
          }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
              <strong>Order ID:</strong> #{orderId.slice(-8).toUpperCase()}
            </p>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
              <strong>Total:</strong> ${total.toFixed(2)}
            </p>
            <p style={{ margin: '0', fontSize: '14px' }}>
              <strong>Date:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Products */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#374151', fontSize: '20px', marginBottom: '15px' }}>
            Products Ordered
          </h2>
          {products.map((product, index) => (
            <div key={index} style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              background: index % 2 === 0 ? '#F9FAFB' : 'white',
              border: '1px solid #E5E7EB',
              borderTop: index === 0 ? '1px solid #E5E7EB' : 'none'
            }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#374151' }}>
                  {product.name}
                </div>
                <div style={{ fontSize: '14px', color: '#6B7280' }}>
                  {product.kit_type} • Qty: {product.quantity}
                </div>
              </div>
              <div style={{ fontWeight: 'bold', color: '#374151' }}>
                ${(product.price * product.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Kit Codes */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#374151', fontSize: '20px', marginBottom: '15px' }}>
            🎁 Your Kit Codes
          </h2>
          <div style={{ 
            background: '#F0FDF4',
            border: '2px solid #22C55E',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <p style={{ 
              margin: '0 0 15px 0',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#166534'
            }}>
              Save these codes - you&apos;ll need them to generate your patterns!
            </p>
            
            <div style={{ display: 'grid', gap: '10px' }}>
              {kitCodes.map((kit, index) => (
                <div key={index} style={{
                  background: 'white',
                  border: '1px solid #22C55E',
                  borderRadius: '6px',
                  padding: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ 
                      fontFamily: 'monospace',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#166534'
                    }}>
                      {kit.code}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>
                      {kit.kit_type} • {kit.max_generations} generations
                    </div>
                  </div>
                  <div style={{ 
                    background: '#22C55E',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    ACTIVE
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#374151', fontSize: '20px', marginBottom: '15px' }}>
            🚀 Next Steps
          </h2>
          <div style={{ 
            background: '#EFF6FF',
            border: '1px solid #3B82F6',
            borderRadius: '6px',
            padding: '20px'
          }}>
            <ol style={{ margin: '0', paddingLeft: '20px', color: '#1E40AF' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong>Visit your dashboard:</strong> Go to your account to manage your codes
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Generate patterns:</strong> Use your kit codes to create custom string art patterns
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Follow instructions:</strong> Use the step-by-step guide included with your kit
              </li>
              <li style={{ marginBottom: '0' }}>
                <strong>Create art:</strong> Bring your vision to life with beautiful string art!
              </li>
            </ol>
          </div>
        </div>

        {/* Support */}
        <div style={{ 
          background: '#F9FAFB',
          border: '1px solid #E5E7EB',
          borderRadius: '6px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#374151', fontSize: '16px', marginBottom: '10px' }}>
            Need Help?
          </h3>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6B7280' }}>
            If you have any questions about your order or need assistance with your kit codes,
          </p>
          <p style={{ margin: '0', fontSize: '14px' }}>
            <a href="mailto:support@stringy-thingy.com" style={{ 
              color: '#8B5CF6',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>
              Contact our support team
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        background: '#F3F4F6',
        padding: '20px',
        textAlign: 'center',
        borderRadius: '0 0 8px 8px',
        border: '1px solid #E5E7EB',
        borderTop: 'none'
      }}>
        <p style={{ margin: '0', fontSize: '12px', color: '#6B7280' }}>
          © 2024 Stringy-Thingy. All rights reserved.
        </p>
        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
          Thank you for choosing Stringy-Thingy for your string art journey!
        </p>
      </div>
    </div>
  );
}
