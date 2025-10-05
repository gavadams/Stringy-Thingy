"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  XCircle, 
  ShoppingBag, 
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="w-full">
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              {/* Icon */}
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12 text-orange-600" />
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Checkout Cancelled
              </h1>
              
              {/* Description */}
              <p className="text-xl text-gray-600 mb-8">
                Your payment was cancelled. No charges have been made to your account.
              </p>

              {/* Info Box */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-center mb-4">
                  <ShoppingBag className="w-6 h-6 text-gray-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Your Cart is Preserved
                  </h3>
                </div>
                <p className="text-gray-600">
                  Don&apos;t worry! Your items are still in your cart and ready for checkout whenever you&apos;re ready.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Link href="/shop">
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Try Checkout Again
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="lg">
                  <Link href="/shop">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Return to Shop
                  </Link>
                </Button>
              </div>

              {/* Help Text */}
              <div className="mt-8 text-sm text-gray-500">
                <p>
                  Having trouble with checkout? 
                  <Link href="/contact" className="text-purple-600 hover:text-purple-700 ml-1">
                    Contact our support team
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
