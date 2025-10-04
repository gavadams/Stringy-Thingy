import { getCurrentUser } from "@/lib/auth/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Access Denied</h1>
          <p className="text-lg text-muted-foreground mb-4">
            You must be logged in to access the dashboard.
          </p>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Welcome back, {currentUser.user.email}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Generations</CardTitle>
            <CardDescription>
              View and manage your string art generations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/my-generations">View Generations</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create New</CardTitle>
            <CardDescription>
              Generate a new string art pattern
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/generate">Start Creating</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kit Status</CardTitle>
            <CardDescription>
              Check your kit code usage and limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {currentUser.profile?.role === 'admin' ? (
                <p>Admin account - Full access</p>
              ) : (
                <p>Customer account - Kit code required</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
