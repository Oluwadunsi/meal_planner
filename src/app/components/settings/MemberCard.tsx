'use client'

import { useState } from 'react'

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Halal', 'Kosher', 'Nut allergy']
const CUISINE_OPTIONS = ['Nigerian', 'Italian', 'Swedish', 'Asian', 'Mexican', 'Mediterranean', 'Indian', 'American']
const SPICE_OPTIONS = ['low', 'medium', 'high']

type MemberData = {
  name: string
  spice_tolerance: string
  dietary_constraints: string[]
  disliked_ingredients: string[]
  cuisine_preferences: string[]
}

const empty = (): MemberData => ({
  name: '',
  spice_tolerance: 'medium',
  dietary_constraints: [],
  disliked_ingredients: [],
  cuisine_preferences: [],
})

export default function MemberCard({
  member,
  isNew = false,
  onDelete,
  onUpdate,
  onSave,
  onCancel,
}: {
  member: any
  isNew?: boolean
  onDelete?: () => void
  onUpdate?: (data: MemberData) => void
  onSave?: (data: MemberData) => void
  onCancel?: () => void
}) {
  const [editing, setEditing] = useState(isNew)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<MemberData>(
    member ? {
      name: member.name,
      spice_tolerance: member.spice_tolerance,
      dietary_constraints: member.dietary_constraints ?? [],
      disliked_ingredients: member.disliked_ingredients ?? [],
      cuisine_preferences: member.cuisine_preferences ?? [],
    } : empty()
  )
  const [dislikedInput, setDislikedInput] = useState(
    member?.disliked_ingredients?.join(', ') ?? ''
  )

  function toggleArrayField(field: 'dietary_constraints' | 'cuisine_preferences', value: string) {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }))
  }

  async function handleSave() {
    setLoading(true)
    const data = {
      ...form,
      disliked_ingredients: dislikedInput.split(',').map((s: string) => s.trim()).filter(Boolean),
    }
    try {
      if (isNew) {
        await onSave?.(data)
      } else {
        await onUpdate?.(data)
        setEditing(false)
      }
    } finally {
      setLoading(false)
    }
  }

  // Collapsed view
  if (!editing) {
    return (
      <div className="border border-slate-100 rounded-xl px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700">{member.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {[
              member.spice_tolerance && `Spice: ${member.spice_tolerance}`,
              member.dietary_constraints?.length > 0 && member.dietary_constraints.join(', '),
              member.cuisine_preferences?.length > 0 && member.cuisine_preferences.join(', '),
            ].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-slate-400 hover:text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-xs text-red-400 hover:text-red-600 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    )
  }

  // Expanded edit view
  return (
    <div className="border border-slate-200 rounded-xl p-4 space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Name</label>
        <input
          type="text"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Alex"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-2">Spice tolerance</label>
        <div className="flex gap-2">
          {SPICE_OPTIONS.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => setForm(f => ({ ...f, spice_tolerance: opt }))}
              className={`flex-1 py-1.5 rounded-lg text-sm border capitalize transition-colors ${
                form.spice_tolerance === opt
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
        <label className="block text-xs font-medium text-slate-500 mb-2">Dietary constraints</label>
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => toggleArrayField('dietary_constraints', opt)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                form.dietary_constraints.includes(opt)
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
        <label className="block text-xs font-medium text-slate-500 mb-2">Cuisine preferences</label>
        <div className="flex flex-wrap gap-2">
          {CUISINE_OPTIONS.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => toggleArrayField('cuisine_preferences', opt)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                form.cuisine_preferences.includes(opt)
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
        <label className="block text-xs font-medium text-slate-500 mb-1">
          Disliked ingredients
          <span className="text-slate-400 font-normal ml-1">(comma separated)</span>
        </label>
        <input
          type="text"
          value={dislikedInput}
          onChange={e => setDislikedInput(e.target.value)}
          placeholder="e.g. mushrooms, olives"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => isNew ? onCancel?.() : setEditing(false)}
          className="flex-1 border border-slate-200 text-slate-500 py-2 rounded-lg text-sm hover:border-slate-400 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading || !form.name}
          className="flex-1 bg-slate-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Saving...' : isNew ? 'Add member' : 'Save'}
        </button>
      </div>
    </div>
  )
}