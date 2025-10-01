import { useCallback, useEffect, useRef } from "react";
import { useStreamingAvatarContext } from "./context";
import { useTextChat } from "./useTextChat";

export const useXAIVoiceChat = () => {
  const { 
    messages, 
    useXAI, 
    setUseXAI, 
    currentUserMessage, 
    setCurrentUserMessage,
    handleUserTalkingMessage,
    handleEndMessage
  } = useStreamingAvatarContext();
  const { sendMessage, sendMessageSync } = useTextChat();
  const isProcessingRef = useRef(false);
  const currentUserMessageRef = useRef("");

  // Process user message with xAI when message ends
  const processUserMessageWithXAI = useCallback(
    async (userMessage: string) => {
      if (isProcessingRef.current || !userMessage.trim()) return;
      
      isProcessingRef.current = true;
      
      try {
        console.log("Processing user message with xAI:", userMessage);
        
        const response = await fetch("/api/xai-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
            stream: false,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get xAI response");
        }

        const data = await response.json();
        const aiResponse = data.content;

        console.log("xAI response:", aiResponse);

        // Send the xAI response to the avatar to speak
        if (aiResponse) {
          await sendMessageSync(aiResponse);
        }
      } catch (error) {
        console.error("Error processing message with xAI:", error);
        // Fallback response
        await sendMessageSync("Oops! My humor circuits are having a meltdown! Give me a moment to reboot my funny bone! 🤖💥");
      } finally {
        isProcessingRef.current = false;
      }
    },
    [sendMessageSync]
  );

  // Custom message handlers that integrate with xAI
  const handleUserTalkingMessageWithXAI = useCallback(
    ({ detail }: { detail: any }) => {
      // Accumulate user message
      currentUserMessageRef.current += detail.message;
      
      // Call the original handler for UI updates
      handleUserTalkingMessage({ detail });
    },
    [handleUserTalkingMessage]
  );

  const handleEndMessageWithXAI = useCallback(
    () => {
      // Process the complete user message with xAI
      const completeMessage = currentUserMessageRef.current.trim();
      if (completeMessage && useXAI) {
        processUserMessageWithXAI(completeMessage);
      }
      
      // Reset the accumulated message
      currentUserMessageRef.current = "";
      
      // Call the original handler
      handleEndMessage();
    },
    [handleEndMessage, processUserMessageWithXAI, useXAI]
  );

  // Clear conversation history
  const clearConversationHistory = useCallback(async () => {
    try {
      await fetch("/api/xai-chat", {
        method: "DELETE",
      });
      console.log("Conversation history cleared");
    } catch (error) {
      console.error("Error clearing conversation history:", error);
    }
  }, []);

  return {
    useXAI,
    setUseXAI,
    handleUserTalkingMessageWithXAI,
    handleEndMessageWithXAI,
    clearConversationHistory,
    isProcessing: isProcessingRef.current,
  };
};
