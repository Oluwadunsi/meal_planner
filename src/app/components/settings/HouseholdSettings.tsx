'use client'

import { useState } from 'react'
import { updateHousehold } from '@/lib/actions/house_hold'

const BUDGET_OPTIONS = ['student', 'mid', 'comfortable']
const COOKING_TIME_OPTIONS = ['quick', 'medium', 'leisurely']

export default function HouseholdSettings({ household }: { household: any }) {
  const [form, setForm] = useState({
    city: household.city,
    budget_level: household.budget_level,
    cooking_time: household.cooking_time,
    meals_per_day: household.meals_per_day,
    household_size: household.household_size,
    plan_days: household.plan_days ?? 7,
    monthly_budget_sek: household.monthly_budget_sek ?? null,
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setLoading(true)
    try {
      await updateHousehold(household.id, form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <h2 className="text-base font-semibold text-slate-800 mb-5">Household</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">City</label>
          <input
            type="text"
            value={form.city}
            onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Household size</label>
          <input
            type="number"
            min={1} max={10}
            value={form.household_size}
            onChange={e => setForm(f => ({ ...f, household_size: Number(e.target.value) }))}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
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

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-2">Budget level</label>
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
          <label className="block text-xs font-medium text-slate-500 mb-2">Cooking time</label>
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
        <label className="block text-xs font-medium text-slate-500 mb-1">
          Monthly budget (SEK)
          <span className="text-slate-400 font-normal ml-1">(optional)</span>
        </label>
        <input
          type="number"
          value={form.monthly_budget_sek ?? ''}
          onChange={e => setForm(f => ({ ...f, monthly_budget_sek: e.target.value ? Number(e.target.value) : null }))}
          placeholder="e.g. 3000"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
        />
      </div>


      <button
        onClick={handleSave}
        disabled={loading}
        className="mt-6 w-full bg-slate-800 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
      >
        {saved ? '✓ Saved' : loading ? 'Saving...' : 'Save changes'}
      </button>
    </div>
  )
}