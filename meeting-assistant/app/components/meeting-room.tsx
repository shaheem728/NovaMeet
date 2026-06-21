"use client"
import {
  Call,
  StreamCall,
  useStreamVideoClient,
  SpeakerLayout,
  CallControls,
  StreamTheme,
} from "@stream-io/video-react-sdk";

// import { TranscriptPanel } from "@/app/components/transcript";

import "@stream-io/video-react-sdk/dist/css/styles.css";

import React, { useEffect, useRef, useState } from 'react'

const MeetingRoom = ({ callId, onLeave, userId }: { callId: any, onLeave: () => void, userId: string }) => {
  const client = useStreamVideoClient();
  const [call, setCall] = useState<Call | null>(null);
  const [error, setError] = useState<string | null>(null);

  const joinedRef = useRef(false)
  const leavingRef = useRef(false)

  const callType = "default";

  useEffect(() => {
    if (!client) return;
    if (joinedRef.current) return;

    joinedRef.current = true;

    const init = async () => {
      try {
        const myCall = client.call(callType, callId);

        await myCall.getOrCreate({
          data: { members: [{ user_id: userId, role: "call_member" }], },
        });
        await myCall.join();

        await myCall.startClosedCaptions({ language: "en" });

        myCall.on("call.session_ended", () => {
          console.log("Session ended");
          onLeave?.();
        });

        setCall(myCall);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      }
    };

    init();

    return () => {
      if (call && !leavingRef.current) {
        leavingRef.current = true;
        call.stopClosedCaptions().catch(() => { });
        call.leave().catch(() => { });
      }
    };
  }, [client, callId, callType]);

  const handleLeaveClick = async () => {
    if (leavingRef.current) {
      onLeave?.();
      return;
    }

    leavingRef.current = true;

    try {
      if (call) {
        await call.stopClosedCaptions().catch(() => { });
        await call.leave().catch(() => { });
      }
    } catch (err) {
      console.error("Error leaving call:", err);
    } finally {
      onLeave?.();
    }
  };

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <p>Error: {error}</p>
      </div>
    );

  if (!call)
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-t-4 border-blue-500 mx-auto rounded-full" />
          <p className="mt-4 text-lg">Loading meeting…</p>
        </div>
      </div>
    );


  return (
    <StreamCall call={call}>
      <StreamTheme>
        <div className="flex h-screen text-white">
          {/* Main Content: Speaker Layout + Controls + Transcript */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* 1. Speaker Layout (Main Area) */}
            <div className="flex-1 flex items-center justify-center bg-black min-h-[400px]">
              <SpeakerLayout />
            </div>

            {/* 2. Controls */}
            <div className="p-4 bg-[#1c1e22] border-t border-gray-700 flex justify-center">
              <CallControls />
            </div>
          </div>

          {/* 3. Transcript Panel (Sidebar) */}
          {/* NOTE: This requires TranscriptPanel to be correctly implemented and imported */}
          <div className="w-96 border-l border-gray-700 bg-[#1c1e22]">
            {/* <TranscriptPanel /> */}
          </div>
        </div>
      </StreamTheme>
    </StreamCall>
  )
}

export default MeetingRoom