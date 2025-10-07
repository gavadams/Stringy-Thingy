import { getCurrentUser } from "@/lib/auth/actions";
import { getGenerationStats, getUserKitCodes } from "@/lib/generator/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, 
  ShoppingCart, 
  Image as ImageIcon, 
  Plus, 
  Eye, 
  Clock
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

interface KitCode {
  id: string;
  code: string;
  kit_type: string;
  max_generations: number;
  used_count: number;
  created_at: string;
}

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login?message=You must be logged in to access the dashboard');
  }

  // Load dashboard data
  const [stats, kitCodes] = await Promise.all([
    getGenerationStats(currentUser.user.id),
    getUserKitCodes(currentUser.user.id)
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {currentUser.user.email}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Ready to create some beautiful string art?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCodes}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalRemaining} generations remaining
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Generations</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGenerations}</div>
              <p className="text-xs text-muted-foreground">
                Patterns created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest Creation</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {stats.latestGeneration ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 relative rounded overflow-hidden">
                    <Image
                      src={stats.latestGeneration.image_url}
                      alt="Latest generation"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(stats.latestGeneration.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(stats.latestGeneration.settings as { frameShape?: string })?.frameShape || 'circle'} frame
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No generations yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/generate">
                <Button className="w-full h-20 flex flex-col gap-2">
                  <Plus className="w-6 h-6" />
                  Create New Art
                </Button>
              </Link>
              <Link href="/my-generations">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <Eye className="w-6 h-6" />
                  View Gallery
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <ShoppingCart className="w-6 h-6" />
                  Buy More Kits
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Kit Codes */}
        {kitCodes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Kit Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kitCodes.map((kitCode) => {
                  const remaining = kitCode.max_generations - kitCode.used_count;
                  const progress = (kitCode.used_count / kitCode.max_generations) * 100;
                  
                  return (
                    <div key={kitCode.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-semibold">{kitCode.code}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary">{kitCode.kit_type}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {remaining} remaining
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="w-32">
                          <Progress value={progress} className="h-2" />
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {kitCode.used_count}/{kitCode.max_generations}
                          </p>
                          <p className="text-xs text-muted-foreground">generations</p>
                        </div>
                        {remaining > 0 && (
                          <Link href="/generate">
                            <Button size="sm">Use This Code</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {kitCodes.length === 0 && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Kit Codes Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Purchase a string art kit to start creating beautiful patterns.
                </p>
                <Link href="/shop">
                  <Button size="lg" className="gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Browse Kits
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
