import React from "react";

import { useInterrupt } from "../logic/useInterrupt";
import { useStreamingAvatarContext } from "../logic/context";

import { PaperClipIcon, CameraIcon } from "../Icons";

export const AvatarControls: React.FC = () => {
  const { interrupt } = useInterrupt();
  const { useXAI, setUseXAI } = useStreamingAvatarContext();

  const handlePaperClip = () => {
    // TODO: Implement file attachment functionality
    console.log("Paper clip clicked - file attachment");
  };

  const handleCamera = () => {
    // TODO: Implement camera functionality
    console.log("Camera clicked - camera functionality");
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      {/* Top row - Paper clip and Camera buttons (above avatar's hands) */}
      <div className="flex items-center gap-4">
        <button
          className="w-12 h-12 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl"
          onClick={handlePaperClip}
          title="Attach file"
        >
          <PaperClipIcon size={20} />
        </button>
        
        <button
          className="w-12 h-12 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl"
          onClick={handleCamera}
          title="Camera"
        >
          <CameraIcon size={20} />
        </button>
      </div>

      {/* xAI Toggle */}
      <div className="flex items-center gap-2 bg-white bg-opacity-90 rounded-lg px-3 py-2">
        <span className="text-sm font-medium text-gray-700">xAI</span>
        <button
          className={`w-12 h-6 rounded-full transition-all ${
            useXAI ? 'bg-blue-600' : 'bg-gray-300'
          }`}
          onClick={() => setUseXAI(!useXAI)}
          title={useXAI ? "Disable xAI" : "Enable xAI"}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full transition-transform ${
              useXAI ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Bottom row - Stop button (under avatar's hands, same functionality as interrupt) */}
      <button
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all"
        onClick={interrupt}
        title="Stop/Interrupt"
      >
        Stop
      </button>
      
    </div>
  );
};
