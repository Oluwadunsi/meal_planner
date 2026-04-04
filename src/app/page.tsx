import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {data: {user} } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  const { data: household } = await supabase
    .from('household')
    .select('id')
    .single();

  if (household) redirect('/this-week')
  else redirect('/setup')
}