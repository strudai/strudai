import Anthropic from "@anthropic-ai/sdk";
import type { Message } from "./types";

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
  messages: Message[];
  model: string;
  systemPrompt: string;
  apiKey: string;
  onText: (chunk: string) => void;
  signal?: AbortSignal;
}

export interface ChatUsage {
  inputTokens: number;
  outputTokens: number;
}

export async function streamChat({
  messages,
  model,
  systemPrompt,
  apiKey,
  onText,
  signal,
}: StreamChatParams): Promise<ChatUsage> {
  const anthropic = getClient(apiKey);

  const stream = anthropic.messages.stream({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
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
  return {
    inputTokens: finalMessage.usage.input_tokens,
    outputTokens: finalMessage.usage.output_tokens,
  };
}
