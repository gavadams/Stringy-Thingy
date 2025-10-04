'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

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
  redirect('/login?message=Check your email to verify your account')
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
  redirect('/login?message=You have been signed out successfully')
}

export async function getCurrentUser() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    user,
    profile: profile as Profile | null
  }
}

export async function isAdmin() {
  const currentUser = await getCurrentUser()
  return currentUser?.profile?.role === 'admin'
}

export async function redeemKitCode(code: string) {
  const supabase = await createClient()

  // First, get the current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { error: 'You must be logged in to redeem a kit code' }
  }

  // Check if the kit code exists and is valid
  const { data: kitCode, error: codeError } = await supabase
    .from('kit_codes')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single()

  if (codeError || !kitCode) {
    return { error: 'Invalid or inactive kit code' }
  }

  // Check if code is already redeemed
  if (kitCode.redeemed_by) {
    return { error: 'This kit code has already been redeemed' }
  }

  // Check if user has already redeemed a code
  const { data: existingCode } = await supabase
    .from('kit_codes')
    .select('id')
    .eq('redeemed_by', user.id)
    .single()

  if (existingCode) {
    return { error: 'You have already redeemed a kit code' }
  }

  // Redeem the code
  const { error: redeemError } = await supabase
    .from('kit_codes')
    .update({ redeemed_by: user.id })
    .eq('id', kitCode.id)

  if (redeemError) {
    return { error: 'Failed to redeem kit code' }
  }

  revalidatePath('/dashboard')
  return { success: true, kitCode }
}

export async function getUserGenerations() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { error: 'You must be logged in to view generations' }
  }

  const { data: generations, error } = await supabase
    .from('generations')
    .select(`
      *,
      kit_codes (
        code,
        kit_type,
        max_generations
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data: generations }
}

export async function createGeneration(settings: Record<string, unknown>) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { error: 'You must be logged in to create generations' }
  }

  // Get user's kit code
  const { data: kitCode, error: codeError } = await supabase
    .from('kit_codes')
    .select('*')
    .eq('redeemed_by', user.id)
    .single()

  if (codeError || !kitCode) {
    return { error: 'No valid kit code found. Please redeem a kit code first.' }
  }

  // Check if user has reached generation limit
  if (kitCode.used_count >= kitCode.max_generations) {
    return { error: 'You have reached your generation limit for this kit' }
  }

  // Create the generation
  const { data: generation, error: genError } = await supabase
    .from('generations')
    .insert({
      user_id: user.id,
      kit_code_id: kitCode.id,
      settings,
    })
    .select()
    .single()

  if (genError) {
    return { error: genError.message }
  }

  // Increment kit usage
  const { error: incrementError } = await supabase.rpc('increment_kit_usage', {
    code_id: kitCode.id
  })

  if (incrementError) {
    console.error('Failed to increment kit usage:', incrementError)
  }

  revalidatePath('/my-generations')
  return { data: generation }
}
