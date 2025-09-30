"use client";

import InteractiveAvatar from "@/components/InteractiveAvatar";

interface VoiceChatAppProps {
  avatarId?: string;
  voiceId?: string;
}

export default function VoiceChatApp({ avatarId, voiceId }: VoiceChatAppProps) {
  return (
    <div className="w-screen h-screen flex flex-col bg-black">
      <InteractiveAvatar avatarId={avatarId} voiceId={voiceId} />
    </div>
  );
}
