import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Stringy-Thingy
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Create beautiful string art with our comprehensive kits and tools. 
            Perfect for beginners and experienced crafters alike.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/shop">Shop Now</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/how-it-works">Learn How</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose Stringy-Thingy?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <CardTitle>Complete Kits</CardTitle>
                <CardDescription>
                  Everything you need to get started with string art
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our kits include all materials, tools, and step-by-step instructions 
                  to create stunning string art pieces.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle>Easy to Learn</CardTitle>
                <CardDescription>
                  Perfect for beginners and experienced crafters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Clear instructions and video tutorials make it easy for anyone 
                  to create beautiful string art.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle>Custom Designs</CardTitle>
                <CardDescription>
                  Generate your own unique string art patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Use our pattern generator to create custom designs 
                  or choose from our extensive library of templates.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Creating?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of crafters who have discovered the joy of string art 
            with Stringy-Thingy.
          </p>
          <Button size="lg" asChild>
            <Link href="/shop">Get Started Today</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
