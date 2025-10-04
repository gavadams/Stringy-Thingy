import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MyGenerationsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
          My Generations
        </h1>
        <p className="text-secondary-600">
          View and manage your string art creations
        </p>
      </div>

      <div className="mb-6">
        <Button>
          Create New Design
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle>No Designs Yet</CardTitle>
            <CardDescription>Start creating to see your designs here</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-secondary-500 text-2xl">🎨</span>
              </div>
              <p className="text-secondary-600 mb-4">
                You haven't created any string art designs yet.
              </p>
              <Button>
                Create Your First Design
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Design History</CardTitle>
            <CardDescription>Track your creative journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-secondary-600">
                Your design history will appear here as you create more designs.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
