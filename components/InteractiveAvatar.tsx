import {
  AvatarQuality,
  StreamingEvents,
  VoiceChatTransport,
  VoiceEmotion,
  StartAvatarRequest,
  STTProvider,
  ElevenLabsModel,
} from "@heygen/streaming-avatar";
import { useEffect, useRef, useState, useMemo } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";

import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { AvatarControls } from "./AvatarSession/AvatarControls";
import { useVoiceChat } from "./logic/useVoiceChat";
import { useXAIVoiceChat } from "./logic/useXAIVoiceChat";
import { StreamingAvatarProvider, StreamingAvatarSessionState } from "./logic";
import { LoadingIcon } from "./Icons";

import { AVATARS } from "@/app/lib/constants";

interface InteractiveAvatarProps {
  avatarId?: string;
  voiceId?: string;
}

function InteractiveAvatar({ avatarId, voiceId }: InteractiveAvatarProps) {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } =
    useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();
  const { 
    useXAI, 
    setUseXAI, 
    handleUserTalkingMessageWithXAI, 
    handleEndMessageWithXAI,
    clearConversationHistory 
  } = useXAIVoiceChat();

  // Dynamic config based on xAI state
  const config = useMemo(() => ({
    quality: AvatarQuality.Low,
    avatarName: avatarId || AVATARS[0].avatar_id,
    knowledgeId: undefined, // This disables HeyGen's built-in brain
    voice: {
      rate: 1.5,
      emotion: VoiceEmotion.EXCITED,
      model: voiceId ? voiceId as ElevenLabsModel : ElevenLabsModel.eleven_flash_v2_5,
    },
    language: "en",
    voiceChatTransport: VoiceChatTransport.WEBSOCKET,
    sttSettings: {
      provider: STTProvider.DEEPGRAM,
    },
  }), [avatarId, voiceId, useXAI]);

  const mediaStream = useRef<HTMLVideoElement>(null);

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();

      console.log("Access Token:", token); // Log the token to verify

      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  const startVoiceSession = useMemoizedFn(async () => {
    try {
      const newToken = await fetchAccessToken();
      const avatar = initAvatar(newToken);

      avatar.on(StreamingEvents.STREAM_READY, (event) => {
        console.log("Stream ready - Avatar connected");
      });
      avatar.on(StreamingEvents.USER_END_MESSAGE, (event) => {
        if (useXAI) {
          // Only process with xAI, don't let HeyGen respond
          handleEndMessageWithXAI();
        }
        // If xAI is disabled, let HeyGen handle it normally
      });
      avatar.on(StreamingEvents.USER_TALKING_MESSAGE, (event) => {
        if (useXAI) {
          // Only process with xAI, don't let HeyGen respond
          handleUserTalkingMessageWithXAI(event);
        }
        // If xAI is disabled, let HeyGen handle it normally
      });
      avatar.on(StreamingEvents.AVATAR_START_TALKING, (event) => {
        // Only interrupt if this is a HeyGen automatic response, not our xAI response
        if (useXAI) {
          // Check if this is a HeyGen response by looking at the event details
          // We only want to interrupt HeyGen's automatic responses, not our xAI responses
          console.log("xAI: Avatar started talking - checking if this is HeyGen response");
          // Don't interrupt immediately - let our xAI response play
        }
      });

      await startAvatar(config);
      await startVoiceChat();
    } catch (error) {
      console.error("Error starting avatar session:", error);
    }
  });

  useUnmount(() => {
    stopAvatar();
  });

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
      };
    }
  }, [mediaStream, stream]);

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Full-screen avatar video */}
      <div className="absolute inset-0 w-full h-full">
        {sessionState !== StreamingAvatarSessionState.INACTIVE ? (
          <AvatarVideo ref={mediaStream} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black">
            <div className="text-white text-center">
              <div className="mb-4 flex justify-center">
                <LoadingIcon />
              </div>
              {/* <p className="text-lg mb-4">Ready...</p> */}
              <button
                onClick={startVoiceSession}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Start Avatar
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Controls overlay */}
      {sessionState === StreamingAvatarSessionState.CONNECTED && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <AvatarControls />
        </div>
      )}
    </div>
  );
}

export default function InteractiveAvatarWrapper({ avatarId, voiceId }: InteractiveAvatarProps) {
  return (
    <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
      <InteractiveAvatar avatarId={avatarId} voiceId={voiceId} />
    </StreamingAvatarProvider>
  );
}
