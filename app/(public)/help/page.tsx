import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  MessageCircle, 
  Phone, 
  Mail,
  ChevronRight,
  Lightbulb,
  Settings,
  Package
} from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions and get support for your Stringy-Thingy experience
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search for help articles..."
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Quick Help Categories */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Package className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Getting Started</h3>
                <p className="text-sm text-gray-600">Learn how to use your kit</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Settings className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Kit Codes</h3>
                <p className="text-sm text-gray-600">Using your pattern codes</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Lightbulb className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Troubleshooting</h3>
                <p className="text-sm text-gray-600">Common issues and fixes</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Tutorials</h3>
                <p className="text-sm text-gray-600">Step-by-step guides</p>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle className="w-5 h-5 mr-2" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <span className="font-medium">How do I use my kit code?</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <span className="font-medium">What&apos;s included in my kit?</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <span className="font-medium">How long does shipping take?</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <span className="font-medium">Can I return my kit?</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <span className="font-medium">How do I track my order?</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Popular Articles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <span className="font-medium">Setting up your first project</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <span className="font-medium">Understanding pattern generation</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <span className="font-medium">Troubleshooting common issues</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <span className="font-medium">Creating custom patterns</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <span className="font-medium">Sharing your creations</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Still Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 border rounded-lg">
                  <Mail className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Email Support</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Get help via email within 24 hours
                  </p>
                  <Button variant="outline" className="w-full">
                    Send Email
                  </Button>
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <Phone className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Phone Support</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Call us during business hours
                  </p>
                  <Button variant="outline" className="w-full">
                    Call Now
                  </Button>
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <MessageCircle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Live Chat</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Chat with us in real-time
                  </p>
                  <Button variant="outline" className="w-full">
                    Start Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
