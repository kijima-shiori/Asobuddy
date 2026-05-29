'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import AiHintPanel from '@/features/call/components/AiHintPanel'
import CallControls from '@/features/call/components/CallControls'
import CallEndScreen from '@/features/call/components/CallEndScreen'
import { getSupabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const VideoGrid = dynamic(
  () => import('@/features/call/components/VideoGrid'),
  { ssr: false },
)

function CallPageInner() {
  const router = useRouter()
  const [callEnded] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [myChildId, setMyChildId] = useState<string>('')
  const [isEnding, setIsEnding] = useState(false)

  const handleEndCall = async () => {
    if (!sessionId || isEnding) return

    setIsEnding(true)

    const demoTranscript = `
Lily: Hi Hana! What do you like to do?
Hana: I like cooking. I made cookies with my dad.
Lily: That sounds fun! I like cooking too.
Hana: Really? What do you like to make?
Lily: I like making cupcakes. I also like SPY×FAMILY and Pokémon.
Hana: I like SPY×FAMILY too! My favorite character is Anya.
Lily: Me too! Anya is cute.
Hana: I was happy to talk with you.
Lily: Me too. Let's talk again!
`

    await fetch('/api/calls/end', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    })

    await fetch('/api/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        transcript: demoTranscript,
      }),
    })

    router.push(`/report?sessionId=${sessionId}`)
  }
  useEffect(() => {
    const fetchSessionAndChild = async () => {
      const supabase = getSupabase()

      // ① URLからsession_idを取得
      const params = new URLSearchParams(window.location.search)
      const sessionIdFromUrl = params.get('session_id')

      // ② Supabase AuthからユーザーIDを取得
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // ③ childrenテーブルからchildIdを取得
      const { data: child } = await supabase
        .from('children')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!child) return
      setMyChildId(child.id)

      // ④ URLのsession_idを優先
      if (sessionIdFromUrl) {
        setSessionId(sessionIdFromUrl)
        return
      }

      // ⑤ URLにsession_idがない時だけDBから探す
      const { data: session } = await supabase
        .from('sessions')
        .select('id')
        .or(`child_a_id.eq.${child.id},child_b_id.eq.${child.id}`)
        .eq('status', 'matched')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

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
          {sessionId && <AiHintPanel />}
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
          <CallControls onEndCall={handleEndCall} isEnding={isEnding} />
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
