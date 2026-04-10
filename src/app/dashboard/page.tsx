'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'

export default function Dashboard() {
  const router = useRouter()
  const supabase = getSupabase()
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/signin')
    })
  }, [])

  return <div>Dashboard</div>
}
