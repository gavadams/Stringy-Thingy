import { createClient } from '@/lib/supabase/client';

export async function getSignedUrl(
  bucket: string,
  filePath: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Error creating signed URL:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      url: data.signedUrl
    };
  } catch (error) {
    console.error('Error creating signed URL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create signed URL'
    };
  }
}

export async function getSignedUrls(
  bucket: string,
  filePaths: string[],
  expiresIn: number = 3600
): Promise<{ success: boolean; urls?: string[]; errors?: string[] }> {
  try {
    const results = await Promise.allSettled(
      filePaths.map(filePath => getSignedUrl(bucket, filePath, expiresIn))
    );

    const urls: string[] = [];
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        urls.push(result.value.url!);
      } else {
        const error = result.status === 'rejected' 
          ? result.reason 
          : result.value.error;
        errors.push(`File ${index + 1}: ${error}`);
      }
    });

    return {
      success: urls.length > 0,
      urls,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Failed to create signed URLs']
    };
  }
}
