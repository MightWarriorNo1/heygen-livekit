import React from "react";

import { useInterrupt } from "../logic/useInterrupt";

import { PaperClipIcon, CameraIcon } from "../Icons";

export const AvatarControls: React.FC = () => {
  const { interrupt } = useInterrupt();

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
