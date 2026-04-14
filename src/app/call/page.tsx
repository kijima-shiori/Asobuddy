'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import AiHintPanel from '@/features/call/components/AiHintPanel'
import CallTimer from '@/features/call/components/CallTimer'
import CallControls from '@/features/call/components/CallControls'
import CallEndScreen from '@/features/call/components/CallEndScreen'
import { getSupabase } from '@/lib/supabase'

const VideoGrid = dynamic(
  () => import('@/features/call/components/VideoGrid'),
  { ssr: false },
)

function CallPageInner() {
  const [callEnded, setCallEnded] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [myChildId, setMyChildId] = useState<string>('')

  useEffect(() => {
    const fetchSessionAndChild = async () => {
      const supabase = getSupabase()

      // ① Supabase AuthからユーザーIDを取得
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // ② childrenテーブルからchildIdを取得
      const { data: child } = await supabase
        .from('children')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!child) return
      setMyChildId(child.id)

      // ③ sessionsテーブルからsessionIdを取得
      const { data: session } = await supabase
        .from('sessions')
        .select('id')
        .or(`child_a_id.eq.${child.id},child_b_id.eq.${child.id}`)
        .eq('status', 'matched')
        .single()

      if (!session) return
      setSessionId(session.id)
    }

    fetchSessionAndChild()
  }, [])

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col">
      {/* 背景画像 */}
      <Image
        src="/images/login-bg.png"
        alt="Background"
        fill
        quality={100}
        priority
        className="object-cover z-0"
      />
      {/* 通話コンテンツ（背景の上に重ねる） */}
      <div className="relative z-10 flex flex-col h-full max-w-md mx-auto w-full px-6 py-8">
        {/* 上部：AIヒント */}
        <div className="h-[20%] flex items-center justify-center">
          {sessionId && (
            <AiHintPanel sessionId={sessionId} myChildId={myChildId} />
          )}
        </div>
        {/* 中央：映像 */}
        <div className="flex-1 flex flex-col gap-3 justify-center items-center w-full">
          {sessionId && myChildId ? (
            <VideoGrid sessionId={sessionId} myChildId={myChildId} />
          ) : (
            <div className="text-white text-center">じゅんび中...</div>
          )}
        </div>
        {/* 下部：操作ボタン */}
        <div className="h-[15%] flex items-end justify-center pb-4">
          <CallTimer />
          <CallControls />
        </div>
        {callEnded && <CallEndScreen />}
      </div>
    </div>
  )
}

export default function CallPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <CallPageInner />
    </Suspense>
  )
}
