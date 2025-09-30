"use client";

import InteractiveAvatar from "@/components/InteractiveAvatar";

interface VoiceChatAppProps {
  avatarId?: string;
  voiceId?: string;
  autoStartVoiceChat?: boolean;
}

export default function VoiceChatApp({ avatarId, voiceId, autoStartVoiceChat }: VoiceChatAppProps) {
  return (
    <div className="w-screen h-screen flex flex-col bg-black">
      <InteractiveAvatar avatarId={avatarId} voiceId={voiceId} autoStartVoiceChat={autoStartVoiceChat} />
    </div>
  );
}
