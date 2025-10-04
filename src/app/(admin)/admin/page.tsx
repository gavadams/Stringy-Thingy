import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-secondary-600">
          Manage your Stringy-Thingy platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-primary-600">Total Users</CardTitle>
            <CardDescription>Registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary-900">0</div>
            <p className="text-sm text-secondary-600">+0 this month</p>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="text-primary-600">Total Orders</CardTitle>
            <CardDescription>Completed orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary-900">0</div>
            <p className="text-sm text-secondary-600">+0 this month</p>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="text-primary-600">Revenue</CardTitle>
            <CardDescription>Total revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary-900">$0</div>
            <p className="text-sm text-secondary-600">+$0 this month</p>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle className="text-primary-600">Active Designs</CardTitle>
            <CardDescription>Generated designs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary-900">0</div>
            <p className="text-sm text-secondary-600">+0 this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-secondary-600">
                No recent activity to display
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <span className="text-secondary-700">Manage Products</span>
                <span className="text-sm text-secondary-500">Coming Soon</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <span className="text-secondary-700">View Orders</span>
                <span className="text-sm text-secondary-500">Coming Soon</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <span className="text-secondary-700">Analytics</span>
                <span className="text-sm text-secondary-500">Coming Soon</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
