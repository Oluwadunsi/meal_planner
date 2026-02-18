'use client'

import { useState } from 'react'
import EditMealModal from './EditMealModal'

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEALS = ['breakfast', 'lunch', 'dinner'] as const

type Props = {
  meals: any[]
  planId: string
  editable?: boolean
  planDays?: number
}

export default function WeekGrid({ meals, planId, editable = true, planDays = 7 }: Props) {
  const days = ALL_DAYS.slice(0, planDays)
  const [localMeals, setLocalMeals] = useState(meals)
  const [editing, setEditing] = useState<{
    day: string
    mealType: string
    meal: any
  } | null>(null)

  function handleSave(day: string, mealType: string, updated: any) {
    setLocalMeals(prev =>
      prev.map(d => d.day === day ? { ...d, [mealType]: updated } : d)
    )
  }

  return (
    <>
      <div className="grid grid-cols-7 gap-3">
        {days.map(day => {
          const dayPlan = localMeals.find((m: any) => m.day === day)
          return (
            <div key={day} className="flex flex-col gap-2">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide text-center">
                {day.slice(0, 3)}
              </p>
              {MEALS.map(mealType => {
                const meal = dayPlan?.[mealType]
                return (
                  <div
                    key={mealType}
                    onClick={() => editable && meal && setEditing({ day, mealType, meal })}
                    className={`bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex flex-col gap-1 
                      ${editable ? 'cursor-pointer hover:border-slate-300 hover:shadow-md transition-all group' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-300 uppercase tracking-wide">{mealType}</span>
                      {editable && (
                        <span className="text-[10px] text-slate-200 group-hover:text-slate-400 transition-colors">
                          edit
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-700 leading-snug">
                      {meal?.name ?? '—'}
                    </p>
                    {meal?.time_minutes && (
                      <p className="text-[10px] text-slate-300">{meal.time_minutes} min</p>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {editing && (
        <EditMealModal
          day={editing.day}
          mealType={editing.mealType}
          meal={editing.meal}
          planId={planId}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </>
  )
}