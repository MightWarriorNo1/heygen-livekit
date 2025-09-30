import React from "react";

import { useVoiceChat } from "../logic/useVoiceChat";
import { useInterrupt } from "../logic/useInterrupt";
import { useStreamingAvatarSession } from "../logic/useStreamingAvatarSession";
import { StreamingAvatarSessionState } from "../logic";

import { AudioInput } from "./AudioInput";
import { MicIcon, StopIcon, PaperClipIcon, CameraIcon } from "../Icons";

export const AvatarControls: React.FC = () => {
  const {
    isVoiceChatLoading,
    isVoiceChatActive,
    startVoiceChat,
    stopVoiceChat,
  } = useVoiceChat();
  const { interrupt } = useInterrupt();
  const { sessionState } = useStreamingAvatarSession();

  const isConnected = sessionState === StreamingAvatarSessionState.CONNECTED;

  // Don't show any controls while avatar is loading
  if (!isConnected) {
    return null;
  }

  // Show Start Chat button when connected but voice chat not active
  if (!isVoiceChatActive) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Start Chat button positioned around avatar's hands area */}
        <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <button
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-lg font-medium transition-all ${
              isVoiceChatLoading
                ? "bg-gray-600 text-gray-300 cursor-not-allowed opacity-50"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
            }`}
            onClick={() => startVoiceChat()}
            disabled={isVoiceChatLoading}
          >
            <MicIcon size={20} />
            {isVoiceChatLoading ? "Starting..." : "Start Chat"}
          </button>
        </div>
      </div>
    );
  }

  // Show 3 buttons when voice chat is active
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Stop button below hands - smaller, less obvious */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all opacity-80 hover:opacity-100"
          onClick={stopVoiceChat}
        >
          <StopIcon size={16} />
          Stop Chat
        </button>
      </div>

      {/* Paper clip and camera buttons above hands */}
      <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 flex gap-4 pointer-events-auto">
        <button
          className="flex items-center justify-center w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-all shadow-lg hover:shadow-xl"
          onClick={() => {
            // TODO: Implement file attachment functionality
            console.log("Paper clip clicked");
          }}
          title="Attach file"
        >
          <PaperClipIcon size={20} />
        </button>
        
        <button
          className="flex items-center justify-center w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-all shadow-lg hover:shadow-xl"
          onClick={() => {
            // TODO: Implement camera functionality
            console.log("Camera clicked");
          }}
          title="Take photo"
        >
          <CameraIcon size={20} />
        </button>
      </div>

      {/* Audio input controls */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <AudioInput />
      </div>
    </div>
  );
};
