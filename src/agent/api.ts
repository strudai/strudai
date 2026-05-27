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
import OpenAI from "openai";

// ─── Provider detection ──────────────────────────────────────────────────────

export type Provider = "anthropic" | "openrouter";

export function detectProvider(apiKey: string): Provider {
  return apiKey.startsWith("sk-or-") ? "openrouter" : "anthropic";
}

// ─── Client singletons ───────────────────────────────────────────────────────

let anthropicClient: Anthropic | null = null;
let anthropicCurrentKey: string | null = null;

function getAnthropicClient(apiKey: string): Anthropic {
  if (!anthropicClient || anthropicCurrentKey !== apiKey) {
    anthropicClient = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
    anthropicCurrentKey = apiKey;
  }
  return anthropicClient;
}

let orClient: OpenAI | null = null;
let orCurrentKey: string | null = null;

function getOpenRouterClient(apiKey: string): OpenAI {
  if (!orClient || orCurrentKey !== apiKey) {
    orClient = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      dangerouslyAllowBrowser: true,
    });
    orCurrentKey = apiKey;
  }
  return orClient;
}

// ─── Model listing ───────────────────────────────────────────────────────────

export interface ModelOption {
  id: string;
  displayName: string;
  /** USD per million input tokens; undefined = pricing unknown. */
  inputPricePerM?: number;
  /** USD per million output tokens; undefined = pricing unknown. */
  outputPricePerM?: number;
}

export async function listModels(apiKey: string): Promise<ModelOption[]> {
  const provider = detectProvider(apiKey);

  if (provider === "anthropic") {
    const anthropic = getAnthropicClient(apiKey);
    const page = await anthropic.models.list({ limit: 50 });
    return page.data
      .filter((m) => m.id.startsWith("claude-"))
      .map((m) => ({ id: m.id, displayName: m.display_name }));
  }

  // OpenRouter: fetch directly to get modality metadata for filtering
  const res = await fetch("https://openrouter.ai/api/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`OpenRouter: ${res.status} ${res.statusText}`);
  const data = (await res.json()) as {
    data: Array<{
      id: string;
      name: string;
      context_length?: number;
      supported_parameters?: string[];
      architecture?: { modality?: string };
      pricing?: { prompt?: string; completion?: string };
    }>;
  };
  return data.data
    .filter((m) => {
      const modality = m.architecture?.modality ?? "";
      if (!modality.includes("text") || modality.endsWith("->image")) return false;
      if ((m.context_length ?? 0) < 32000) return false;
      if (!m.supported_parameters?.includes("tools")) return false;
      return true;
    })
    .map((m) => {
      const rawIn = m.pricing?.prompt;
      const rawOut = m.pricing?.completion;
      const inputPricePerM = rawIn !== undefined ? parseFloat(rawIn) * 1_000_000 : undefined;
      const outputPricePerM = rawOut !== undefined ? parseFloat(rawOut) * 1_000_000 : undefined;
      return {
        id: m.id,
        displayName: m.name,
        inputPricePerM: Number.isFinite(inputPricePerM) ? inputPricePerM : undefined,
        outputPricePerM: Number.isFinite(outputPricePerM) ? outputPricePerM : undefined,
      };
    });
}

// ─── Message / tool format converters (Anthropic ↔ OpenAI) ──────────────────

function anthropicToOpenAIMessages(
  messages: Anthropic.MessageParam[],
  system: Anthropic.TextBlockParam[],
): OpenAI.Chat.ChatCompletionMessageParam[] {
  const hasSystemCache = system.some((b) => b.cache_control);
  const systemContent = hasSystemCache
    ? (system.map((b) => ({
        type: "text" as const,
        text: b.text,
        ...(b.cache_control ? { cache_control: b.cache_control } : {}),
      })) as unknown as OpenAI.Chat.ChatCompletionContentPartText[])
    : system.map((b) => b.text).join("\n\n");

  const result: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemContent },
  ];

  for (const msg of messages) {
    const content =
      typeof msg.content === "string"
        ? [{ type: "text" as const, text: msg.content }]
        : msg.content;

    if (msg.role === "user") {
      const toolResults = content.filter(
        (b) => b.type === "tool_result",
      ) as Anthropic.ToolResultBlockParam[];
      const textBlocks = content.filter(
        (b) => b.type === "text",
      ) as Anthropic.TextBlockParam[];

      for (const tr of toolResults) {
        let toolContent: string;
        if (typeof tr.content === "string") {
          toolContent = tr.content;
        } else if (Array.isArray(tr.content)) {
          const texts = (tr.content as Anthropic.ContentBlock[])
            .filter((b) => b.type === "text")
            .map((b) => (b as Anthropic.TextBlock).text);
          const hasImage = (tr.content as Array<{ type: string }>).some(
            (b) => b.type === "image",
          );
          toolContent =
            [...texts, hasImage ? "[screenshot captured]" : ""]
              .filter(Boolean)
              .join("\n") || "[result]";
        } else {
          toolContent = "[result]";
        }
        result.push({
          role: "tool",
          tool_call_id: tr.tool_use_id,
          content: toolContent,
        });
      }

      if (textBlocks.length > 0) {
        const hasCache = textBlocks.some(
          (b) => (b as Anthropic.TextBlockParam).cache_control,
        );
        result.push({
          role: "user",
          content: hasCache
            ? (textBlocks.map((b) => ({
                type: "text" as const,
                text: (b as Anthropic.TextBlockParam).text,
                ...((b as Anthropic.TextBlockParam).cache_control
                  ? { cache_control: (b as Anthropic.TextBlockParam).cache_control }
                  : {}),
              })) as unknown as OpenAI.Chat.ChatCompletionContentPartText[])
            : textBlocks.map((b) => (b as Anthropic.TextBlockParam).text).join("\n"),
        });
      }
    } else {
      // assistant
      const textBlocks = content.filter(
        (b) => b.type === "text",
      ) as Anthropic.TextBlock[];
      const toolUseBlocks = content.filter(
        (b) => b.type === "tool_use",
      ) as Anthropic.ToolUseBlock[];

      const assistantMsg: OpenAI.Chat.ChatCompletionAssistantMessageParam = {
        role: "assistant",
      };
      if (textBlocks.length > 0) {
        assistantMsg.content = textBlocks.map((b) => b.text).join("\n");
      }
      if (toolUseBlocks.length > 0) {
        assistantMsg.tool_calls = toolUseBlocks.map((b) => ({
          id: b.id,
          type: "function" as const,
          function: { name: b.name, arguments: JSON.stringify(b.input) },
        }));
      }
      result.push(assistantMsg);
    }
  }

  return result;
}

