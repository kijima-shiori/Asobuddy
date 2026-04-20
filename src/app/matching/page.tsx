'use client'

import Image from 'next/image'
import { useEffect, useState, useRef, Suspense } from 'react'
import {
  cancelSession,
  createSession,
} from '@/features/matching/services/matchService'
import { useHeartbeat } from '@/features/matching/hooks/useHeartbeat'
import { useMatchRealtime } from '@/features/matching/hooks/useMatchRealtime'
import { useRouter } from 'next/navigation'
import { Session } from '@/types'
import { useSearchParams } from 'next/navigation'

function MatchingInner() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('childId')
  const isStarted = useRef(false)
  const router = useRouter()

  //   マッチング結果を保存する
  const [matchResult, setMatchResult] = useState<Session | null>(null)

  useHeartbeat(matchResult?.id)
  useMatchRealtime(matchResult?.id, userId)

  useEffect(() => {
    // 子供のidが取得できなかったら何もしないで終わる
    if (!userId) return

    // 2重実行禁止-----------------
    if (isStarted.current) return
    isStarted.current = true

    // createSessionを実行-------------------
    const startMatching = async () => {
      try {
        const session = await createSession(userId)
        console.log('作成されたセッションID:', session.id)

        // setMatchResultで結果を書き込む前にマッチングしたら追い出す
        // 書き込みを先にすると、matchedしてもwaiting状態で残ってしまう
        if (session.status === 'matched') {
          console.log('マッチングしたよ！お友達を紹介します')
          router.push(
            `/matching/success?session_id=${session.id}&userId=${userId}`,
          )
          return
        }

        // マッチング結果を書き込む
        setMatchResult(session)

        console.log('セッションの状態:', session.status)
      } catch (error) {
        console.error('失敗しました:', error)
      }
    }
    startMatching()
  }, [userId])

  // タブを閉じた子をキャンセルに変更する処理--------------------
  useEffect(() => {
    const handleTabClose = () => {
      if (matchResult?.id && matchResult.status === 'waiting') {
        cancelSession(matchResult.id)
      }
    }
    // ここにタブを閉じた時の条件が入ってる。
    // beforeunload: ブラウザの特別なイベント名「タブを閉じようとした瞬間」 または 「別のページに移動しようとした瞬間」
    window.addEventListener('beforeunload', handleTabClose)
    return () => {
      window.removeEventListener('beforeunload', handleTabClose)
    }
  }, [matchResult])

  if (!userId)
    return (
      <div className="p-10 text-center">Loading...またはIDが見つかりません</div>
    )

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

        {/* ステータスの文字 */}
        <p className="mt-8 text-gray-400 font-bold tracking-widest animate-pulse">
          MATCHING...
        </p>
      </div>
    </main>
  )
}

export default function MatchingPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <MatchingInner />
    </Suspense>
  )
}
