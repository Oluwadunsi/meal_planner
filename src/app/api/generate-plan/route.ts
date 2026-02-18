import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'
import { buildMealPlanPrompt } from '@/lib/prompt-builder'
import { computeAdaptationRules } from '@/lib/adaptation'

export async function POST(req: Request) {
  const supabase = await createClient()
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

  // 1. Fetch household
  const { data: household, error: householdError } = await supabase
    .from('household')
    .select('*')
    .single()

  if (householdError || !household) {
    return NextResponse.json({ error: 'No household found' }, { status: 400 })
  }

  // 2. Fetch members
  const { data: members } = await supabase
    .from('members')
    .select('*')
    .eq('household_id', household.id)

  // 3. Fetch recent feedback
  const { data: recentPlans } = await supabase
    .from('weekly_plans')
    .select('week_start, feedback(*)')
    .eq('household_id', household.id)
    .order('week_start', { ascending: false })
    .limit(3)

  const recentFeedback = recentPlans
    ?.filter(p => p.feedback?.length > 0)
    .map(p => ({ week_start: p.week_start, ...p.feedback[0] })) ?? []

  // 4. Compute adaptation rules
  const adaptationRules = computeAdaptationRules(recentFeedback)

  // 5. Build prompt
  const prompt = buildMealPlanPrompt({
    household,
    members: members ?? [],
    recentFeedback,
    adaptationRules,
  })

  // 6. Get Monday of current week
  const now = new Date()
  const day = now.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setUTCDate(now.getUTCDate() + diff)
  const weekStart = monday.toISOString().split('T')[0]

  // 7. Check if plan already exists
  const { data: existingPlan } = await supabase
    .from('weekly_plans')
    .select('id')
    .eq('household_id', household.id)
    .eq('week_start', weekStart)
    .single()

  if (existingPlan) {
    await supabase
      .from('weekly_plans')
      .delete()
      .eq('id', existingPlan.id)
  }

  // 8. Call Groq
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  })

  const raw = completion.choices[0]?.message?.content ?? ''

  // 9. Parse JSON
  let plan
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim()
    plan = JSON.parse(cleaned)
  } catch {
    return NextResponse.json({ error: 'Groq returned invalid JSON', raw }, { status: 500 })
  }

  // 10. Validate structure
  const expectedDays = household.plan_days ?? 7
  if (!plan.meals || plan.meals.length !== expectedDays) {
    return NextResponse.json({ 
      error: `Invalid plan structure. Expected ${expectedDays} days, got ${plan.meals?.length ?? 0}`,
      plan 
    }, { status: 500 })
  }

  // 11. Save to Supabase
  const { data: saved, error: saveError } = await supabase
    .from('weekly_plans')
    .insert({
      household_id: household.id,
      week_start: weekStart,
      meals: plan.meals,
      grocery_list: plan.grocery_list,
      metadata: plan.metadata,
    })
    .select()
    .single()

  if (saveError) return NextResponse.json({ error: saveError.message }, { status: 500 })

  return NextResponse.json({ plan: saved })
}