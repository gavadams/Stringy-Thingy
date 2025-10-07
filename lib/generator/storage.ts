import { createClient } from '@supabase/supabase-js';

/**
 * Upload an image file to Supabase Storage
 */
export async function uploadImage(file: File, userId: string): Promise<string> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `${userId}/${filename}`;

    // Upload file to Supabase Storage
    const { error } = await supabase.storage
      .from('user-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('user-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Extract file path from URL
    const urlParts = url.split('/');
    const filePath = urlParts.slice(-2).join('/'); // Get userId/filename part
    
    const { error } = await supabase.storage
      .from('user-images')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
      // Don't throw error for delete failures - image might already be deleted
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw error for delete failures
  }
}

/**
 * Get a signed URL for private image access
 */
export async function getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data, error } = await supabase.storage
      .from('user-images')
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error creating signed URL:', error);
    throw new Error('Failed to create signed URL');
  }
}

/**
 * Compress image before upload
 */
export function compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Upload image with compression
 */
export async function uploadImageWithCompression(file: File, userId: string): Promise<string> {
  try {
    // Compress image first
    const compressedFile = await compressImage(file);
    
    // Upload compressed file
    return await uploadImage(compressedFile, userId);
  } catch (error) {
    console.error('Error uploading compressed image:', error);
    throw error;
  }
}
