'use client'
import AgoraRTC, {
  AgoraRTCProvider,
  LocalUser,
  RemoteUser,
  useVolumeLevel,
} from 'agora-rtc-react'
import { useAgoraCall } from '@/features/call/hooks/useAgoraCall'
import { useEffect, useRef } from 'react'

const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })

function VideoGridInner({
  sessionId,
  myChildId,
  onVoiceDetected,
}: {
  sessionId: string
  myChildId: string
  onVoiceDetected: () => void
}) {
  const {
    localMicrophoneTrack,
    localCameraTrack,
    remoteUsers,
    micOn,
    cameraOn,
  } = useAgoraCall(sessionId, sessionId, myChildId)

  // 自分の音量を監視
  const volumeLevel = useVolumeLevel(localMicrophoneTrack ?? undefined)

  // 話し始めた瞬間だけresetSilenceTimerを呼ぶ
  const isSpeakingRef = useRef(false)

  useEffect(() => {
    if (volumeLevel > 0.05) {
      if (!isSpeakingRef.current) {
        onVoiceDetected() // 話し始めに1回だけ呼ぶ
        isSpeakingRef.current = true
      }
    } else {
      isSpeakingRef.current = false // 静かになったらフラグを戻す
    }
  }, [volumeLevel, onVoiceDetected])

  return (
    <div className="flex flex-col gap-4 p-4 h-full w-full">
      {/* 相手の映像：メインで大きく表示 */}
      <div className="relative flex-1 bg-slate-900 rounded-3xl overflow-hidden shadow-xl border-4 border-orange-200 min-h-[300px]">
        {remoteUsers.length > 0 ? (
          remoteUsers.map((user) => (
            <RemoteUser
              key={user.uid}
              user={user}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-white flex-col gap-2">
            <span className="text-4xl animate-pulse">🌍</span>
            <p>おともだちを待っているよ...</p>
          </div>
        )}
        <div className="absolute top-4 left-4 bg-white/90 px-4 py-1 rounded-full text-sm font-bold text-orange-600 shadow-sm">
          おともだち
        </div>
      </div>
      {/* 自分の映像：少し小さめに表示 */}
      <div className="relative h-48 bg-slate-800 rounded-2xl overflow-hidden shadow-lg border-4 border-blue-200 self-end w-full md:w-1/3">
        <LocalUser
          audioTrack={localMicrophoneTrack}
          cameraOn={cameraOn}
          micOn={micOn}
          videoTrack={localCameraTrack}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div className="absolute top-2 left-2 bg-white/90 px-3 py-0.5 rounded-full text-xs font-bold text-blue-600 shadow-sm">
          じぶん
        </div>
      </div>
    </div>
  )
}

export default function VideoGrid({
  sessionId,
  myChildId,
  onVoiceDetected,
}: {
  sessionId: string
  myChildId: string
  onVoiceDetected: () => void
}) {
  return (
    <AgoraRTCProvider client={client}>
      <VideoGridInner
        sessionId={sessionId}
        myChildId={myChildId}
        onVoiceDetected={onVoiceDetected}
      />
    </AgoraRTCProvider>
  )
}
