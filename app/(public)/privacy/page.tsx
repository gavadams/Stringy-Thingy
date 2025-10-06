import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Lock, Database } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            How we collect, use, and protect your personal information
          </p>
          <p className="text-sm text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Personal Information</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Name and contact information (email, phone, address)</li>
                    <li>• Payment information (processed securely through Stripe)</li>
                    <li>• Order history and preferences</li>
                    <li>• Account credentials (if you create an account)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Usage Information</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Website usage patterns and analytics</li>
                    <li>• Device information and browser type</li>
                    <li>• IP address and location data</li>
                    <li>• Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Order Processing</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Process and fulfill your orders</li>
                    <li>• Send order confirmations and updates</li>
                    <li>• Generate and deliver kit codes</li>
                    <li>• Handle returns and exchanges</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Customer Service</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Respond to your inquiries</li>
                    <li>• Provide technical support</li>
                    <li>• Send important service updates</li>
                    <li>• Improve our products and services</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Security Measures</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• SSL encryption for all data transmission</li>
                    <li>• Secure payment processing through Stripe</li>
                    <li>• Regular security audits and updates</li>
                    <li>• Limited access to personal information</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Data Storage</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Information stored on secure, encrypted servers</li>
                    <li>• Regular backups with encryption</li>
                    <li>• Compliance with industry standards</li>
                    <li>• Regular data retention reviews</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Third-Party Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Payment Processing</h3>
                  <p className="text-sm text-gray-600">
                    We use Stripe for payment processing. Your payment information is handled securely by Stripe and never stored on our servers.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Email Services</h3>
                  <p className="text-sm text-gray-600">
                    We use Resend for sending order confirmations and updates. Your email address is shared only for order-related communications.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Analytics</h3>
                  <p className="text-sm text-gray-600">
                    We use Vercel Analytics to understand how our website is used. This data is anonymized and used to improve our service.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle>Your Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Access & Control</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Request a copy of your personal data</li>
                    <li>• Update or correct your information</li>
                    <li>• Delete your account and data</li>
                    <li>• Opt out of marketing communications</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Data Portability</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Export your order history</li>
                    <li>• Transfer data to another service</li>
                    <li>• Request data in a common format</li>
                    <li>• Receive your data within 30 days</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Questions About Privacy?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  If you have questions about this privacy policy or how we handle your data, please contact us.
                </p>
                <p className="text-sm text-gray-500">
                  Email: privacy@stringy-thingy.com<br />
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
