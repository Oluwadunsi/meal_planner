'use client'

import { useState } from 'react'
import { createHousehold } from '@/lib/actions/house_hold'

const BUDGET_OPTIONS = ['student', 'mid', 'comfortable']
const COOKING_TIME_OPTIONS = ['quick', 'medium', 'leisurely']

export default function HouseholdForm({ onComplete }: { onComplete: (id: string) => void }) {
  const [form, setForm] = useState({
    city: '',
    budget_level: 'student',
    cooking_time: 'medium',
    meals_per_day: 3,
    household_size: 2,
    plan_days: 7
  })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const household = await createHousehold(form)
      onComplete(household.id)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Set up your household</h1>
        <p className="text-slate-500 mt-1 text-sm">This helps us plan meals that fit your life.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
          <input
            type="text"
            required
            value={form.city}
            onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
            placeholder="e.g. Stockholm"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Household size</label>
          <input
            type="number"
            min={1} max={10}
            value={form.household_size}
            onChange={e => setForm(f => ({ ...f, household_size: Number(e.target.value) }))}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Budget level</label>
          <div className="flex gap-2">
            {BUDGET_OPTIONS.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => setForm(f => ({ ...f, budget_level: opt }))}
                className={`flex-1 py-2 rounded-lg text-sm border capitalize transition-colors ${
                  form.budget_level === opt
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Cooking time</label>
          <div className="flex gap-2">
            {COOKING_TIME_OPTIONS.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => setForm(f => ({ ...f, cooking_time: opt }))}
                className={`flex-1 py-2 rounded-lg text-sm border capitalize transition-colors ${
                  form.cooking_time === opt
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
          <label className="block text-xs font-medium text-slate-500 mb-2">
            Days to plan for
          </label>
          <div className="flex gap-2">
            {[3, 5, 7].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setForm(f => ({ ...f, plan_days: n }))}
                className={`flex-1 py-2 rounded-lg text-sm border transition-colors ${
                  form.plan_days === n
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {n} days
              </button>
            ))}
          </div>
        </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-800 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Saving...' : 'Continue'}
      </button>
    </form>
  )
}