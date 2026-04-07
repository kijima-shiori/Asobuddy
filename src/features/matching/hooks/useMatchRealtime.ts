'use client'

import { supabase } from '@/lib/supabase'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export const useMatchRealtime = (sessionId: string | undefined) => {
  const router = useRouter()

  useEffect(() => {
    // sessionIdが決まっていなかったら無視
    if (!sessionId) return

    // 監視用のチャンネルを作る
    const channel = supabase
      // .channelは通信回線を開く命令
      .channel(`matching_${sessionId}`)
      //   「〜の時に（on）」動くしれい
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

          if (payload.new.status === 'matched') {
            console.log('マッチング成功！')
            router.push(`/matching/success?session_id=${sessionId}`)
          }
        },
      )
      .subscribe()

    return () => {
      // チャンネルを削除する
      supabase.removeChannel(channel)
    }
  }, [sessionId, router])
}
