import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GeneratePage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
          String Art Generator
        </h1>
        <p className="text-secondary-600">
          Create beautiful string art designs with our easy-to-use generator
        </p>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="custom">Custom Design</TabsTrigger>
          <TabsTrigger value="upload">Upload Image</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Choose a Template</CardTitle>
              <CardDescription>
                Start with one of our pre-designed templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border-2 border-dashed border-secondary-300 rounded-lg p-8 text-center">
                  <p className="text-secondary-600">Template Gallery</p>
                  <p className="text-sm text-secondary-500 mt-2">Coming Soon</p>
                </div>
                <div className="border-2 border-dashed border-secondary-300 rounded-lg p-8 text-center">
                  <p className="text-secondary-600">Geometric Patterns</p>
                  <p className="text-sm text-secondary-500 mt-2">Coming Soon</p>
                </div>
                <div className="border-2 border-dashed border-secondary-300 rounded-lg p-8 text-center">
                  <p className="text-secondary-600">Nature Themes</p>
                  <p className="text-sm text-secondary-500 mt-2">Coming Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Custom Design</CardTitle>
              <CardDescription>
                Design your own string art pattern from scratch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Design Parameters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Board Size
                      </label>
                      <select className="w-full p-2 border border-secondary-300 rounded-md">
                        <option>Small (8x8 inches)</option>
                        <option>Medium (12x12 inches)</option>
                        <option>Large (16x16 inches)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Complexity
                      </label>
                      <select className="w-full p-2 border border-secondary-300 rounded-md">
                        <option>Simple</option>
                        <option>Medium</option>
                        <option>Complex</option>
                      </select>
                    </div>
                  </div>
                </div>
                <Button className="w-full">
                  Generate Design
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Image</CardTitle>
              <CardDescription>
                Convert your own image into a string art design
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-secondary-300 rounded-lg p-8 text-center">
                <p className="text-secondary-600 mb-4">Drag and drop your image here</p>
                <Button variant="outline">
                  Choose File
                </Button>
                <p className="text-sm text-secondary-500 mt-4">
                  Supported formats: JPG, PNG, SVG
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
