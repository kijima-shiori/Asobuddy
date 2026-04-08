'use client'

import {
  useJoin,
  useLocalMicrophoneTrack, //マイクの音声を準備する
  useLocalCameraTrack, //カメラの映像を準備する
  usePublish, // 準備した映像・音声を相手に送る
  useRemoteUsers, // 相手の一覧を取得する
} from "agora-rtc-react";
import { useState, useEffect} from "react";
import { supabase } from "@/lib/supabase";

export function useAgoraCall(channelName: string, sessionId: string) {
// 状態管理
const [token, setToken] = useState("")
const [ready, setReady] = useState(false)
const [micOn, setMicOn] = useState(true)
const [cameraOn, setCameraOn] = useState(true)
const [uid, setUid] = useState<number | null>(null) 

  // SupabaseからユーザーIDを取得
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user){ 
        // UUIDから一意の数値を生成（Agora用の変換）
        const numericUid = parseInt(user.id.replace(/-/g, '').slice(0, 8), 16)
        setUid(numericUid) // 文字列にせず数値のままセット
        }
      }
      getUser()
    }, [])

// デバッグ用
  useEffect(() => {
    console.log("token:", token)
    console.log("ready:", ready)
    console.log("uid:", uid)
  }, [token, ready, uid])

// トークン取得（uidが取得できてから実行）
// TODO ★token取得時のエラーハンドリング追加★
useEffect(() => {
  if (uid === null) return

    const fetchToken = async () => {
        const response = await fetch("/api/calls/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 数値として送る
        body: JSON.stringify({ channelName: channelName, uid: uid })
    })
    const data = await response.json()
    setToken(data.token)
    setReady(true)
}
fetchToken()
}, [channelName, uid])

// 通話開始APIを呼び出す
useEffect(() => {
  if (!ready || !sessionId) return

  fetch("/api/calls/start", {
    method: "POST",
    headers: { "Content-Type": "application/json "},
    body: JSON.stringify({ sessionId })
  })
}, [ready, sessionId])

// カメラ・マイクを管理
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn)
  const { localCameraTrack } = useLocalCameraTrack(cameraOn)
  const remoteUsers = useRemoteUsers()

  // 映像・音声を送る
  usePublish([localMicrophoneTrack, localCameraTrack].filter(Boolean))

// チャンネルに入室
const shouldJoin = ready && !!token && !!uid

useJoin({
  appid: process.env.NEXT_PUBLIC_AGORA_APP_ID!,
  channel: channelName,
  token: token,
  uid: uid!,
}, shouldJoin)

  return {
    localMicrophoneTrack,
    localCameraTrack,
    remoteUsers,
    micOn,
    setMicOn,
    cameraOn,
    setCameraOn,
  }
}
