'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'

export default function Dashboard() {
  const router = useRouter()

  useEffect(() => {
    async function checkSession() {
      const supabase = getSupabase()
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        router.push('/signin')
      }
    }

    checkSession()
  }, [router])

  return <div>Dashboard</div>
}
