import {
  AvatarQuality,
  StreamingEvents,
  VoiceChatTransport,
  VoiceEmotion,
  StartAvatarRequest,
  STTProvider,
  ElevenLabsModel,
} from "@heygen/streaming-avatar";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";

import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { AvatarControls } from "./AvatarSession/AvatarControls";
import { useVoiceChat } from "./logic/useVoiceChat";
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

  const [config] = useState<StartAvatarRequest>(() => ({
    quality: AvatarQuality.Low,
    avatarName: avatarId || AVATARS[0].avatar_id,
    knowledgeId: undefined,
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
  }));

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

      avatar.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
        console.log("Avatar started talking", e);
      });
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
        console.log("Avatar stopped talking", e);
      });
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log("Stream disconnected");
      });
      avatar.on(StreamingEvents.STREAM_READY, (event) => {
        console.log(">>>>> Stream ready:", event.detail);
      });
      avatar.on(StreamingEvents.USER_START, (event) => {
        console.log(">>>>> User started talking:", event);
      });
      avatar.on(StreamingEvents.USER_STOP, (event) => {
        console.log(">>>>> User stopped talking:", event);
      });
      avatar.on(StreamingEvents.USER_END_MESSAGE, (event) => {
        console.log(">>>>> User end message:", event);
      });
      avatar.on(StreamingEvents.USER_TALKING_MESSAGE, (event) => {
        console.log(">>>>> User talking message:", event);
      });
      avatar.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (event) => {
        console.log(">>>>> Avatar talking message:", event);
      });
      avatar.on(StreamingEvents.AVATAR_END_MESSAGE, (event) => {
        console.log(">>>>> Avatar end message:", event);
      });

      await startAvatar(config);
      // Automatically start voice chat after avatar is ready
      // Add a small delay to ensure the avatar stream is fully ready
      setTimeout(async () => {
        try {
          await startVoiceChat();
        } catch (voiceError) {
          console.log("Voice chat could not start automatically:", voiceError);
          // Voice chat will be available through the controls if needed
        }
      }, 1000);
    } catch (error) {
      console.error("Error starting avatar session:", error);
    }
  });


  useUnmount(() => {
    stopAvatar();
  });

  // Auto-start the avatar session when component mounts
  useEffect(() => {
    if (sessionState === StreamingAvatarSessionState.INACTIVE) {
      startVoiceSession();
    }
  }, [sessionState, startVoiceSession]);

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = async () => {
        try {
          await mediaStream.current!.play();
        } catch (error) {
          console.log("Autoplay prevented, user interaction required:", error);
          // The video will still be ready, just needs user interaction to play
        }
      };
    }
  }, [mediaStream, stream]);

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Full-screen avatar video */}
      <div className="absolute inset-0 w-full h-full">
        {sessionState === StreamingAvatarSessionState.INACTIVE ? (
          <div className="w-full h-full flex items-center justify-center bg-black">
            <div className="text-white text-center">
              <div className="mb-4">
                <LoadingIcon />
              </div>
              <p className="text-lg mb-4">Initializing avatar session...</p>
            </div>
          </div>
        ) : sessionState === StreamingAvatarSessionState.CONNECTING ? (
          <div className="w-full h-full flex items-center justify-center bg-black">
            <div className="text-white text-center">
              <div className="mb-4">
                <LoadingIcon />
              </div>
              <p className="text-lg mb-4">Connecting to avatar...</p>
            </div>
          </div>
        ) : (
          <AvatarVideo ref={mediaStream} />
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
