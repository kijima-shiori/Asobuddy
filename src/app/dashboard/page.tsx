import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/signin')
  }

  return <div>Dashboard</div>
}
