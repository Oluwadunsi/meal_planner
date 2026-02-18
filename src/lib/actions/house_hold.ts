'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createHousehold(data: {
  city: string
  budget_level: string
  cooking_time: string
  meals_per_day: number
  household_size: number
  plan_days?: number
  monthly_budget_sek?: number | null
}) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: household, error } = await supabase
    .from('household')
    .insert({
      ...data,
      plan_days: data.plan_days ?? 7,
      admin_user_id: user.id,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return household
}

export async function updateHousehold(id: string, data: {
  city: string
  budget_level: string
  cooking_time: string
  meals_per_day: number
  household_size: number
  plan_days: number
  monthly_budget_sek?: number | null
}) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('household')
    .update(data)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/settings')
}

export async function addMember(data: {
  household_id: string
  name: string
  spice_tolerance: string
  dietary_constraints: string[]
  disliked_ingredients: string[]
  cuisine_preferences: string[]
}) {
  const supabase = await createClient()
  const { data: member, error } = await supabase
    .from('members')
    .insert(data)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return member
}

export async function updateMember(id: string, data: {
  name: string
  spice_tolerance: string
  dietary_constraints: string[]
  disliked_ingredients: string[]
  cuisine_preferences: string[]
}) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('members')
    .update(data)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/settings')
}

export async function deleteMember(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/settings')
}