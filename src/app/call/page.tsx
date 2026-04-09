'use client'

import { useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import AiHintPanel from '@/features/call/components/AiHintPanel'
import CallTimer from '@/features/call/components/CallTimer'
import CallControls from '@/features/call/components/CallControls'
import CallEndScreen from '@/features/call/components/CallEndScreen'

const VideoGrid = dynamic(
  () => import('@/features/call/components/VideoGrid'),
  { ssr: false },
)

export default function CallPage() {
  const [callEnded, setCallEnded] = useState(false)

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
          <AiHintPanel />
        </div>
        {/* 中央：映像 */}
        <div className="flex-1 flex flex-col gap-3 justify-center items-center w-full">
          <VideoGrid className="w-full h-full" />
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
