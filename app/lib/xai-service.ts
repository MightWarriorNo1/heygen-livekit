import OpenAI from "openai";

// Lazy initialization of xAI client
let xaiClient: OpenAI | null = null;

const getXaiClient = () => {
  if (!xaiClient) {
    if (!process.env.XAI_API_KEY) {
      throw new Error("XAI_API_KEY environment variable is not set");
    }
    xaiClient = new OpenAI({
      apiKey: process.env.XAI_API_KEY,
      baseURL: "https://api.x.ai/v1",
    });
  }
  return xaiClient;
};

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
      const client = getXaiClient();
      
      // Add user message to conversation history
      this.conversationHistory.push({
        role: "user",
        content: userMessage,
      });

      // Prepare messages for xAI
      const messages = [
        {
          role: "system",
          content: "You are Grok, a hilarious and friendly AI assistant with a great sense of humor! You're having a fun voice conversation with a user. Be witty, playful, and entertaining while still being helpful. Use humor, jokes, and friendly banter. Keep responses conversational and engaging - like talking to a funny friend who's also really smart. Be concise but make it fun!",
        },
        ...this.conversationHistory,
      ];

      const completion = await client.chat.completions.create({
        model: "grok-beta",
        messages: messages as any,
        max_tokens: 150,
        temperature: 0.9,
        stream: false,
      });

      const response = completion.choices[0]?.message?.content || "Oops! My circuits got a bit tangled there. Could you try that again? 😄";
      
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
      return "Well, this is awkward! My humor circuits are having a bit of a meltdown. Give me a moment to reboot my funny bone! 🤖💥";
    }
  }

  public async generateStreamingResponse(
    userMessage: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      const client = getXaiClient();
      
      // Add user message to conversation history
      this.conversationHistory.push({
        role: "user",
        content: userMessage,
      });

      // Prepare messages for xAI
      const messages = [
        {
          role: "system",
          content: "You are Grok, a hilarious and friendly AI assistant with a great sense of humor! You're having a fun voice conversation with a user. Be witty, playful, and entertaining while still being helpful. Use humor, jokes, and friendly banter. Keep responses conversational and engaging - like talking to a funny friend who's also really smart. Be concise but make it fun!",
        },
        ...this.conversationHistory,
      ];

      const stream = await client.chat.completions.create({
        model: "grok-beta",
        messages: messages as any,
        max_tokens: 150,
        temperature: 0.9,
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
      onChunk("Oops! My comedy routine just crashed harder than a Windows 95! Let me try to reboot my sense of humor! 🤖😂");
    }
  }

  public clearHistory(): void {
    this.conversationHistory = [];
  }

  public getHistory(): Array<{ role: string; content: string }> {
    return [...this.conversationHistory];
  }
}
