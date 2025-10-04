import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/actions";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Server-side authentication check
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r min-h-screen">
          <div className="p-6">
            <Link href="/" className="flex items-center space-x-2 mb-8">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">ST</span>
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Stringy-Thingy
              </span>
            </Link>
            
            <nav className="space-y-2">
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-start">
                  Dashboard
                </Button>
              </Link>
              <Link href="/generate">
                <Button variant="ghost" className="w-full justify-start">
                  Generate
                </Button>
              </Link>
              <Link href="/my-generations">
                <Button variant="ghost" className="w-full justify-start">
                  My Generations
                </Button>
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">
              Welcome to Your Dashboard
            </h1>
            <p className="text-secondary-600">
              Manage your string art creations and explore new designs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle className="text-primary-600">Total Creations</CardTitle>
                <CardDescription>Your string art projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary-900">0</div>
                <p className="text-sm text-secondary-600">Start creating to see your count grow!</p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="text-primary-600">Recent Activity</CardTitle>
                <CardDescription>Your latest projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary-900">0</div>
                <p className="text-sm text-secondary-600">No recent activity</p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="text-primary-600">Favorites</CardTitle>
                <CardDescription>Saved designs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary-900">0</div>
                <p className="text-sm text-secondary-600">No favorites yet</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with these options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/generate">
                  <Button className="w-full">
                    Create New Design
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button variant="outline" className="w-full">
                    Learn How It Works
                  </Button>
                </Link>
                <Link href="/shop">
                  <Button variant="outline" className="w-full">
                    Browse Materials
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>New to string art? Start here</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary-600 text-sm font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900">Learn the basics</p>
                      <p className="text-sm text-secondary-600">Understand string art fundamentals</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary-600 text-sm font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900">Create your first design</p>
                      <p className="text-sm text-secondary-600">Use our generator to make something amazing</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary-600 text-sm font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900">Share your creation</p>
                      <p className="text-sm text-secondary-600">Show off your work to the community</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
