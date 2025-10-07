import { createClient } from '@/lib/supabase/client';

export interface GenerationData {
  user_id: string;
  kit_code_id: string;
  image_url: string;
  settings: Record<string, unknown>;
  pattern_data?: Record<string, unknown>;
}

export interface Generation {
  id: string;
  user_id: string;
  kit_code_id: string;
  image_url: string;
  settings: Record<string, unknown>;
  pattern_data?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface GenerationStats {
  totalGenerations: number;
  activeCodes: number;
  totalRemaining: number;
  latestGeneration?: Generation;
}

/**
 * Get a generation by ID
 */
export async function getGenerationById(id: string): Promise<Generation | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('user_generations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching generation:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching generation:', error);
    return null;
  }
}

/**
 * Get all generations for a user
 */
export async function getUserGenerations(userId: string, limit: number = 50, offset: number = 0): Promise<Generation[]> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching user generations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user generations:', error);
    return [];
  }
}

/**
 * Create a new generation
 */
export async function createGeneration(data: GenerationData): Promise<Generation | null> {
  try {
    const supabase = createClient();
    
    const { data: generation, error } = await supabase
      .from('user_generations')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Error creating generation:', error);
      return null;
    }

    return generation;
  } catch (error) {
    console.error('Error creating generation:', error);
    return null;
  }
}

/**
 * Delete a generation
 */
export async function deleteGeneration(id: string, userId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('user_generations')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting generation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting generation:', error);
    return false;
  }
}

/**
 * Get generation statistics for a user
 */
export async function getGenerationStats(userId: string): Promise<GenerationStats> {
  try {
    const supabase = createClient();
    
    // Get total generations
    const { count: totalGenerations } = await supabase
      .from('generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get active kit codes
    const { data: kitCodes } = await supabase
      .from('kit_codes')
      .select('max_generations, used_count')
      .eq('redeemed_by', userId)
      .eq('is_active', true);

    const activeCodes = kitCodes?.length || 0;
    const totalRemaining = kitCodes?.reduce((sum, code) => 
      sum + (code.max_generations - code.used_count), 0) || 0;

    // Get latest generation
    const { data: latestGeneration } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return {
      totalGenerations: totalGenerations || 0,
      activeCodes,
      totalRemaining,
      latestGeneration: latestGeneration || undefined
    };
  } catch (error) {
    console.error('Error fetching generation stats:', error);
    return {
      totalGenerations: 0,
      activeCodes: 0,
      totalRemaining: 0
    };
  }
}

/**
 * Check if user can generate with a specific kit code
 */
export async function canUserGenerate(userId: string, codeId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { data: kitCode, error } = await supabase
      .from('kit_codes')
      .select('max_generations, used_count, redeemed_by, is_active')
      .eq('id', codeId)
      .single();

    if (error || !kitCode) {
      return false;
    }

    return (
      kitCode.redeemed_by === userId &&
      kitCode.is_active &&
      kitCode.used_count < kitCode.max_generations
    );
  } catch (error) {
    console.error('Error checking generation permission:', error);
    return false;
  }
}

/**
 * Increment kit code usage
 */
export async function incrementKitUsage(codeId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase.rpc('increment_kit_usage', {
      code_id: codeId
    });

    if (error) {
      console.error('Error incrementing kit usage:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error incrementing kit usage:', error);
    return false;
  }
}

/**
 * Get user's active kit codes
 */
export async function getUserKitCodes(userId: string): Promise<{
  id: string;
  code: string;
  kit_type: string;
  max_generations: number;
  used_count: number;
  created_at: string;
}[]> {
  try {
    // Use the same client instance that has the auth context
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('kit_codes')
      .select('*')
      .eq('redeemed_by', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user kit codes:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user kit codes:', error);
    return [];
  }
}
