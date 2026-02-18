import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: household } = await supabase
    .from('household')
    .select('id')
    .single()

  if (household) redirect('/this-week')
  else redirect('/setup')
}