import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'
import { buildMealPlanPrompt } from '@/lib/prompt-builder'
import { computeAdaptationRules } from '@/lib/adaptation'

export async function POST(req: Request) {
  try {
    console.log('Step 0: Starting generation')
    const supabase = await createClient()
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    // 1. Fetch household
    console.log('Step 1: Fetching household')
    const { data: household, error: householdError } = await supabase
      .from('household')
      .select('*')
      .single()

    console.log('Household:', household)
    if (householdError || !household) {
      console.error('Household error:', householdError)
      return NextResponse.json({ error: 'No household found' }, { status: 400 })
    }

    // 2. Fetch members
    console.log('Step 2: Fetching members')
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('*')
      .eq('household_id', household.id)

    console.log('Members:', members, 'Error:', membersError)

    // 3. Fetch recent feedback
    console.log('Step 3: Fetching feedback')
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
    console.log('Step 4: Computing adaptation rules')
    const adaptationRules = computeAdaptationRules(recentFeedback)

    // 5. Build prompt
    console.log('Step 5: Building prompt')
    const prompt = buildMealPlanPrompt({
      household,
      members: members ?? [],
      recentFeedback,
      adaptationRules,
    })
    console.log('Prompt length:', prompt.length)

    // 6. Get Monday of current week
    console.log('Step 6: Computing week start')
    const now = new Date()
    const day = now.getUTCDay()
    const diff = day === 0 ? -6 : 1 - day
    const monday = new Date(now)
    monday.setUTCDate(now.getUTCDate() + diff)
    const weekStart = monday.toISOString().split('T')[0]
    console.log('Week start:', weekStart)

    // 7. Check if plan already exists
    console.log('Step 7: Checking existing plan')
    const { data: existingPlan } = await supabase
      .from('weekly_plans')
      .select('id')
      .eq('household_id', household.id)
      .eq('week_start', weekStart)
      .single()

    if (existingPlan) {
      console.log('Deleting existing plan:', existingPlan.id)
      await supabase
        .from('weekly_plans')
        .delete()
        .eq('id', existingPlan.id)
    }

    // 8. Call Groq
    console.log('Step 8: Calling Groq API')
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })

    const raw = completion.choices[0]?.message?.content ?? ''
    console.log('Groq response length:', raw.length)

    // 9. Parse JSON
    console.log('Step 9: Parsing JSON')
    let plan
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim()
      plan = JSON.parse(cleaned)
      console.log('Parsed plan:', { meals: plan.meals?.length, groceries: plan.grocery_list?.length })
    } catch (err) {
      console.error('JSON parse error:', err)
      return NextResponse.json({ error: 'Groq returned invalid JSON', raw }, { status: 500 })
    }

    // 10. Validate structure
    console.log('Step 10: Validating structure')
    const expectedDays = household.plan_days ?? 7
    if (!plan.meals || plan.meals.length !== expectedDays) {
      console.error('Invalid structure:', { expected: expectedDays, got: plan.meals?.length })
      return NextResponse.json({ 
        error: `Invalid plan structure. Expected ${expectedDays} days, got ${plan.meals?.length ?? 0}`,
        plan 
      }, { status: 500 })
    }

    // 11. Save to Supabase
    console.log('Step 11: Saving to database')
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

    if (saveError) {
      console.error('Save error:', saveError)
      return NextResponse.json({ error: saveError.message }, { status: 500 })
    }

    console.log('Success! Plan saved:', saved.id)
    return NextResponse.json({ plan: saved })

  } catch (err: any) {
    console.error('Unhandled error:', err)
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 })
  }
}