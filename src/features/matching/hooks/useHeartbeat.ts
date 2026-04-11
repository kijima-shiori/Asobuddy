import { useEffect } from 'react'
import { sendHeartbeat } from '../services/matchService'

export const useHeartbeat = (sessionId: string | undefined) => {
  useEffect(() => {
    // sessionId が「存在しない」とき、または「空文字」のときは絶対に何もしない
    if (!sessionId) {
      console.log('IDがないのでタイマーは作らない')
      return
    }

    sendHeartbeat(sessionId)

    console.log('タイマーを開始 ID:', sessionId)
    const interval = setInterval(() => {
      console.log('★★★自分が送信している待機状態', sessionId)
      sendHeartbeat(sessionId)
    }, 3000)

    return () => {
      console.log('待機終了（タイマー解除）ID', sessionId)
      clearInterval(interval)
    }
  }, [sessionId]) //sessionIdが決まったらこの中身が動き出す
}
