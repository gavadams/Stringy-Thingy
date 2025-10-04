'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signUp(email: string, password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function redeemKitCode(code: string, userId: string) {
  const supabase = await createClient()

  // Check if kit code exists and is active
  const { data: kitCode, error: kitError } = await supabase
    .from('kit_codes')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single()

  if (kitError || !kitCode) {
    return { error: 'Invalid or inactive kit code' }
  }

  // Check if code is already redeemed
  if (kitCode.redeemed_by) {
    return { error: 'Kit code has already been redeemed' }
  }

  // Update kit code with user ID
  const { error: updateError } = await supabase
    .from('kit_codes')
    .update({ redeemed_by: userId })
    .eq('id', kitCode.id)

  if (updateError) {
    return { error: 'Failed to redeem kit code' }
  }

  return { success: true, kitCode }
}

export async function getCurrentUser() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Get user profile with role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    ...user,
    profile,
  }
}

export async function isAdmin() {
  const user = await getCurrentUser()
  return user?.profile?.role === 'admin'
}

export async function getKitCodes(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('kit_codes')
    .select('*')
    .eq('redeemed_by', userId)

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function createGeneration(
  userId: string,
  kitCodeId: string,
  settings: Record<string, unknown>,
  imageUrl?: string
) {
  const supabase = await createClient()

  // Check if user can create generation (kit usage limit)
  const { data: kitCode } = await supabase
    .from('kit_codes')
    .select('*')
    .eq('id', kitCodeId)
    .eq('redeemed_by', userId)
    .single()

  if (!kitCode) {
    return { error: 'Kit code not found or not owned by user' }
  }

  if (kitCode.used_count >= kitCode.max_generations) {
    return { error: 'Kit usage limit reached' }
  }

  // Create generation
  const { data, error } = await supabase
    .from('generations')
    .insert({
      user_id: userId,
      kit_code_id: kitCodeId,
      settings,
      image_url: imageUrl,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Increment kit usage
  const { error: incrementError } = await supabase.rpc('increment_kit_usage', {
    code_id: kitCodeId,
  })

  if (incrementError) {
    console.error('Failed to increment kit usage:', incrementError)
  }

  return { data }
}
