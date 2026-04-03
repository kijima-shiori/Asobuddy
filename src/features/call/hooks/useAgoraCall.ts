'use client'

import {
    useJoin,
  useLocalMicrophoneTrack, //マイクの音声を準備する
  useLocalCameraTrack, //カメラの映像を準備する
  usePublish, // 準備した映像・音声を相手に送る
  useRemoteUsers, // 相手の一覧を取得する
} from "agora-rtc-react";
import { useState, useEffect} from "react";

export function useAgoraCall(channelName: string) {
// 状態管理
const [token, setToken] = useState("")
const [ready, setReady] = useState(false)
const [micOn, setMicOn] = useState(true)
const [cameraOn, setCameraOn] = useState(true)

// デバッグ用
  useEffect(() => {
    console.log("token:", token)
    console.log("ready:", ready)
  }, [token, ready])

// トークン取得（ページが開いた時に実行）
useEffect(() => {
    const fetchToken = async () => {
        const response = await fetch("/api/calls/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelName: channelName, uid: 1 })
    })
    const { token } = await response.json()
    setToken(token)
    setReady(true)
}
fetchToken()
}, [channelName])

// カメラ・マイクを管理
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn)
  const { localCameraTrack } = useLocalCameraTrack(cameraOn)
  const remoteUsers = useRemoteUsers()

  // 映像・音声を送る
  usePublish([localMicrophoneTrack, localCameraTrack])

// チャンネルに入室
useJoin({
        appid:process.env.NEXT_PUBLIC_AGORA_APP_ID!,
        channel: channelName,
        token: token,
    }, ready && token !== "") // tokenが空じゃないときだけ実行する

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