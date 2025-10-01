import { NextRequest, NextResponse } from "next/server";
import { XAIService } from "../../lib/xai-service";

export async function POST(request: NextRequest) {
  try {
    const { message, stream = false } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
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
            const errorData = JSON.stringify({ 
              content: "I'm sorry, I'm having trouble processing your request right now.", 
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
    return NextResponse.json(
      { error: "Failed to process request" },
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
