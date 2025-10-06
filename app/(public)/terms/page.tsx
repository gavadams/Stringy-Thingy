import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Scale, Shield, AlertTriangle } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The terms and conditions for using Stringy-Thingy
          </p>
          <p className="text-sm text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Acceptance of Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                By accessing and using the Stringy-Thingy website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </CardContent>
          </Card>

          {/* Use License */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Scale className="w-5 h-5 mr-2" />
                Use License
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Permitted Use</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Browse and purchase string art kits</li>
                    <li>• Use kit codes to generate patterns</li>
                    <li>• Create and share your string art</li>
                    <li>• Access customer support services</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Prohibited Use</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Reselling kit codes or patterns</li>
                    <li>• Reverse engineering our products</li>
                    <li>• Using the service for illegal activities</li>
                    <li>• Attempting to gain unauthorized access</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Kit Contents</h3>
                  <p className="text-sm text-gray-600">
                    Each Stringy-Thingy kit includes string, pegs, instructions, and access to our pattern generation system. Kit contents may vary slightly based on the specific kit type ordered.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Kit Codes</h3>
                  <p className="text-sm text-gray-600">
                    Kit codes are unique to each purchase and provide access to our pattern generation system. Codes are non-transferable and may have usage limits based on the kit type purchased.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Digital Products</h3>
                  <p className="text-sm text-gray-600">
                    Digital products, including kit codes and generated patterns, are delivered electronically and are non-refundable once accessed or used.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Payment Processing</h3>
                  <p className="text-sm text-gray-600">
                    All payments are processed securely through Stripe. We accept major credit cards and other payment methods supported by Stripe.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Pricing</h3>
                  <p className="text-sm text-gray-600">
                    All prices are listed in USD and include applicable taxes. Prices are subject to change without notice, but orders are processed at the price shown at the time of purchase.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Refunds</h3>
                  <p className="text-sm text-gray-600">
                    Refunds are processed according to our return policy. Digital products (kit codes) are non-refundable once accessed or used.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  In no event shall Stringy-Thingy, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
                </p>
                <p className="text-sm text-gray-600">
                  Our total liability to you for all damages shall not exceed the amount you paid for the service in the 12 months preceding the claim.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle>Governing Law</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                These terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. Any disputes arising from these terms or your use of the service shall be resolved in the courts of the United States.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new terms on this page and updating the "Last updated" date. Your continued use of the service after any such changes constitutes your acceptance of the new terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Questions About Terms?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  If you have questions about these terms of service, please contact us.
                </p>
                <p className="text-sm text-gray-500">
                  Email: legal@stringy-thingy.com<br />
                  Phone: +1 (555) 123-4567
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
