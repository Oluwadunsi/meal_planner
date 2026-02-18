import { createClient } from '@/lib/supabase/server'
import GenerateButton from '@/app/components/GenerateButton'
import WeekGrid from '@/app/components/WeekGrid'
import Link from 'next/link'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEALS = ['breakfast', 'lunch', 'dinner'] as const

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

function getCurrentWeekStart() {
  const now = new Date()
  const day = now.getUTCDay() // 0 = Sunday, 1 = Monday...
  const diff = day === 0 ? -6 : 1 - day // adjust to Monday
  const monday = new Date(now)
  monday.setUTCDate(now.getUTCDate() + diff)
  return monday.toISOString().split('T')[0]
}

function groupGroceries(list: any[]) {
  console.log('First grocery item:', JSON.stringify(list[0]))
  const groups: Record<string, any[]> = {}

  list.forEach(item => {
    const category = item.category
      ? item.category.charAt(0).toUpperCase() + item.category.slice(1)
      : 'Other'
    if (!groups[category]) groups[category] = []
    groups[category].push(item)
  })

  return Object.entries(groups).filter(([, items]) => items.length > 0)
}

export default async function ThisWeekPage() {
  const supabase = await createClient()
  const currentWeekStart = getCurrentWeekStart()

  const { data: plan } = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('week_start', currentWeekStart)
    .single()

  // Check if already rated
  const { data: existingFeedback } = plan ? await supabase
    .from('feedback')
    .select('id')
    .eq('plan_id', plan.id)
    .single() : { data: null }

  if (!plan) {
    return (
      <main className="min-h-screen bg-[#F5F5F0] flex flex-col items-center justify-center gap-3">
        <p className="text-slate-600 font-medium">No plan for this week yet.</p>
        <p className="text-slate-400 text-sm">Generate one to get started.</p>
        <div className="mt-2">
          <GenerateButton label="Generate this week's plan" />
        </div>
      </main>
    )
  }

  const { data: household } = await supabase
  .from('household')
  .select('*')
  .single()

  const groceryGroups = groupGroceries(plan.grocery_list)

  return (
    <main className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">This week</h1>
            <p className="text-slate-400 text-sm mt-0.5">Week of {formatDate(plan.week_start)}</p>
          </div>
          <div className="flex items-center gap-3">
            {plan.metadata?.estimated_cost && (
              <span className="text-sm text-slate-400">~{plan.metadata.estimated_cost}</span>
            )}
            {existingFeedback ? (
              <span className="text-sm text-slate-400 bg-white border border-slate-200 px-3 py-2 rounded-lg">
                ✓ Rated this week
              </span>
            ) : (
              <Link
                href={`/rate/${plan.id}`}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                Rate this week
              </Link>
            )}
          </div>
        </div>

        {/* 7-day grid */}
        <div className="mb-12">
          <WeekGrid 
            meals={plan.meals} 
            planId={plan.id} 
            editable={true}
            planDays={household.plan_days ?? 7}
          />        
        </div>

        {/* Cuisine tags */}
        {plan.metadata?.cuisine_distribution && (
          <div className="flex gap-2 mb-10">
            {Object.entries(plan.metadata.cuisine_distribution).map(([cuisine, count]) => (
              <span key={cuisine} className="px-3 py-1 bg-white rounded-full text-xs text-slate-500 border border-slate-100">
                {cuisine} · {count as number}d
              </span>
            ))}
          </div>
        )}

        {/* Grocery list */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-5">Grocery list</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {groceryGroups.map(([group, items]) => (
              <div key={group}>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">{group}</p>
                <div className="flex flex-col gap-2">
                  {items.map((item: any, i: number) => (
                    <div key={i} className="bg-white rounded-lg px-3 py-2 border border-slate-100">
                      <p className="text-sm text-slate-700 capitalize">{item.item}</p>
                      <p className="text-xs text-slate-400">{item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}