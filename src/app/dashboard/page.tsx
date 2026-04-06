'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { createSession } from '@/features/matching/services/matchService'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  // ログインしているかチェック
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setLoading(false)
      // if (!session) {
      //   router.push('/auth/signin') // ログインしてなければ飛ばす
      // } else {
      //   setLoading(false) // ログインしてれば画面を出す
      // }
    }
    checkUser()
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
        className="w-full py-4 bg-orange-400 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all"
      >
        友達を見つける
      </button>
    </main>
  )
}
