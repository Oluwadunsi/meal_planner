import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const body = await req.json()

  const { plan_id, weekly_rating, meal_ratings, feedback_text } = body

  const { error } = await supabase.from('feedback').insert({
    plan_id,
    weekly_rating,
    meal_ratings,
    feedback_text,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}