import { createClient } from '@/lib/supabase/server'
import HouseholdSettings from '../components/settings/HouseholdSettings'
import MembersSettings from '../components/settings/MembersSettings'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: household } = await supabase
    .from('household')
    .select('*')
    .single()

  const { data: members } = await supabase
    .from('members')
    .select('*')
    .eq('household_id', household.id)
    .order('created_at', { ascending: true })

  return (
    <main className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-slate-800 mb-8">Settings</h1>

        <div className="flex flex-col gap-6">
          <HouseholdSettings household={household} />
          <MembersSettings members={members ?? []} householdId={household.id} />
        </div>
      </div>
    </main>
  )
}