import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminFrameGeneratorPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
          Frame Generator
        </h1>
        <p className="text-secondary-600">
          Advanced frame generation tools for administrators
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frame Generator</CardTitle>
          <CardDescription>Advanced frame generation tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-secondary-600">
              Frame generator tools coming soon!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
