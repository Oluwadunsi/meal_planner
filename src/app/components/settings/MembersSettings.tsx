'use client'

import { useState } from 'react'
import { addMember, deleteMember, updateMember } from '@/lib/actions/house_hold'
import MemberCard from './MemberCard'

export default function MembersSettings({
  members,
  householdId,
}: {
  members: any[]
  householdId: string
}) {
  const [localMembers, setLocalMembers] = useState(members)
  const [adding, setAdding] = useState(false)

  async function handleDelete(id: string) {
    await deleteMember(id)
    setLocalMembers(prev => prev.filter(m => m.id !== id))
  }

  async function handleUpdate(id: string, data: any) {
    await updateMember(id, data)
    setLocalMembers(prev => prev.map(m => m.id === id ? { ...m, ...data } : m))
  }

  async function handleAdd(data: any) {
    const member = await addMember({ household_id: householdId, ...data })
    setLocalMembers(prev => [...prev, member])
    setAdding(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-slate-800">Members</h2>
        <button
          onClick={() => setAdding(true)}
          className="text-sm text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:border-slate-400 hover:text-slate-700 transition-colors"
        >
          + Add member
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {localMembers.map(member => (
          <MemberCard
            key={member.id}
            member={member}
            onDelete={() => handleDelete(member.id)}
            onUpdate={(data) => handleUpdate(member.id, data)}
          />
        ))}

        {adding && (
          <MemberCard
            member={null}
            isNew
            onSave={handleAdd}
            onCancel={() => setAdding(false)}
          />
        )}

        {localMembers.length === 0 && !adding && (
          <p className="text-sm text-slate-400 text-center py-4">
            No members yet. Add one to get started.
          </p>
        )}
      </div>
    </div>
  )
}