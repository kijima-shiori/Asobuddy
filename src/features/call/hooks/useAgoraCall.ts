'use client'

import {
  useJoin,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  usePublish,
  useRemoteUsers,
} from "agora-rtc-react";
import { useState, useEffect } from "react";

export function useAgoraCall(channelName: string, sessionId: string, myChildId: string) {
  const [token, setToken] = useState("")
  const [ready, setReady] = useState(false)
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [uid, setUid] = useState<number | null>(null)
  const [childUuid, setChildUuid] = useState<string | null>(null)

  // myChildIdから数値UIDを生成（Agora用）＋UUIDも保持（DB用）
  useEffect(() => {
    if (!myChildId) return
    const numericUid = parseInt(myChildId.replace(/-/g, '').slice(0, 8), 16)
    setUid(numericUid)
    setChildUuid(myChildId)
  }, [myChildId])

  // デバッグ用
  useEffect(() => {
    console.log("token:", token)
    console.log("ready:", ready)
    console.log("uid:", uid)
    console.log("childUuid:", childUuid)
  }, [token, ready, uid, childUuid])

  // トークン取得（uidが取得できてから実行）
  useEffect(() => {
    if (uid === null) return

    const fetchToken = async () => {
      try {
        const response = await fetch("/api/calls/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channelName: channelName, uid: uid })
        })
        if (!response.ok) throw new Error("Token API failed")
        const data = await response.json()
        setToken(data.token)
        setReady(true)
      } catch (e) {
        console.error("Failed to fetch token:", e)
        alert("通話に必要なトークンの取得に失敗しました。再読み込みしてください。")
      }
    }
    fetchToken()
  }, [channelName, uid])

  // 通話開始APIを呼び出す
  useEffect(() => {
    if (!ready || !sessionId) return
    fetch("/api/calls/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, childUuid })
    })
  }, [ready, sessionId])

  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn)
  const { localCameraTrack } = useLocalCameraTrack(cameraOn)
  const remoteUsers = useRemoteUsers()

  usePublish([localMicrophoneTrack, localCameraTrack].filter(Boolean))

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
