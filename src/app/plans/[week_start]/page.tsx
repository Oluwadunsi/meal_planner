import { createClient } from '@/lib/supabase/server'
import WeekGrid from '@/app/components/WeekGrid'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEALS = ['breakfast', 'lunch', 'dinner'] as const

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

export default async function PastWeekPage({ params }: { params: { week_start: string } }) {
  const supabase = await createClient()

  const { data: plan } = await supabase
    .from('weekly_plans')
    .select('*, feedback(weekly_rating, feedback_text)')
    .eq('week_start', params.week_start)
    .single()

  if (!plan) notFound()

  const feedback = plan.feedback?.[0]

  return (
    <main className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/plans" className="text-xs text-slate-400 hover:text-slate-600 mb-2 block">
              ← Past weeks
            </Link>
            <h1 className="text-2xl font-semibold text-slate-800">
              Week of {formatDate(plan.week_start)}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {plan.metadata?.estimated_cost && (
              <span className="text-sm text-slate-400">~{plan.metadata.estimated_cost}</span>
            )}
            {feedback ? (
              <div className="text-right">
                <p className="text-sm font-medium text-slate-700">{feedback.weekly_rating}/5</p>
                {feedback.feedback_text && (
                  <p className="text-xs text-slate-400 mt-0.5 max-w-48 truncate">{feedback.feedback_text}</p>
                )}
              </div>
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
          <WeekGrid meals={plan.meals} planId={plan.id} editable={false} />
        </div>


      </div>
    </main>
  )
}