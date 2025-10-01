import OpenAI from "openai";

// Initialize xAI client
const xaiClient = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

export interface XAIResponse {
  content: string;
  role: string;
}

export class XAIService {
  private static instance: XAIService;
  private conversationHistory: Array<{ role: string; content: string }> = [];

  private constructor() {}

  public static getInstance(): XAIService {
    if (!XAIService.instance) {
      XAIService.instance = new XAIService();
    }
    return XAIService.instance;
  }

  public async generateResponse(userMessage: string): Promise<string> {
    try {
      // Add user message to conversation history
      this.conversationHistory.push({
        role: "user",
        content: userMessage,
      });

      // Prepare messages for xAI
      const messages = [
        {
          role: "system",
          content: "You are Grok, a helpful and witty AI assistant. You are having a voice conversation with a user. Keep your responses conversational, concise, and engaging. Respond as if you're talking directly to them.",
        },
        ...this.conversationHistory,
      ];

      const completion = await xaiClient.chat.completions.create({
        model: "grok-beta",
        messages: messages as any,
        max_tokens: 150,
        temperature: 0.7,
        stream: false,
      });

      const response = completion.choices[0]?.message?.content || "I'm sorry, I didn't understand that.";
      
      // Add AI response to conversation history
      this.conversationHistory.push({
        role: "assistant",
        content: response,
      });

      // Keep only last 10 exchanges to manage context length
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      return response;
    } catch (error) {
      console.error("Error generating xAI response:", error);
      return "I'm sorry, I'm having trouble processing your request right now.";
    }
  }

  public async generateStreamingResponse(
    userMessage: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      // Add user message to conversation history
      this.conversationHistory.push({
        role: "user",
        content: userMessage,
      });

      // Prepare messages for xAI
      const messages = [
        {
          role: "system",
          content: "You are Grok, a helpful and witty AI assistant. You are having a voice conversation with a user. Keep your responses conversational, concise, and engaging. Respond as if you're talking directly to them.",
        },
        ...this.conversationHistory,
      ];

      const stream = await xaiClient.chat.completions.create({
        model: "grok-beta",
        messages: messages as any,
        max_tokens: 150,
        temperature: 0.7,
        stream: true,
      });

      let fullResponse = "";
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          onChunk(content);
        }
      }

      // Add AI response to conversation history
      this.conversationHistory.push({
        role: "assistant",
        content: fullResponse,
      });

      // Keep only last 10 exchanges to manage context length
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }
    } catch (error) {
      console.error("Error generating streaming xAI response:", error);
      onChunk("I'm sorry, I'm having trouble processing your request right now.");
    }
  }

  public clearHistory(): void {
    this.conversationHistory = [];
  }

  public getHistory(): Array<{ role: string; content: string }> {
    return [...this.conversationHistory];
  }
}
