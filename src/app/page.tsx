import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl sm:text-6xl font-bold text-secondary-900 mb-6">
            Create Beautiful{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              String Art
            </span>
          </h1>
          <p className="text-xl text-secondary-600 mb-8 max-w-2xl mx-auto">
            Transform your ideas into stunning geometric patterns with our easy-to-use string art generator. 
            Perfect for DIY enthusiasts and creative minds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6">
              Start Creating
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-secondary-900 mb-4">
            Why Choose Stringy-Thingy?
          </h2>
          <p className="text-lg text-secondary-600">
            Everything you need to create amazing string art designs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="text-primary-600">Easy to Use</CardTitle>
              <CardDescription>
                Simple interface that makes creating string art accessible to everyone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-secondary-600">
                Our intuitive generator guides you through the process step by step, 
                making complex designs simple to create.
              </p>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="text-primary-600">Endless Possibilities</CardTitle>
              <CardDescription>
                Create unique patterns and designs limited only by your imagination
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-secondary-600">
                From simple geometric shapes to complex mandalas, 
                explore a world of creative possibilities.
              </p>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="text-primary-600">Share & Inspire</CardTitle>
              <CardDescription>
                Share your creations with the community and get inspired by others
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-secondary-600">
                Join our community of string art enthusiasts and showcase your amazing creations.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-primary text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Creating?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of creators making beautiful string art designs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Get Started Free
            </Button>
            <Link href="/how-it-works">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-primary">
                How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
