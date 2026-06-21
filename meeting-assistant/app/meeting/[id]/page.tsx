/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import StreamProvider from "@/app/components/stream-provider";
import { StreamTheme } from "@stream-io/video-react-sdk";
import MeetingRoom from "@/app/components/meeting-room";

interface UseCall {
  id: string;
  name: string;
}

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const callId = params.id;
  const name = searchParams.get("name") || "anonymous";

  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiam9obiIsInZhbGlkaXR5X2luX3NlY29uZHMiOjg2NDAwLCJpYXQiOjE3ODE4MDAxNDgsImV4cCI6MTc4MTg4NjU0OH0.sNOSgJ-MQkCO3ezcNKikYF_tB0RvIQChOisRhsB5jDU');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUser({
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
    });
  }, [name]);

  useEffect(() => {
    if (!user) return;

    fetch("/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          console.log("Token from Next.js", data.token);
          setToken(data.token);
        }
        else setError("No token returned");
      })
      .catch((err) => setError(err.message));
  }, [user]);

  const handleLeave = () => {
    router.push("/");
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="p-6 bg-red-900/20 border border-red-500 rounded-lg">
          <p className="text-red-500 font-bold text-lg mb-2">Error</p>
          <p>{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Connecting…</p>
        </div>
      </div>
    );
  }



  return (
    <StreamProvider user={user} token={token}>
      <StreamTheme>
        <MeetingRoom callId={callId} onLeave={handleLeave} userId={user.id} />
      </StreamTheme>
    </StreamProvider>
  );
}