'use client'

import { getSupabase } from '@/lib/supabase'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export const useMatchRealtime = (
  sessionId: string | undefined,
  userId: string | null,
) => {
  const router = useRouter()

  useEffect(() => {
    console.log('★Realtime監視開始チェック:', { sessionId, userId })
    // sessionIdが決まっていなかったら無視
    if (!sessionId || !userId) return

    const supabase = getSupabase()
    // 監視用のチャンネルを作る
    const channel = supabase
      // .channelは通信回線を開く命令
      .channel(`matching_${sessionId}`)
      //   「〜の時に（on）」動く指令
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${sessionId}`,
        },
        // （payload)は「更新されたデータの中身」が入った箱
        (payload) => {
          console.log('テーブルが更新されました', payload)

          const newData = payload.new as { status?: string }
          const newStatus = newData?.status

          if (newStatus === 'matched') {
            console.log('マッチング成功！遷移します')
            setTimeout(() => {
              router.push(
                `/matching/success?session_id=${sessionId}&userId=${userId}`,
              )
            }, 500)
          }
        },
      )
      .subscribe()

    return () => {
      // チャンネルを削除する
      supabase.removeChannel(channel)
    }
  }, [sessionId, router, userId])
}
