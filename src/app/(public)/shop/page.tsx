import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            String Art Kits & Supplies
          </h1>
          <p className="text-lg text-secondary-600">
            Everything you need to create beautiful string art designs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle>Beginner Kit</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-secondary-600 mb-4">
                Complete starter kit with all the essentials for your first string art project.
              </p>
              <Button className="w-full">Coming Soon</Button>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle>Premium Kit</CardTitle>
              <CardDescription>For serious creators</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-secondary-600 mb-4">
                Advanced kit with premium materials and tools for complex designs.
              </p>
              <Button className="w-full">Coming Soon</Button>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle>Custom Design</CardTitle>
              <CardDescription>Personalized string art</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-secondary-600 mb-4">
                Have us create a custom string art design just for you.
              </p>
              <Button className="w-full">Coming Soon</Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-secondary-600">
            Shop is coming soon! Sign up to be notified when we launch.
          </p>
        </div>
      </div>
    </div>
  );
}
