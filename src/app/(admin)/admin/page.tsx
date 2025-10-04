import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Users, FileText, BarChart, Settings } from "lucide-react";
import Link from "next/link";

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
            <p className="text-sm text-secondary-600">No users yet</p>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="text-primary-600">Products</CardTitle>
            <CardDescription>Available kits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary-900">0</div>
            <p className="text-sm text-secondary-600">No products yet</p>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="text-primary-600">Orders</CardTitle>
            <CardDescription>Total orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary-900">0</div>
            <p className="text-sm text-secondary-600">No orders yet</p>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle className="text-primary-600">Revenue</CardTitle>
            <CardDescription>Total earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary-900">$0</div>
            <p className="text-sm text-secondary-600">No revenue yet</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/admin/products">
              <Button className="w-full">
                <Package className="mr-2 h-4 w-4" />
                Manage Products
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="outline" className="w-full">
                <Users className="mr-2 h-4 w-4" />
                View Orders
              </Button>
            </Link>
            <Link href="/admin/codes">
              <Button variant="outline" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Manage Kit Codes
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Platform insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">User Growth</span>
                <span className="font-bold text-secondary-900">0%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Conversion Rate</span>
                <span className="font-bold text-secondary-900">0%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Active Users</span>
                <span className="font-bold text-secondary-900">0</span>
              </div>
              <Link href="/admin/analytics">
                <Button variant="outline" className="w-full mt-4">
                  <BarChart className="mr-2 h-4 w-4" />
                  View Detailed Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
