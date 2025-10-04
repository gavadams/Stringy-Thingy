import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAnalyticsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-secondary-600">
          View platform analytics and insights
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Platform analytics and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-secondary-600">
              Analytics dashboard coming soon!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
