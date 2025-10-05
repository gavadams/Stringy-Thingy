import { createClient } from '@/lib/supabase/client';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export async function uploadImage(
  file: File,
  bucket: string = 'product-images',
  folder?: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    const supabase = createClient();
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

export async function uploadMultipleImages(
  files: File[],
  bucket: string = 'product-images',
  folder?: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ success: boolean; urls: string[]; errors: string[] }> {
  const results = await Promise.allSettled(
    files.map(file => uploadImage(file, bucket, folder, onProgress))
  );

  const urls: string[] = [];
  const errors: string[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      urls.push(result.value.url!);
    } else {
      const error = result.status === 'rejected' 
        ? result.reason 
        : result.value.error || 'Upload failed';
      errors.push(`File ${index + 1}: ${error}`);
    }
  });

  return {
    success: urls.length > 0,
    urls,
    errors
  };
}

export async function deleteImage(
  url: string,
  bucket: string = 'product-images'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    
    // Extract file path from URL
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const folder = urlParts[urlParts.length - 2];
    const filePath = folder && folder !== bucket ? `${folder}/${fileName}` : fileName;

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    };
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP images.'
    };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Please upload images smaller than 10MB.'
    };
  }

  return { valid: true };
}
