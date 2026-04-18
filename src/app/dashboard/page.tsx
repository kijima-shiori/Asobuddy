'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [childId, setChildId] = useState<string | null>(null)

  // ログインチェック
  // TODO: データベースからChild IDを反映する。（仮でIDをベタ打ちしています）
  useEffect(() => {
    async function checkSession() {
      const supabase = getSupabase()
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        router.push('/signin')
        return
      }

      const { data: childData, error } = await supabase
        .from('children')
        .select('id')
        .eq('user_id', data.session.user.id)
        .single()

      if (childData) {
        console.log('子供のid:', childData.id)
        setChildId(childData.id)
      }

      setLoading(false)
    }

    checkSession()
  }, [router])

  const handleFindFriend = () => {
    if (childId) {
      router.push(`/matching?childId=${childId}`)
    } else {
      alert('あなたのお名前が見つけられなったよ。')
    }
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
