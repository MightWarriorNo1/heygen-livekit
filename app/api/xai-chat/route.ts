import { NextRequest, NextResponse } from "next/server";
import { XAIService } from "../../lib/xai-service";

export async function POST(request: NextRequest) {
  try {
    // Check if xAI API key is available
    if (!process.env.XAI_API_KEY) {
      return NextResponse.json(
        { error: "Oops! My humor key is missing! Please add XAI_API_KEY to your .env.local file so I can tell you some jokes! 😄" },
        { status: 500 }
      );
    }

    const { message, stream = false } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Hey! I need something to work with here! Send me a message so I can crack some jokes! 😂" },
        { status: 400 }
      );
    }

    const xaiService = XAIService.getInstance();

    if (stream) {
      // For streaming responses
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            await xaiService.generateStreamingResponse(message, (chunk) => {
              const data = JSON.stringify({ content: chunk, done: false });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            });
            
            const endData = JSON.stringify({ content: "", done: true });
            controller.enqueue(encoder.encode(`data: ${endData}\n\n`));
            controller.close();
          } catch (error) {
            console.error("Streaming error:", error);
            const errorMessage = error instanceof Error && error.message.includes('XAI_API_KEY') 
              ? "My comedy license expired! Please check your XAI_API_KEY in the environment variables! 🎭"
              : "Oops! My humor circuits are having a meltdown! Give me a moment to reboot my funny bone! 🤖💥";
            
            const errorData = JSON.stringify({ 
              content: errorMessage, 
              done: true 
            });
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    } else {
      // For non-streaming responses
      const response = await xaiService.generateResponse(message);
      return NextResponse.json({ content: response });
    }
  } catch (error) {
    console.error("xAI API error:", error);
    
    const errorMessage = error instanceof Error && error.message.includes('XAI_API_KEY')
      ? "My humor key is missing! Please add XAI_API_KEY to your .env.local file so I can tell you some jokes! 😄"
      : "Oops! My comedy routine just crashed! Let me try to reboot my sense of humor! 🤖😂";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const xaiService = XAIService.getInstance();
    xaiService.clearHistory();
    return NextResponse.json({ message: "Conversation history cleared" });
  } catch (error) {
    console.error("Error clearing history:", error);
    return NextResponse.json(
      { error: "Failed to clear history" },
      { status: 500 }
    );
  }
}
