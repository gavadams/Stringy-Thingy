import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Shield, Clock } from 'lucide-react';

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Returns & Exchanges</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Easy returns and exchanges for your Stringy-Thingy purchases
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Return Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <RefreshCw className="w-5 h-5 mr-2" />
                Return Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">30-Day Return Window</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    You have 30 days from the delivery date to return your kit for a full refund.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Kit must be unopened and unused</li>
                    <li>• Original packaging required</li>
                    <li>• Kit codes must not be redeemed</li>
                    <li>• Return shipping is free</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">What&apos;s Not Returnable</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Opened or used kits</li>
                    <li>• Kits with redeemed codes</li>
                    <li>• Custom or personalized items</li>
                    <li>• Digital products (kit codes)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Return Process */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowLeft className="w-5 h-5 mr-2" />
                How to Return
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Contact Support</h3>
                    <p className="text-sm text-gray-600">
                      Email us at returns@stringy-thingy.com with your order number and reason for return.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Get Return Label</h3>
                    <p className="text-sm text-gray-600">
                      We&apos;ll email you a prepaid return shipping label within 24 hours.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Package & Ship</h3>
                    <p className="text-sm text-gray-600">
                      Pack your kit in the original packaging and drop it off at any authorized location.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-sm">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Receive Refund</h3>
                    <p className="text-sm text-gray-600">
                      Once we receive and inspect your return, we&apos;ll process your refund within 5-7 business days.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exchange Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <RefreshCw className="w-5 h-5 mr-2" />
                Exchanges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Size Exchanges</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Need a different kit size? We offer free exchanges within 30 days.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Free return shipping</li>
                    <li>• Free exchange shipping</li>
                    <li>• Price difference handling</li>
                    <li>• Same return process</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Defective Items</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    If your kit arrives damaged or defective, we&apos;ll send a replacement immediately.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Photo documentation required</li>
                    <li>• Priority replacement</li>
                    <li>• No return shipping needed</li>
                    <li>• Full refund option available</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Processing Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <Badge className="mb-2">Return Request</Badge>
                  <h3 className="font-semibold mb-2">Within 24 Hours</h3>
                  <p className="text-sm text-gray-600">Return label sent</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Badge className="mb-2">Package Received</Badge>
                  <h3 className="font-semibold mb-2">3-5 Business Days</h3>
                  <p className="text-sm text-gray-600">Inspection completed</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Badge className="mb-2">Refund Processed</Badge>
                  <h3 className="font-semibold mb-2">5-7 Business Days</h3>
                  <p className="text-sm text-gray-600">Money back in account</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Have questions about returns or need assistance with your order?
                </p>
                <Button>
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
