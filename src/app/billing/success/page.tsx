'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation' // ★ 追加

export default function BillingSuccessPage() {
  const router = useRouter()

  const supabase = useMemo<SupabaseClient>(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    return createClient(url, key)
  }, [])

  const [periodStart, setPeriodStart] = useState<Date | null>(null)
  const [periodEnd, setPeriodEnd] = useState<Date | null>(null)

  useEffect(() => {
    if (!supabase) return

    const fetchSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setPeriodStart(new Date(data.current_period_start))
        setPeriodEnd(new Date(data.current_period_end))
      }
    }

    fetchSubscription()
  }, [supabase])

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 上部 45% 背景画像 */}
      <div className="relative w-full h-[45vh] px-4 pt-4">
        <div
          className="w-full h-full rounded-xl bg-cover bg-top"
          style={{ backgroundImage: "url('/images/background_blue-1.png')" }}
        ></div>

        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-7xl font-bold text-[#FFFFFF]">Subscription</h1>
        </div>
      </div>

      {/* 下部 55% */}
      <div className="flex flex-col items-center px-8 mt-[-40px]">
        {/* ✔マーク */}
        <div className="w-28 h-28 rounded-full bg-[#E0FFF6]/10 flex items-center justify-center mt-24">
          <div className="w-20 h-20 rounded-full bg-[#4CD9D9] flex items-center justify-center">
            <span className="text-white text-4xl">✔</span>
          </div>
        </div>

        {/* メッセージ */}
        <h2 className="text-lg font-normal text-gray-600 tracking-wide mt-4">
          お支払いは完了しています
        </h2>

        {/* ★ 支払い期間（支払い後に表示） */}
        {periodStart && periodEnd && (
          <p className="text-gray-700 mt-2 text-sm">
            期間：{periodStart.toLocaleDateString()} ～{' '}
            {periodEnd.toLocaleDateString()}
          </p>
        )}

        {/* ★ OKボタン（Account に遷移） */}
        <button
          onClick={() => router.push('/account')} // ← 追加
          className="w-full bg-[#FFA451] text-white py-3 rounded-lg font-semibold mt-30"
        >
          OK
        </button>
      </div>
    </div>
  )
}