function anthropicToOpenAITools(
  tools: Anthropic.ToolUnion[],
): OpenAI.Chat.ChatCompletionTool[] {
  return (tools as Anthropic.Tool[]).map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description ?? "",
      parameters: tool.input_schema as Record<string, unknown>,
    },
  }));
}

// ─── streamChat ──────────────────────────────────────────────────────────────

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
  if (signal?.aborted) {
    throw new DOMException("Aborted by user", "AbortError");
  }

  const provider = detectProvider(apiKey);

  // ─── Anthropic path (unchanged) ────────────────────────────────────────────
  if (provider === "anthropic") {
    const anthropic = getAnthropicClient(apiKey);
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

    if (onToolCall) {
      for (const block of finalMessage.content) {
        if (block.type === "tool_use") {
          onToolCall(block.name, block.input as Record<string, unknown>);
        }
      }
    }

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

  // ─── OpenRouter path ───────────────────────────────────────────────────────
  const or = getOpenRouterClient(apiKey);
  const orMessages = anthropicToOpenAIMessages(messages, system);
  const orTools = tools?.length ? anthropicToOpenAITools(tools) : undefined;

  const stream = await or.chat.completions.create({
    model,
    messages: orMessages,
    ...(orTools?.length ? { tools: orTools } : {}),
    stream: true,
    stream_options: { include_usage: true },
  });

  let aborted = false;
  signal?.addEventListener("abort", () => {
    aborted = true;
  });

  let textContent = "";
  const tcMap: Record<number, { id: string; name: string; args: string }> = {};
  let finishReason = "stop";
  let usageTokens = { prompt_tokens: 0, completion_tokens: 0 };
  for await (const chunk of stream) {
    if (aborted) break;
    const delta = chunk.choices[0]?.delta;
    const finish = chunk.choices[0]?.finish_reason;
    if (finish) finishReason = finish;
    if (chunk.usage) {
      usageTokens = {
        prompt_tokens: chunk.usage.prompt_tokens,
        completion_tokens: chunk.usage.completion_tokens,
      };
    }

    if (delta?.content) {
      textContent += delta.content;
      onText(delta.content);
    }
    for (const tc of delta?.tool_calls ?? []) {
      if (!tcMap[tc.index]) tcMap[tc.index] = { id: "", name: "", args: "" };
      if (tc.id) tcMap[tc.index].id = tc.id;
      if (tc.function?.name) tcMap[tc.index].name = tc.function.name;
      tcMap[tc.index].args += tc.function?.arguments ?? "";
    }
  }

  if (aborted) {
    throw new DOMException("Aborted by user", "AbortError");
  }

  // Build Anthropic-shaped content blocks so ChatPanel needs no changes
  const content: Anthropic.ContentBlock[] = [];
  if (textContent) {
    content.push({ type: "text", text: textContent } as Anthropic.ContentBlock);
  }
  for (const tc of Object.values(tcMap)) {
    const input = JSON.parse(tc.args || "{}") as Record<string, unknown>;
    content.push({ type: "tool_use", id: tc.id, name: tc.name, input } as Anthropic.ContentBlock);
    if (onToolCall) onToolCall(tc.name, input);
  }

  return {
    cachedInputTokens: 0,
    uncachedInputTokens: usageTokens.prompt_tokens,
    outputTokens: usageTokens.completion_tokens,
    stopReason: finishReason === "tool_calls" ? "tool_use" : "end_turn",
    content,
  };
}
