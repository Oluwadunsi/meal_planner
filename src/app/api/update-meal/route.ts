import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { plan_id, day, meal_type, updated_meal } = await req.json()

  // Fetch current plan
  const { data: plan, error } = await supabase
    .from('weekly_plans')
    .select('meals')
    .eq('id', plan_id)
    .single()

  if (error || !plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  // Swap the edited meal in
  const updatedMeals = plan.meals.map((d: any) =>
    d.day === day ? { ...d, [meal_type]: updated_meal } : d
  )

  // Save back
  const { error: updateError } = await supabase
    .from('weekly_plans')
    .update({ meals: updatedMeals })
    .eq('id', plan_id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}