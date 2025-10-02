import { useCallback, useEffect, useRef } from "react";
import { useStreamingAvatarContext } from "./context";
import { useTextChat } from "./useTextChat";
import { useVoiceChat } from "./useVoiceChat";

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
  const { muteInputAudio, unmuteInputAudio } = useVoiceChat();
  const isProcessingRef = useRef(false);
  const accumulatedMessageRef = useRef("");
  const isXAIRespondingRef = useRef(false);

  // Process user message with xAI when message ends
  const processUserMessageWithXAI = useCallback(
    async (userMessage: string) => {
      if (isProcessingRef.current || !userMessage.trim()) return;
      
      isProcessingRef.current = true;
      isXAIRespondingRef.current = true;
      
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
          // Mute microphone input to prevent feedback loop
          console.log("xAI: Muting microphone to prevent feedback loop");
          muteInputAudio();
          
          console.log("xAI: Sending response to avatar:", aiResponse);
          
          // Add a small delay to ensure avatar is ready
          await new Promise(resolve => setTimeout(resolve, 100));
          
          try {
            // Use async version to avoid conflicts with HeyGen's system
            console.log("xAI: Using async sendMessage to avoid conflicts");
            sendMessage(aiResponse);
            console.log("xAI: Async message sent successfully");
          } catch (error) {
            console.error("xAI: Error sending message to avatar:", error);
          }
        }
      } catch (error) {
        console.error("Error processing message with xAI:", error);
        // Fallback response with muting
        muteInputAudio();
        await sendMessageSync("Oops! My humor circuits are having a meltdown! Give me a moment to reboot my funny bone! 🤖💥");
      } finally {
        isProcessingRef.current = false;
        // Reset the xAI responding flag and unmute microphone after avatar finishes speaking
        setTimeout(() => {
          isXAIRespondingRef.current = false;
          unmuteInputAudio(); // Unmute microphone after avatar finishes speaking
          console.log("xAI: Re-enabled microphone, ready for new user input");
        }, 5000); // 5 second delay to ensure avatar finishes speaking
      }
    },
    [sendMessageSync, sendMessage, muteInputAudio, unmuteInputAudio]
  );

  // Custom message handlers that integrate with xAI
  const handleUserTalkingMessageWithXAI = useCallback(
    ({ detail }: { detail: any }) => {
      console.log("User talking message:", detail.message);
      console.log("xAI enabled:", useXAI);
      console.log("xAI responding:", isXAIRespondingRef.current);
      
      // Completely ignore all input while xAI is responding
      if (isXAIRespondingRef.current) {
        console.log("xAI: BLOCKING user input - xAI is currently responding");
        return; // Don't call the original handler at all
      }
      
      // Only process if we're not currently processing an xAI response
      if (!isProcessingRef.current) {
        // Accumulate the message ourselves
        accumulatedMessageRef.current += detail.message;
        console.log("Accumulated message:", accumulatedMessageRef.current);
      } else {
        console.log("Ignoring message - xAI is currently processing");
      }
      
      // Call the original handler for UI updates
      handleUserTalkingMessage({ detail });
    },
    [handleUserTalkingMessage, useXAI]
  );

  const handleEndMessageWithXAI = useCallback(
    () => {
      // Completely ignore if xAI is responding
      if (isXAIRespondingRef.current) {
        console.log("xAI: BLOCKING end message - xAI is currently responding");
        return; // Don't call the original handler at all
      }
      
      // Use our accumulated message
      const completeMessage = accumulatedMessageRef.current.trim();
      
      console.log("Complete user message for xAI:", completeMessage);
      console.log("useXAI enabled:", useXAI);
      console.log("Currently processing:", isProcessingRef.current);
      console.log("xAI responding:", isXAIRespondingRef.current);
      
      // Only process if we have a message, xAI is enabled, and we're not already processing
      if (completeMessage && useXAI && !isProcessingRef.current) {
        console.log("Processing complete message with xAI...");
        processUserMessageWithXAI(completeMessage);
      } else {
        console.log("No message to process, xAI disabled, or already processing");
      }
      
      // Reset the accumulated message
      accumulatedMessageRef.current = "";
      
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
