import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminCodesPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
          Code Management
        </h1>
        <p className="text-secondary-600">
          Manage discount codes and promotional offers
        </p>
      </div>

      <div className="mb-6">
        <Button>
          Create New Code
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Discount Codes</CardTitle>
          <CardDescription>Manage your promotional codes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-secondary-600">
              Code management system coming soon!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
