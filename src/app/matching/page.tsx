'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { createSession } from '@/features/matching/services/matchService'

export default function MatchingPage() {
  const userId = '17b0a1d9-4656-4939-9ee4-cd2b9e7a5884'
  const isStarted = useRef(false)

  useEffect(() => {
    // 2重実行禁止-----------------
    if (isStarted.current) return
    isStarted.current = true

    // createSessionを実行-------------------
    const startMatching = async () => {
      try {
        const session = await createSession(userId)
        console.log('セッションの状態:', session.status)
      } catch (error) {
        console.error('失敗しました:', error)
      }
    }
    startMatching()
  }, [userId])

  //   ------------画面表示------------
  return (
    <main className="min-h-screen bg-[#1F2937] max-w-md mx-auto flex flex-col shadow-2xl relative overflow-hidden">
      <div className="relative w-full min-h-[400px] h-[70vh]">
        <Image
          src="/background_matching.png"
          alt="宇宙のイラスト"
          fill
          className="object-cover object-top"
          sizes="(max-w-md) 100vw"
          priority
        />
      </div>

      <div className="bg-white  mt-[-40px] relative flex-grow flex flex-col items-center p-10">
        <h1 className="text-xl font-black text-[#27214D] mb-4 text-center leading-tight">
          友達を探す旅に出かけよう！
        </h1>
        <p className="text-[#27214D] text-lg font-medium mb-12 text-center">
          Let&apos;s embark on a journey to find friends!
        </p>
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* 外側の回転するリング */}
          <div className="absolute inset-0 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>

          {/* 真ん中のどっしりしたオレンジの丸 */}
          <div className="w-24 h-24 bg-orange-400 rounded-full shadow-lg shadow-orange-200"></div>
        </div>

        {/* ステータスの文字（今は仮で） */}
        <p className="mt-8 text-gray-400 font-bold tracking-widest animate-pulse">
          MATCHING...
        </p>
      </div>
    </main>
  )
}
