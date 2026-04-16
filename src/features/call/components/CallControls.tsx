'use client'

import { useRouter } from 'next/navigation'

// DB更新用にsessionIdを受け取る
interface Props {
  sessionId: string
}

export default function CallControls({ sessionId }: Props) {
  const router = useRouter()

  // 通話終了ボタンを押したときの処理
  const handleEndCall = async () => {
    // 「キャンセル」を押したらここで処理を止める
    const confirmEnd = window.confirm('本当におわる？')
    if (!confirmEnd) return

    try {
      // sessionsテーブルのended_atを現在時刻で更新する
      await fetch('/api/calls/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
    } catch (error) {
      // DB更新が失敗してもレポート画面には遷移させる
      console.error('終了処理に失敗:', error)
    } finally {
      router.push('/report')
    }
  }

  return (
    <div className="flex items-center justify-center w-full">
      <button
        onClick={handleEndCall}
        className="w-full py-4 bg-orange-400 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all"
      >
        通話をおわる
      </button>
    </div>
  )
}
