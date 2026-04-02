"use client";

import { useState } from "react";
import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react";
import AiHintPanel from "@/features/call/components/AiHintPanel";
import VideoGrid from "@/features/call/components/VideoGrid";
import CallTimer from "@/features/call/components/CallTimer";
import CallControls from "@/features/call/components/CallControls";
import CallEndScreen from "@/features/call/components/CallEndScreen";

export default function Callpage() {
  const [callEnded, setCallEnded] = useState(false);
  return (
    <AgoraRTCProvider client={client}>
      <div>
        <AiHintPanel />
        <VideoGrid />
        <CallTimer />
        <CallControls />
        {callEnded && <CallEndScreen />}
      </div>
    </AgoraRTCProvider>
  );
}
