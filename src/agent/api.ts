import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;
let currentKey: string | null = null;

function getClient(apiKey: string): Anthropic {
  if (!client || currentKey !== apiKey) {
    client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
    currentKey = apiKey;
  }
  return client;
}

export interface StreamChatParams {
  messages: Anthropic.MessageParam[];
  model: string;
  system: Anthropic.TextBlockParam[];
  apiKey: string;
  tools?: Anthropic.Tool[];
  onText: (chunk: string) => void;
  onToolCall?: (name: string, input: Record<string, unknown>) => void;
  signal?: AbortSignal;
}

export interface ChatResult {
  inputTokens: number;
  outputTokens: number;
  stopReason: string;
  content: Anthropic.ContentBlock[];
}

export async function streamChat({
  messages,
  model,
  system,
  apiKey,
  tools,
  onText,
  onToolCall,
  signal,
}: StreamChatParams): Promise<ChatResult> {
  const anthropic = getClient(apiKey);

  const stream = anthropic.messages.stream({
    model,
    max_tokens: 4096,
    system,
    messages,
    ...(tools && tools.length > 0 ? { tools } : {}),
  });

  signal?.addEventListener("abort", () => {
    stream.abort();
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      onText(event.delta.text);
    }
  }

  const finalMessage = await stream.finalMessage();

  // Notify about tool calls
  if (onToolCall) {
    for (const block of finalMessage.content) {
      if (block.type === "tool_use") {
        onToolCall(block.name, block.input as Record<string, unknown>);
      }
    }
  }

  return {
    inputTokens: finalMessage.usage.input_tokens,
    outputTokens: finalMessage.usage.output_tokens,
    stopReason: finalMessage.stop_reason ?? "end_turn",
    content: finalMessage.content,
  };
}
