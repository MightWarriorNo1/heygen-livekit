import { TaskMode, TaskType } from "@heygen/streaming-avatar";
import { useCallback } from "react";

import { useStreamingAvatarContext } from "./context";

export const useTextChat = () => {
  const { avatarRef } = useStreamingAvatarContext();

  const sendMessage = useCallback(
    (message: string) => {
      if (!avatarRef.current) return;
      avatarRef.current.speak({
        text: message,
        taskType: TaskType.TALK,
        taskMode: TaskMode.ASYNC,
      });
    },
    [avatarRef],
  );

  const sendMessageSync = useCallback(
    async (message: string) => {
      console.log("sendMessageSync called with:", message);
      console.log("avatarRef.current:", avatarRef.current);
      
      if (!avatarRef.current) {
        console.error("Avatar ref is null - cannot speak");
        return;
      }

      try {
        console.log("Calling avatar.speak with:", { text: message, taskType: TaskType.TALK, taskMode: TaskMode.SYNC });
        const result = await avatarRef.current.speak({
          text: message,
          taskType: TaskType.TALK,
          taskMode: TaskMode.SYNC,
        });
        console.log("Avatar speak result:", result);
        return result;
      } catch (error) {
        console.error("Error calling avatar.speak:", error);
        throw error;
      }
    },
    [avatarRef],
  );

  const repeatMessage = useCallback(
    (message: string) => {
      if (!avatarRef.current) return;

      return avatarRef.current?.speak({
        text: message,
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.ASYNC,
      });
    },
    [avatarRef],
  );

  const repeatMessageSync = useCallback(
    async (message: string) => {
      if (!avatarRef.current) return;

      return await avatarRef.current?.speak({
        text: message,
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.SYNC,
      });
    },
    [avatarRef],
  );

  return {
    sendMessage,
    sendMessageSync,
    repeatMessage,
    repeatMessageSync,
  };
};
