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
      console.log("User talking message:", detail.message);
      
      // Call the original handler for UI updates (this accumulates the message)
      handleUserTalkingMessage({ detail });
    },
    [handleUserTalkingMessage]
  );

  const handleEndMessageWithXAI = useCallback(
    () => {
      // Get the last user message from the messages array
      const lastUserMessage = messages.findLast(msg => msg.sender === "CLIENT");
      const completeMessage = lastUserMessage?.content?.trim() || "";
      
      console.log("Complete user message for xAI:", completeMessage);
      
      if (completeMessage && useXAI) {
        console.log("Processing complete message with xAI...");
        processUserMessageWithXAI(completeMessage);
      } else {
        console.log("No message to process or xAI disabled");
      }
      
      // Call the original handler
      handleEndMessage();
    },
    [handleEndMessage, processUserMessageWithXAI, useXAI, messages]
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
