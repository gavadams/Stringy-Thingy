import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminContentPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
          Content Management
        </h1>
        <p className="text-secondary-600">
          Manage website content and templates
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Management</CardTitle>
          <CardDescription>Manage website content and templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-secondary-600">
              Content management system coming soon!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
