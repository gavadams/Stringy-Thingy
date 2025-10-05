"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getProductById, updateProduct, deleteProduct } from "@/lib/products/queries";
import ImageUpload from "@/components/admin/ImageUpload";
import Link from "next/link";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productId, setProductId] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    kit_type: "",
    pegs: "",
    lines: "",
    frame_size: "",
    stock: "",
    is_active: true,
    images: [] as string[]
  });
  const router = useRouter();

  useEffect(() => {
    const loadProduct = async () => {
      const resolvedParams = await params;
      setProductId(resolvedParams.id);
      
      try {
        const { data: product, error } = await getProductById(resolvedParams.id);
        
        if (error || !product) {
          toast.error("Product not found");
          router.push("/admin/products");
          return;
        }

        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price?.toString() || "",
          kit_type: product.kit_type || "",
          pegs: product.pegs?.toString() || "",
          lines: product.lines?.toString() || "",
          frame_size: product.frame_size || "",
          stock: product.stock?.toString() || "",
          is_active: product.is_active ?? true,
          images: product.images || []
        });
      } catch (error) {
        console.error("Error loading product:", error);
        toast.error("Failed to load product");
      }
    };

    loadProduct();
  }, [params, router]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        kit_type: formData.kit_type as "starter" | "standard" | "premium",
        pegs: parseInt(formData.pegs),
        lines: parseInt(formData.lines),
        frame_size: formData.frame_size,
        stock: parseInt(formData.stock),
        is_active: formData.is_active,
        images: formData.images
      };

      const { data, error } = await updateProduct(productId, productData);

      if (error) {
        toast.error("Failed to update product: " + error);
        return;
      }

      toast.success("Product updated successfully!");
      router.push("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const { success, error } = await deleteProduct(productId);

      if (!success) {
        toast.error("Failed to delete product: " + error);
        return;
      }

      toast.success("Product deleted successfully!");
      router.push("/admin/products");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Link>
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Product
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Product</h1>
        <p className="text-gray-600">
          Update product information and specifications.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential product details and pricing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Standard String Art Kit"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your product..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (£)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="34.99"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => handleInputChange("stock", e.target.value)}
                    placeholder="100"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                />
                <Label htmlFor="is_active">Active (visible to customers)</Label>
              </div>
            </CardContent>
          </Card>

          {/* Kit Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Kit Specifications</CardTitle>
              <CardDescription>
                Technical details for the string art kit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kit_type">Kit Type</Label>
                <Select value={formData.kit_type} onValueChange={(value) => handleInputChange("kit_type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select kit type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pegs">Number of Pegs</Label>
                  <Input
                    id="pegs"
                    type="number"
                    min="1"
                    value={formData.pegs}
                    onChange={(e) => handleInputChange("pegs", e.target.value)}
                    placeholder="200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lines">Max Lines</Label>
                  <Input
                    id="lines"
                    type="number"
                    min="1"
                    value={formData.lines}
                    onChange={(e) => handleInputChange("lines", e.target.value)}
                    placeholder="3000"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frame_size">Frame Size</Label>
                <Input
                  id="frame_size"
                  value={formData.frame_size}
                  onChange={(e) => handleInputChange("frame_size", e.target.value)}
                  placeholder="12\" (30cm)"
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <CardDescription>
              Upload images to showcase your product.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              images={formData.images}
              onImagesChange={handleImagesChange}
              maxImages={5}
              bucket="product-images"
              folder="products"
            />
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Product
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Product
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
