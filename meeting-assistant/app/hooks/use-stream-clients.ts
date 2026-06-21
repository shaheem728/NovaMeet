//create custome Hook
import { useState, useEffect } from "react";
import { StreamVideoClient } from "@stream-io/video-react-sdk";
import { StreamChat } from "stream-chat";

interface UseStreamClientsProps {
  apiKey: string;
  user: any;
  token: string | null;
}

export function useStreamClients({
  apiKey,
  user,
  token,
}: UseStreamClientsProps) {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(
    null
  );

  const [chatClient, setChatClient] = useState<StreamChat | null>(null);

  useEffect(() => {
    if (!user || !token || !apiKey) return;

    let isMounted = true;

    const initClients = async () => {
      try {
        // Video Client
        const tokenProvider = async () => token;

        const myVideoClient = new StreamVideoClient({
          apiKey,
          user,
          tokenProvider,
        });

        // Chat Client
        const myChatClient = StreamChat.getInstance(apiKey);

        if (!myChatClient.userID) {
          await myChatClient.connectUser(user, token);
        }

        if (isMounted) {
          setVideoClient(myVideoClient);
          setChatClient(myChatClient);
        }
      } catch (error) {
        console.error("Client initialization error:", error);
      }
    };

    initClients();

    return () => {
      isMounted = false;
  // Cleanup only in production
      if (videoClient) {
        videoClient.disconnectUser().catch(console.error);
      }
      if (chatClient) {
        chatClient.disconnectUser().catch(console.error);
      }
    };
  }, [apiKey, user, token]);

  return {
    videoClient,
    chatClient,
  };
}