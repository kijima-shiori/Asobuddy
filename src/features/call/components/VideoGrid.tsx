'use client'

import AgoraRTC, {
  AgoraRTCProvider,
  LocalUser,
  RemoteUser,
} from 'agora-rtc-react'
import { useAgoraCall } from '@/features/call/hooks/useAgoraCall'

// clientをここで作る
const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })

function VideoGridInner() {
  const {
    localMicrophoneTrack,
    localCameraTrack,
    remoteUsers,
    micOn,
    cameraOn,
  } = useAgoraCall('test-channel')

  return (
    <div className="flex flex-col gap-4 p-4 h-full">
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

// AgoraRTCProviderで包んでexport
export default function VideoGrid() {
  return (
    <AgoraRTCProvider client={client}>
      <div className="w-full h-full">
        <VideoGridInner />
      </div>
    </AgoraRTCProvider>
  )
}
