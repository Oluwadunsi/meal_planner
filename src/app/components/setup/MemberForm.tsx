'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addMember } from '@/lib/actions/house_hold'

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Halal', 'Kosher', 'Nut allergy']
const CUISINE_OPTIONS = ['Nigerian', 'Italian', 'Swedish', 'Asian', 'Mexican', 'Mediterranean', 'Indian', 'American']
const SPICE_OPTIONS = ['low', 'medium', 'high']

type Member = { name: string; spice_tolerance: string; dietary_constraints: string[]; disliked_ingredients: string; cuisine_preferences: string[] }

const emptyMember = (): Member => ({
  name: '',
  spice_tolerance: 'medium',
  dietary_constraints: [],
  disliked_ingredients: '',
  cuisine_preferences: [],
})

export default function MemberForm({ householdId }: { householdId: string }) {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([emptyMember()])
  const [loading, setLoading] = useState(false)

  function updateMember(index: number, field: keyof Member, value: string | string[]) {
    setMembers(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  function toggleArrayField(index: number, field: 'dietary_constraints' | 'cuisine_preferences', value: string) {
    setMembers(prev => prev.map((m, i) => {
      if (i !== index) return m
      const current = m[field]
      return {
        ...m,
        [field]: current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value]
      }
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await Promise.all(members.map(m =>
        addMember({
          household_id: householdId,
          name: m.name,
          spice_tolerance: m.spice_tolerance,
          dietary_constraints: m.dietary_constraints,
          disliked_ingredients: m.disliked_ingredients.split(',').map(s => s.trim()).filter(Boolean),
          cuisine_preferences: m.cuisine_preferences,
        })
      ))
      router.push('/this-week')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Add household members</h1>
        <p className="text-slate-500 mt-1 text-sm">We'll balance meals around everyone's preferences.</p>
      </div>

      {members.map((member, index) => (
        <div key={index} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Member {index + 1}</span>
            {members.length > 1 && (
              <button
                type="button"
                onClick={() => setMembers(prev => prev.filter((_, i) => i !== index))}
                className="text-xs text-red-400 hover:text-red-600"
              >
                Remove
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={member.name}
              onChange={e => updateMember(index, 'name', e.target.value)}
              placeholder="e.g. Alex"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Spice tolerance</label>
            <div className="flex gap-2">
              {SPICE_OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => updateMember(index, 'spice_tolerance', opt)}
                  className={`flex-1 py-1.5 rounded-lg text-sm border capitalize transition-colors ${
                    member.spice_tolerance === opt
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
            <label className="block text-sm font-medium text-slate-700 mb-2">Dietary constraints</label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleArrayField(index, 'dietary_constraints', opt)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    member.dietary_constraints.includes(opt)
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
            <label className="block text-sm font-medium text-slate-700 mb-2">Cuisine preferences</label>
            <div className="flex flex-wrap gap-2">
              {CUISINE_OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleArrayField(index, 'cuisine_preferences', opt)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    member.cuisine_preferences.includes(opt)
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
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Disliked ingredients
              <span className="text-slate-400 font-normal ml-1">(comma separated)</span>
            </label>
            <input
              type="text"
              value={member.disliked_ingredients}
              onChange={e => updateMember(index, 'disliked_ingredients', e.target.value)}
              placeholder="e.g. mushrooms, olives, blue cheese"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setMembers(prev => [...prev, emptyMember()])}
        className="w-full border border-dashed border-slate-300 rounded-xl py-3 text-sm text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-colors"
      >
        + Add another member
      </button>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-800 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Saving...' : 'Done — take me to my week'}
      </button>
    </form>
  )
}