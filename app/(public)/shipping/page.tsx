import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Clock, Shield, Package } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Shipping Information</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about shipping your Stringy-Thingy kit
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Shipping Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Shipping Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <Badge className="mb-2">Standard</Badge>
                  <h3 className="font-semibold mb-2">3-5 Business Days</h3>
                  <p className="text-sm text-gray-600">Free on orders over $50</p>
                  <p className="text-2xl font-bold mt-2">$5.99</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Badge className="mb-2">Express</Badge>
                  <h3 className="font-semibold mb-2">1-2 Business Days</h3>
                  <p className="text-sm text-gray-600">Priority handling</p>
                  <p className="text-2xl font-bold mt-2">$12.99</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Badge className="mb-2">Overnight</Badge>
                  <h3 className="font-semibold mb-2">Next Business Day</h3>
                  <p className="text-sm text-gray-600">Before 10:30 AM</p>
                  <p className="text-2xl font-bold mt-2">$24.99</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processing Times */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Processing Times
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold">Order Processing</h3>
                    <p className="text-sm text-gray-600">Time from order to shipment</p>
                  </div>
                  <Badge variant="outline">1-2 Business Days</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold">Kit Assembly</h3>
                    <p className="text-sm text-gray-600">Custom kit preparation</p>
                  </div>
                  <Badge variant="outline">Same Day</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold">Quality Check</h3>
                    <p className="text-sm text-gray-600">Final inspection before shipping</p>
                  </div>
                  <Badge variant="outline">Same Day</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* International Shipping */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                International Shipping
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Available Countries</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    We ship to most countries worldwide. Contact us if your country isn't listed.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE'].map(country => (
                      <Badge key={country} variant="outline">{country}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">International Rates</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>North America</span>
                      <span>$15.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Europe</span>
                      <span>$19.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Asia Pacific</span>
                      <span>$24.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Other Regions</span>
                      <span>$29.99</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Protection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Shipping Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Package Protection</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Secure packaging for all kits</li>
                    <li>• Fragile item handling</li>
                    <li>• Weather-resistant materials</li>
                    <li>• Tracking number provided</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Insurance Coverage</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Full value protection</li>
                    <li>• Lost package replacement</li>
                    <li>• Damage coverage</li>
                    <li>• 30-day claim window</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
