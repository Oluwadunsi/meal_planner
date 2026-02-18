'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GenerateButton({ label = 'Generate this week' }: { label?: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/generate-plan', { method: 'POST' })
      
      if (res.status === 409) {
        // Plan already exists, just refresh
        router.refresh()
        return
      }
      
      if (!res.ok) throw new Error('Failed to generate')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Check the console.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
    >
      {loading ? 'Generating...' : label}
    </button>
  )
}