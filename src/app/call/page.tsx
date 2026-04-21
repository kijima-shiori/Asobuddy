'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import AiHintPanel from '@/features/call/components/AiHintPanel'
import CallTimer from '@/features/call/components/CallTimer'
import CallControls from '@/features/call/components/CallControls'
import CallEndScreen from '@/features/call/components/CallEndScreen'
import { useAiHint } from '@/features/call/hooks/useAiHint'

const VideoGrid = dynamic(
  () => import('@/features/call/components/VideoGrid'),
  { ssr: false },
)

function CallPageInner() {
  const [callEnded, setCallEnded] = useState(false)
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId') ?? ''
  const myChildId = searchParams.get('childId') ?? ''

  // ② パラメータ未取得時のガード
  if (!sessionId || !myChildId) {
    return (
      <div className="flex items-center justify-center h-screen text-center text-sm text-gray-500">
        セッション情報がありません
      </div>
    )
  }

  // AIヒントをpage.tsxで管理してresetSilenceTimerをVideoGridに渡す
  const { hint, loading, resetSilenceTimer } = useAiHint(sessionId, myChildId)

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col">
      <Image
        src="/images/login-bg.png"
        alt="Background"
        fill
        quality={100}
        priority
        className="object-cover z-0"
      />
      <div className="relative z-10 flex flex-col h-full max-w-md mx-auto w-full px-6 py-8">
        {/* 上部：AIヒント */}
        <div className="flex items-center justify-center py-2">
          <AiHintPanel hint={hint} loading={loading} />
        </div>
        {/* 中央：映像 */}
        <div className="flex-1 flex flex-col gap-3 justify-center items-center w-full">
          <VideoGrid
            sessionId={sessionId}
            myChildId={myChildId}
            onVoiceDetected={resetSilenceTimer}
          />
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
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-sm text-gray-500">通話を準備しています…</div>}>
      <CallPageInner />
    </Suspense>
  )
}
