// Copyright (C) 2026 Douwe van der Heijden
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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

export interface ModelOption {
  id: string;
  displayName: string;
}

export async function listModels(apiKey: string): Promise<ModelOption[]> {
  const anthropic = getClient(apiKey);
  const page = await anthropic.models.list({ limit: 50 });
  return page.data
    .filter((m) => m.id.startsWith("claude-"))
    .map((m) => ({ id: m.id, displayName: m.display_name }));
}

export interface StreamChatParams {
  messages: Anthropic.MessageParam[];
  model: string;
  system: Anthropic.TextBlockParam[];
  apiKey: string;
  tools?: Anthropic.ToolUnion[];
  onText: (chunk: string) => void;
  onToolCall?: (name: string, input: Record<string, unknown>) => void;
  signal?: AbortSignal;
}

export interface ChatResult {
  /** Input tokens read from the prompt cache (cheap). */
  cachedInputTokens: number;
  /** Input tokens processed fresh — uncached input + cache writes. */
  uncachedInputTokens: number;
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
  // If the user already hit stop before this iteration started, bail now —
  // addEventListener("abort") below would never fire for an already-aborted signal.
  if (signal?.aborted) {
    throw new DOMException("Aborted by user", "AbortError");
  }

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

  // Split the input: cache reads are cheap; fresh input + cache writes are not.
  const u = finalMessage.usage;
  const cachedInputTokens = u.cache_read_input_tokens ?? 0;
  const uncachedInputTokens =
    u.input_tokens + (u.cache_creation_input_tokens ?? 0);

  return {
    cachedInputTokens,
    uncachedInputTokens,
    outputTokens: u.output_tokens,
    stopReason: finalMessage.stop_reason ?? "end_turn",
    content: finalMessage.content,
  };
}
