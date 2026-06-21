"use client";

import React from "react";

import { StreamVideo } from "@stream-io/video-react-sdk";
import { Chat } from "stream-chat-react";
import { useStreamClients } from "@/app/hooks/use-stream-clients";

interface StreamProviderProps {
  children: React.ReactNode;
  user: { id: string; name?: string; image?: string };
  token: string;
}


const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

export default function StreamProvider({ children, user, token }: StreamProviderProps) {
  console.log("User", user);
  console.log("Token", token);
  console.log("API Key", apiKey);
  const { videoClient, chatClient } = useStreamClients({ apiKey, user, token });
  console.log("Video Client", videoClient);
  console.log("Chat Client", chatClient);
  if (!videoClient || !chatClient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
          <p className="text-white text-xl font-semibold mt-6">Connecting...</p>
        </div>
      </div>
    );
  }

  return (
    <StreamVideo client={videoClient}>
      <Chat client={chatClient}>{children}</Chat>
    </StreamVideo>
  );
}