"use client";

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Mail, 
  Copy, 
  ArrowRight,
  Package,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useCartStore } from '@/lib/cart/store';

interface OrderDetails {
  id: string;
  email: string;
  total_amount: number;
  status: string;
  created_at: string;
  stripe_session_id: string;
  order_items: Array<{
    name: string;
    kit_type: string;
    quantity: number;
    price: number;
  }>;
  kit_codes: string[];
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCartStore();
  
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchOrderDetails = useCallback(async (sessionId: string, currentRetry: number) => {
    const MAX_RETRIES = 6;
    const RETRY_DELAY = 2000; // 2 seconds

    console.log(`Fetching order details for session: ${sessionId}, retry: ${currentRetry}`);

    try {
      const response = await fetch(`/api/orders/session/${sessionId}`);
      const data = await response.json();

      console.log('API response:', { status: response.status, data });

      if (!response.ok) {
        if (response.status === 404 && currentRetry < MAX_RETRIES) {
          // Order not found yet, webhook may still be processing
          console.log(`Order not found, retrying in ${RETRY_DELAY}ms... (${currentRetry + 1}/${MAX_RETRIES})`);
          setRetryCount(currentRetry + 1);
          
          setTimeout(() => {
            fetchOrderDetails(sessionId, currentRetry + 1);
          }, RETRY_DELAY);
          return;
        }
        
        if (response.status === 404) {
          // Max retries reached
          console.log('Max retries reached, showing processing message');
          setError('Your payment is being processed. Please check your email for confirmation or refresh this page in a moment.');
          setLoading(false);
          return;
        }
        
        throw new Error(data.error || 'Failed to fetch order details');
      }

      // Success! Order found
      console.log('Order found successfully:', data);
      setOrder(data);
      setLoading(false);
      setError(null);
      
      // Clear the cart since the order was successful
      clearCart();
      console.log('Cart cleared after successful order');
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load order details');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionId) {
      fetchOrderDetails(sessionId, 0);
    } else {
      setError('No session ID provided');
      setLoading(false);
    }
  }, [sessionId, fetchOrderDetails]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleRetry = () => {
    if (sessionId) {
      setLoading(true);
      setError(null);
      setRetryCount(0);
      fetchOrderDetails(sessionId, 0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">Processing your order...</p>
          <p className="text-gray-600 text-sm">
            {retryCount > 0 ? `Checking... (${retryCount}/6)` : 'Loading your order details...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-yellow-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Processing Payment
              </h1>
              <p className="text-gray-600 mb-6">
                {error || 'We couldn\'t find your order details.'}
              </p>
              <div className="space-y-3">
                <Button onClick={handleRetry} className="w-full">
                  Refresh Order Status
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/shop">
                    Return to Shop
                  </Link>
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Your order confirmation will be sent to your email shortly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Thank you for your purchase
          </p>
          <p className="text-gray-500">
            Order #{order.id.slice(-8).toUpperCase()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono text-sm">{order.id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="text-sm">{order.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="text-sm">
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold">${order.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {order.status}
                </Badge>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Products Ordered:</h4>
                <div className="space-y-2">
                  {order.order_items.map((product, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{product.name} ({product.kit_type})</span>
                      <span>×{product.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kit Codes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Your Kit Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Your kit codes have been sent to <strong>{order.email}</strong>
                </p>
                
                <div className="space-y-3">
                  {order.kit_codes.map((code, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-mono font-semibold text-lg">
                          {code}
                        </div>
                        <div className="text-sm text-gray-600">
                          Kit Code {index + 1}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(code)}
                        className="ml-2"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Next Steps:</h4>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Check your email for the confirmation</li>
                    <li>2. Use your kit codes to generate patterns</li>
                    <li>3. Follow the instructions in your kit</li>
                    <li>4. Create beautiful string art!</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Link href="/dashboard">
              <ArrowRight className="w-5 h-5 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/shop">
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Main export with Suspense wrapper
export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}