'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AccountSettings({ userEmail }: { userEmail: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <h2 className="text-base font-semibold text-slate-800 mb-5">Account</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
          <p className="text-sm text-slate-700">{userEmail}</p>
        </div>

        <button
          onClick={handleSignOut}
          disabled={loading}
          className="w-full border border-slate-200 text-slate-600 py-2.5 rounded-lg text-sm font-medium hover:border-slate-400 hover:text-slate-800 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    </div>
  )
}