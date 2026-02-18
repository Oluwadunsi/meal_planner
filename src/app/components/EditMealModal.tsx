'use client'

import { useState } from 'react'

type Meal = {
  name: string
  description: string
  time_minutes: number
}

type Props = {
  day: string
  mealType: string
  meal: Meal
  planId: string
  onClose: () => void
  onSave: (day: string, mealType: string, updated: Meal) => void
}

export default function EditMealModal({ day, mealType, meal, planId, onClose, onSave }: Props) {
  const [form, setForm] = useState<Meal>({ ...meal })
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)
    try {
      const res = await fetch('/api/update-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: planId,
          day,
          meal_type: mealType,
          updated_meal: form,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      onSave(day, mealType, form)
      onClose()
    } catch (err) {
      console.error(err)
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Modal */}
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">{day} · {mealType}</p>
            <h2 className="text-lg font-semibold text-slate-800 mt-0.5">Edit meal</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-slate-500 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Meal name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Prep time (minutes)</label>
            <input
              type="number"
              value={form.time_minutes}
              onChange={e => setForm(f => ({ ...f, time_minutes: Number(e.target.value) }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 border border-slate-200 text-slate-500 py-2 rounded-lg text-sm hover:border-slate-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-slate-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}