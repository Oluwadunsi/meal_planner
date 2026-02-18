'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function RatePage({ params }: { params: { plan_id: string } }) {
  const router = useRouter()
  const [weeklyRating, setWeeklyRating] = useState<number>(0)
  const [mealRatings, setMealRatings] = useState<Record<string, boolean>>({})
  const [feedbackText, setFeedbackText] = useState('')
  const [loading, setLoading] = useState(false)

  function toggleMealRating(day: string, liked: boolean) {
    setMealRatings(prev => {
      const key = `${day}_dinner`
      if (prev[key] === liked) {
        const next = { ...prev }
        delete next[key]
        return next
      }
      return { ...prev, [key]: liked }
    })
  }

  async function handleSubmit() {
    if (weeklyRating === 0) return
    setLoading(true)

    const ratingScores: Record<string, number> = {}
    Object.entries(mealRatings).forEach(([key, liked]) => {
      ratingScores[key] = liked ? 5 : 2
    })

    try {
      await fetch('/api/submit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: params.plan_id,
          weekly_rating: weeklyRating,
          meal_ratings: ratingScores,
          feedback_text: feedbackText,
        }),
      })
      router.push('/this-week')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-slate-800 mb-1">Rate this week</h1>
        <p className="text-slate-400 text-sm mb-8">Your feedback shapes next week's plan.</p>

        {/* Overall rating */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 mb-4">
          <p className="text-sm font-medium text-slate-700 mb-3">Overall week</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setWeeklyRating(n)}
                className={`w-10 h-10 rounded-lg text-sm font-medium border transition-colors ${
                  weeklyRating === n
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Dinner ratings */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 mb-4">
          <p className="text-sm font-medium text-slate-700 mb-3">Dinners</p>
          <div className="flex flex-col gap-2">
            {DAYS.map(day => {
              const key = `${day}_dinner`
              const val = mealRatings[key]
              return (
                <div key={day} className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{day}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleMealRating(day, true)}
                      className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
                        val === true
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      👍
                    </button>
                    <button
                      onClick={() => toggleMealRating(day, false)}
                      className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
                        val === false
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      👎
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Text feedback */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 mb-6">
          <p className="text-sm font-medium text-slate-700 mb-2">Any notes?</p>
          <textarea
            value={feedbackText}
            onChange={e => setFeedbackText(e.target.value)}
            placeholder="Too expensive, too complex, loved the Jollof Rice..."
            rows={3}
            className="w-full text-sm text-slate-600 placeholder-slate-300 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={weeklyRating === 0 || loading}
          className="w-full bg-slate-800 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-40 transition-colors"
        >
          {loading ? 'Saving...' : 'Submit feedback'}
        </button>
      </div>
    </main>
  )
}