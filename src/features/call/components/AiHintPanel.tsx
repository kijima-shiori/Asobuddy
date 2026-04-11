'use client'

import { useAiHint } from '@/features/call/hooks/useAiHint'
import Image from 'next/image'

interface Props {
  sessionId: string
  myChildId: string
}

export default function AiHintPanel({ sessionId, myChildId }: Props) {
  const { hint, loading } = useAiHint(sessionId, myChildId)

  return (
    <div className="relative w-full flex items-center justify-between px-2 z-10">
      {/* 吹き出し */}
      <div className="relative bg-white rounded-2xl px-4 py-3 shadow-md max-w-[75%]">
        {/* 吹き出しの三角 */}
        <div
          className="absolute right-[-10px] top-4 w-0 h-0 
          border-t-[8px] border-t-transparent 
          border-l-[10px] border-l-white 
          border-b-[8px] border-b-transparent"
        />
        {/* ヒントテキスト・ローディング中は薄く表示 */}
        <p
          className={`text-sm font-bold ${loading ? 'text-gray-300' : 'text-gray-700'}`}
        >
          {hint}
        </p>
        {/* ローディング中は小さく「...」を表示 */}
        {loading && <span className="text-xs text-gray-400 ml-1">...</span>}
      </div>

      {/* キャラクター */}
      <div className="w-16 h-16 flex-shrink-0">
        <Image
          src="/images/girl.png"
          alt="AIキャラクター"
          width={64}
          height={64}
          className="object-contain"
        />
      </div>
    </div>
  )
}
