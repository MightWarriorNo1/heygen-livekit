import React from "react";

import { useVoiceChat } from "../logic/useVoiceChat";
import { useInterrupt } from "../logic/useInterrupt";

import { AudioInput } from "./AudioInput";

export const AvatarControls: React.FC = () => {
  const {
    isVoiceChatLoading,
    isVoiceChatActive,
    startVoiceChat,
    stopVoiceChat,
  } = useVoiceChat();
  const { interrupt } = useInterrupt();

  return (
    <div className="flex flex-col gap-4 items-center bg-black bg-opacity-75 rounded-lg p-4 backdrop-blur-sm">
      {/* Voice chat toggle */}
      <div className="flex items-center gap-3">
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isVoiceChatActive
              ? "bg-blue-600 text-white"
              : "bg-gray-600 text-gray-300 hover:bg-gray-500"
          } ${isVoiceChatLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => {
            if (isVoiceChatActive) {
              stopVoiceChat();
            } else {
              startVoiceChat();
            }
          }}
          disabled={isVoiceChatLoading}
        >
          {isVoiceChatLoading ? "Starting..." : isVoiceChatActive ? "Stop Voice" : "Start Voice"}
        </button>
        
        <button
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all"
          onClick={interrupt}
        >
          Interrupt
        </button>
      </div>
      
      {/* Audio input controls */}
      {isVoiceChatActive && <AudioInput />}
    </div>
  );
};
