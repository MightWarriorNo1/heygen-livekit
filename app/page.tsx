import VoiceChatApp from "@/components/VoiceChatApp";
import { config } from "./config";

export default function App() {
  return <VoiceChatApp avatarId={config.avatarId} voiceId={config.voiceId} />;
}