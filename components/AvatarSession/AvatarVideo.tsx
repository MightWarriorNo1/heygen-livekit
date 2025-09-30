import React, { forwardRef } from "react";
import { ConnectionQuality } from "@heygen/streaming-avatar";

import { useConnectionQuality } from "../logic/useConnectionQuality";
import { useStreamingAvatarSession } from "../logic/useStreamingAvatarSession";
import { StreamingAvatarSessionState } from "../logic";
import { CloseIcon } from "../Icons";
import { Button } from "../Button";

export const AvatarVideo = forwardRef<HTMLVideoElement>(({}, ref) => {
  const { sessionState, stopAvatar } = useStreamingAvatarSession();
  const { connectionQuality } = useConnectionQuality();

  const isLoaded = sessionState === StreamingAvatarSessionState.CONNECTED;

  return (
    <div className="w-full h-full relative bg-black">
      {connectionQuality !== ConnectionQuality.UNKNOWN && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white rounded-lg px-3 py-2 text-sm z-20">
          Connection: {connectionQuality}
        </div>
      )}
      {isLoaded && (
        <button
          className="absolute top-4 right-4 p-2 bg-black bg-opacity-75 text-white rounded-lg hover:bg-opacity-90 z-20 transition-all"
          onClick={stopAvatar}
        >
          <CloseIcon />
        </button>
      )}
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={false}
        className="w-full h-full object-cover"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      {!isLoaded && (
        <div className="w-full h-full flex items-center justify-center absolute top-0 left-0 bg-black">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>Connecting to avatar...</p>
          </div>
        </div>
      )}
    </div>
  );
});
AvatarVideo.displayName = "AvatarVideo";
