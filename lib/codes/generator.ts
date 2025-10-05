import { createClient } from '@/lib/supabase/server';

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_LENGTH = 4; // ART-XXXX format

/**
 * Generate a random alphanumeric code
 */
function generateRandomCode(): string {
  let result = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    result += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
  }
  return result;
}

/**
 * Check if a code already exists in the database
 */
async function codeExists(code: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('kit_codes')
    .select('code')
    .eq('code', code)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error checking code existence:', error);
    return true; // Assume exists to be safe
  }

  return !!data;
}

/**
 * Generate a unique kit code
 */
async function generateUniqueCode(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const code = `ART-${generateRandomCode()}`;
    const exists = await codeExists(code);
    
    if (!exists) {
      return code;
    }
    
    attempts++;
  }

  throw new Error('Failed to generate unique code after maximum attempts');
}

/**
 * Get max generations based on kit type
 */
function getMaxGenerations(kitType: string): number {
  switch (kitType.toLowerCase()) {
    case 'starter':
      return 2;
    case 'standard':
      return 3;
    case 'premium':
      return 5;
    default:
      return 2;
  }
}

/**
 * Generate multiple unique kit codes
 */
export async function generateKitCodes(
  count: number,
  kitType: string
): Promise<{ success: boolean; codes?: string[]; error?: string }> {
  try {
    if (count <= 0 || count > 50) {
      return {
        success: false,
        error: 'Invalid count. Must be between 1 and 50.'
      };
    }

    const codes: string[] = [];
    const maxGenerations = getMaxGenerations(kitType);

    // Generate all codes
    for (let i = 0; i < count; i++) {
      const code = await generateUniqueCode();
      codes.push(code);
    }

    // Insert all codes into database
    const supabase = createClient();
    const kitCodeRecords = codes.map(code => ({
      code,
      kit_type: kitType,
      max_generations: maxGenerations,
      purchase_date: new Date().toISOString(),
      is_redeemed: false,
      redeemed_by: null,
      redeemed_at: null
    }));

    const { error: insertError } = await supabase
      .from('kit_codes')
      .insert(kitCodeRecords);

    if (insertError) {
      console.error('Error inserting kit codes:', insertError);
      return {
        success: false,
        error: 'Failed to save kit codes to database'
      };
    }

    return {
      success: true,
      codes
    };
  } catch (error) {
    console.error('Error generating kit codes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate kit codes'
    };
  }
}

/**
 * Generate a single kit code (convenience function)
 */
export async function generateKitCode(kitType: string): Promise<{ success: boolean; code?: string; error?: string }> {
  const result = await generateKitCodes(1, kitType);
  
  if (result.success && result.codes && result.codes.length > 0) {
    return {
      success: true,
      code: result.codes[0]
    };
  }
  
  return {
    success: false,
    error: result.error || 'Failed to generate kit code'
  };
}
