import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminProductsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
          Product Management
        </h1>
        <p className="text-secondary-600">
          Manage your string art kits and products
        </p>
      </div>

      <div className="mb-6">
        <Button>
          Add New Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>Manage your product catalog</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-secondary-600">
              Product management system coming soon!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
