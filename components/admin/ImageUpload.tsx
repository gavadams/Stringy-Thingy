"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { uploadImage, validateImageFile, deleteImage } from "@/lib/storage/upload";
import { toast } from "sonner";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  bucket?: string;
  folder?: string;
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  bucket = "product-images",
  folder = "products"
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;
    const filesToUpload = fileArray.slice(0, remainingSlots);

    if (filesToUpload.length < fileArray.length) {
      toast.warning(`Only ${remainingSlots} images can be uploaded (${maxImages} max)`);
    }

    // Validate files
    for (const file of filesToUpload) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const newImages: string[] = [];
      
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        
        // Simulate progress for better UX
        const progress = ((i + 1) / filesToUpload.length) * 100;
        setUploadProgress(progress);

        const result = await uploadImage(file, bucket, folder);
        
        if (result.success && result.url) {
          newImages.push(result.url);
        } else {
          toast.error(`Failed to upload ${file.name}: ${result.error}`);
        }
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
        toast.success(`${newImages.length} image(s) uploaded successfully`);
      }

      setUploadProgress(0);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const removeImage = async (index: number) => {
    const imageUrl = images[index];
    
    try {
      // Try to delete from storage
      const deleteResult = await deleteImage(imageUrl, bucket);
      if (!deleteResult.success) {
        console.warn('Failed to delete from storage:', deleteResult.error);
      }
    } catch (error) {
      console.warn('Error deleting from storage:', error);
    }

    // Remove from local state regardless of storage deletion result
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    toast.success('Image removed');
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-purple-500 bg-purple-50"
                : "border-gray-300 hover:border-gray-400"
            } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isUploading ? "Uploading..." : "Upload Images"}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Drag and drop images here, or click to select files
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  PNG, JPG, GIF, WebP up to 10MB each
                </p>
              </div>

              {isUploading && (
                <div className="w-full max-w-xs">
                  <Progress value={uploadProgress} className="mb-2" />
                  <p className="text-sm text-gray-600">
                    {Math.round(uploadProgress)}% complete
                  </p>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={openFileDialog}
                disabled={isUploading || images.length >= maxImages}
                className="mt-4"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? "Uploading..." : "Choose Files"}
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Uploaded Images ({images.length}/{maxImages})
            </h4>
            {images.length >= maxImages && (
              <div className="flex items-center text-sm text-amber-600">
                <AlertCircle className="w-4 h-4 mr-1" />
                Maximum images reached
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="w-3 h-3" />
                </Button>

                <div className="absolute bottom-2 left-2 right-2">
                  <div className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !isUploading && (
        <div className="text-center py-8">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No images uploaded yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Upload images to showcase your product
          </p>
        </div>
      )}
    </div>
  );
}
