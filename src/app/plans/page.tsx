import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

function getCurrentWeekStart() {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  return monday.toISOString().split('T')[0]
}

export default async function PlansPage() {
  const supabase = await createClient()
  const currentWeekStart = getCurrentWeekStart()

  const { data: plans } = await supabase
    .from('weekly_plans')
    .select('id, week_start, metadata, feedback(weekly_rating)')
    .neq('week_start', currentWeekStart)
    .order('week_start', { ascending: false })

  return (
    <main className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-slate-800 mb-8">Past weeks</h1>

        {!plans || plans.length === 0 ? (
          <p className="text-slate-400 text-sm">No past plans yet. They'll appear here after each week.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {plans.map((plan: any) => {
              const rating = plan.feedback?.[0]?.weekly_rating
              return (
                <Link
                  key={plan.id}
                  href={`/plans/${plan.week_start}`}
                  className="bg-white rounded-xl border border-slate-100 px-5 py-4 flex items-center justify-between hover:border-slate-300 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Week of {formatDate(plan.week_start)}
                    </p>
                    {plan.metadata?.cuisine_distribution && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {Object.entries(plan.metadata.cuisine_distribution)
                          .map(([c, n]) => `${c} ${n}d`)
                          .join(' · ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {plan.metadata?.estimated_cost && (
                      <span className="text-xs text-slate-400">{plan.metadata.estimated_cost}</span>
                    )}
                    {rating ? (
                      <span className="text-sm font-medium text-slate-600">{rating}/5</span>
                    ) : (
                      <span className="text-xs text-slate-300">Not rated</span>
                    )}
                    <span className="text-slate-300">→</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}