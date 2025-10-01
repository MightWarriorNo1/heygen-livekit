import { useCallback, useRef } from "react";
import { useStreamingAvatarContext } from "./context";
import { useTextChat } from "./useTextChat";

export const useXAI = () => {
  const { messages } = useStreamingAvatarContext();
  const { sendMessage, sendMessageSync } = useTextChat();
  const isProcessingRef = useRef(false);

  const processUserMessage = useCallback(
    async (userMessage: string) => {
      if (isProcessingRef.current) return;
      
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
        await sendMessageSync("I'm sorry, I'm having trouble processing your request right now.");
      } finally {
        isProcessingRef.current = false;
      }
    },
    [sendMessageSync]
  );

  const processUserMessageStreaming = useCallback(
    async (userMessage: string) => {
      if (isProcessingRef.current) return;
      
      isProcessingRef.current = true;
      
      try {
        console.log("Processing user message with xAI (streaming):", userMessage);
        
        const response = await fetch("/api/xai-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
            stream: true,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get xAI response");
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let fullResponse = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content && !data.done) {
                  fullResponse += data.content;
                  // Send each chunk to the avatar as it arrives
                  await sendMessage(data.content);
                }
              } catch (e) {
                // Ignore parsing errors for incomplete chunks
              }
            }
          }
        }

        console.log("xAI streaming response complete:", fullResponse);
      } catch (error) {
        console.error("Error processing streaming message with xAI:", error);
        // Fallback response
        await sendMessageSync("I'm sorry, I'm having trouble processing your request right now.");
      } finally {
        isProcessingRef.current = false;
      }
    },
    [sendMessage, sendMessageSync]
  );

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
    processUserMessage,
    processUserMessageStreaming,
    clearConversationHistory,
    isProcessing: isProcessingRef.current,
  };
};
