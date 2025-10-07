import { createClient } from '@/lib/supabase/server';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface KitCodeValidationResult extends ValidationResult {
  kitType?: string;
  remaining?: number;
  maxGenerations?: number;
}

export interface ImageValidationResult extends ValidationResult {
  dimensions?: { width: number; height: number };
}

/**
 * Validate a kit code for a user
 */
export async function validateKitCode(code: string, userId: string): Promise<KitCodeValidationResult> {
  try {
    const supabase = createClient();
    
    // Check if code exists and is active
    const { data: kitCode, error: kitError } = await supabase
      .from('kit_codes')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (kitError || !kitCode) {
      return {
        valid: false,
        error: 'Invalid or inactive kit code'
      };
    }

    // Check if code belongs to user
    if (kitCode.redeemed_by !== userId) {
      return {
        valid: false,
        error: 'This kit code does not belong to you'
      };
    }

    // Check remaining generations
    const remaining = kitCode.max_generations - kitCode.used_count;
    if (remaining <= 0) {
      return {
        valid: false,
        error: 'No generations remaining for this kit code'
      };
    }

    return {
      valid: true,
      kitType: kitCode.kit_type,
      remaining,
      maxGenerations: kitCode.max_generations
    };
  } catch (error) {
    console.error('Error validating kit code:', error);
    return {
      valid: false,
      error: 'Failed to validate kit code'
    };
  }
}

/**
 * Validate an uploaded image file
 */
export function validateImage(file: File): ImageValidationResult {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPG, PNG, or WebP image.'
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Please upload an image smaller than 10MB.'
    };
  }

  return {
    valid: true
  };
}

/**
 * Validate image dimensions (async - requires loading image)
 */
export function validateImageDimensions(file: File): Promise<ImageValidationResult> {
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      const minDimension = 400;
      
      if (img.width < minDimension || img.height < minDimension) {
        resolve({
          valid: false,
          error: `Image too small. Please upload an image at least ${minDimension}x${minDimension} pixels.`
        });
        return;
      }

      resolve({
        valid: true,
        dimensions: { width: img.width, height: img.height }
      });
    };

    img.onerror = () => {
      resolve({
        valid: false,
        error: 'Failed to load image for validation'
      });
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Comprehensive image validation
 */
export async function validateImageFile(file: File): Promise<ImageValidationResult> {
  // First validate basic properties
  const basicValidation = validateImage(file);
  if (!basicValidation.valid) {
    return basicValidation;
  }

  // Then validate dimensions
  return await validateImageDimensions(file);
}

/**
 * Get kit type specifications
 */
export function getKitTypeSpecs(kitType: string) {
  const specs = {
    starter: {
      pegs: 150,
      maxLines: 2000,
      frameShapes: ['circle', 'square']
    },
    standard: {
      pegs: 200,
      maxLines: 3000,
      frameShapes: ['circle', 'square']
    },
    premium: {
      pegs: 250,
      maxLines: 4000,
      frameShapes: ['circle', 'square']
    }
  };

  return specs[kitType as keyof typeof specs] || specs.starter;
}
