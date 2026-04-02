"use client";

import { LocalUser, RemoteUser } from "agora-rtc-react";
import { useAgoraCall } from "@/features/call/hooks/useAgoraCall";

export default function VideoGrid() {
  // 1. useAgoraCallから値を取り出す
  const {
    localMicrophoneTrack,
    localCameraTrack,
    remoteUsers,
    micOn,
    cameraOn,
  } = useAgoraCall("test-channel");

  return (
    <div>
      {/* 2. ユーザーの映像 */}
      <LocalUser
        audioTrack={localMicrophoneTrack}
        cameraOn={cameraOn}
        micOn={micOn}
        videoTrack={localCameraTrack}
      />

      {/* 3. 相手ユーザーの映像 */}
      {remoteUsers.map((user) => (
        <RemoteUser key={user.uid} user={user} />
      ))}
    </div>
  );
}
