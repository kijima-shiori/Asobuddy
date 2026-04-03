'use client'

import { useState } from 'react'
import Image from 'next/image'
import AgoraRTC, { AgoraRTCProvider, useRTCClient } from 'agora-rtc-react'
import AiHintPanel from '@/features/call/components/AiHintPanel'
import VideoGrid from '@/features/call/components/VideoGrid'
import CallTimer from '@/features/call/components/CallTimer'
import CallControls from '@/features/call/components/CallControls'
import CallEndScreen from '@/features/call/components/CallEndScreen'

// クライアントの初期化
const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })

export default function Callpage() {
  const [callEnded, setCallEnded] = useState(false)

  return (
    // 作成したclientを渡す
    <AgoraRTCProvider client={client}>
      {/* 画面全体を覆うコンテナ */}
      <div className="relative h-screen w-full overflow-hidden flex flex-col">
        {/* 背景画像 */}
        <Image
          src="/images/login-bg.png"
          alt="Background"
          fill
          quality={100}
          priority
          className="object-cover Z-0"
        />
        {/* 通話コンテンツ（背景の上に重ねる） */}
        <div className="relative z-10 flex flex-col h-full max-w-md mx-auto w-full px-6 py-8">
          {/* 上部：AIヒント */}
          <div className="h-[20%] flex items-center justify-center">
            {' '}
            <AiHintPanel />
          </div>

          {/* 中央：映像 (VideoGrid) */}
          <div className="flex-1 flex flex-col gap-3 justify-center items-center">
            <VideoGrid />
          </div>
          {/* 下部：操作ボタン (CallControls) */}
          <div className="h-[15%] flex items-end justify-center pb-4">
            {' '}
            <CallTimer />
            <CallControls />
          </div>

          {callEnded && <CallEndScreen />}
        </div>
      </div>
    </AgoraRTCProvider>
  )
}
