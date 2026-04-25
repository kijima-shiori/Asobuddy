'use client'

import { getSupabase } from '@/lib/supabase'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export const useMatchRealtime = (
  sessionId: string | undefined,
  userId: string | null,
) => {
  const router = useRouter()

  const initialUserId = useRef(userId)

  useEffect(() => {
    console.log('★Realtime監視開始チェック:', { sessionId, userId })
    // 最初にページを開いておいたときのuserIdを保存しておく。
    if (userId && !initialUserId.current) {
      initialUserId.current = userId
    }
    // userIdがない場合は監視できないので終了
    if (!userId || !sessionId) return

    const supabase = getSupabase()

    // チャンネル名に時刻を混ぜてuniqueな名前にする
    const uniqueChannelName = `matching_${sessionId}`

    console.log('★Realtime監視開始: チャンネル名：', uniqueChannelName)

    // 監視用のチャンネルを作る
    const channel = supabase
      // .channelは通信回線を開く命令
      .channel(uniqueChannelName)
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
          console.log('★自分に関係するテーブル更新を検知！', payload)

          const newData = payload.new as { status: string }

          if (newData.status === 'matched') {
            console.log('マッチング成功！遷移します')
            router.push(
              `/matching/success?session_id=${sessionId}&userId=${initialUserId.current}`,
            )
          }
        },
      )
      .subscribe(async (status) => {
        console.log('★Realtime接続状況:', status)

        if (status === 'SUBSCRIBED') {
          const supabase = getSupabase()
          const { data } = await supabase
            .from('sessions')
            .select('id, status')
            .eq('id', sessionId)
            .eq('status', 'matched')
            .maybeSingle()

          if (data) {
            console.log('★接続成功時にすでにマッチングを確認！遷移します')
            const finalId = initialUserId.current
            router.push(
              `/matching/success?session_id=${sessionId}&userId=${finalId}`,
            )
          }
        }
      })

    return () => {
      // チャンネルを削除する
      supabase.removeChannel(channel)
    }
  }, [userId, sessionId, router])
}
