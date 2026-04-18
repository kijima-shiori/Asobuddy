'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  // ログインチェック
  // TODO: データベースからChild IDを反映する。（仮でIDをベタ打ちしています）
  useEffect(() => {
    async function checkSession() {
      const supabase = getSupabase()
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        router.push('/signin')
      } else {
        setLoading(false)
      }
    }
    checkSession()
  }, [router])

  const userId = '17b0a1d9-4656-4939-9ee4-cd2b9e7a5884'

  const handleFindFriend = () => {
    router.push('/matching')
  }

  if (loading) return <div>読み込み中...</div>

  return (
    <main className="p-4">
      <button
        onClick={handleFindFriend}
        className="w-full py-4 bg-[#FFA451] text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all"
      >
        友達を見つける
      </button>
    </main>
  )
}
