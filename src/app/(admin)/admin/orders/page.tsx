import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminOrdersPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
          Order Management
        </h1>
        <p className="text-secondary-600">
          View and manage customer orders
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Customer order management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-secondary-600">
              Order management system coming soon!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
