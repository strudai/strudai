import { useState, useRef, useEffect, useCallback } from "react";
import type Anthropic from "@anthropic-ai/sdk";
import type { Message, StrudelEditorHandle } from "../agent/types";
import { MessageBubble } from "./MessageBubble";
import { SettingsDrawer } from "./SettingsDrawer";
import { streamChat } from "../agent/api";
import { STATIC_PROMPT } from "../agent/system-prompt";
import { getActiveTools, executeTool } from "../agent/tools";
import { germanise } from "../agent/accent";
import * as store from "../store";

interface ChatPanelProps {
  editorRef: React.RefObject<StrudelEditorHandle | null>;
}

function summarizeSearchResult(resultStr: string): string {
  try {
    const parsed = JSON.parse(resultStr);
    if (parsed.ok === false) return `Failed: ${parsed.error ?? "unknown error"}`;
    const count = Array.isArray(parsed.results) ? parsed.results.length : 0;
    return count === 0 ? "No matches" : `${count} result${count === 1 ? "" : "s"}`;
  } catch {
    return "Done";
  }
}

function summarizeToolResult(resultStr: string): string {
  try {
    const parsed = JSON.parse(resultStr);
    if (parsed.ok === false) return `failed: ${parsed.error ?? "unknown error"}`;
    if (parsed.ok === true) return "ok";
    if (Array.isArray(parsed.results)) {
      const n = parsed.results.length;
      return n === 0 ? "no matches" : `${n} result${n === 1 ? "" : "s"}`;
    }
    return "done";
  } catch {
    return "done";
  }
}

export function ChatPanel({ editorRef }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        germanise(
          "Guten Tag, I am Hans Strudel. Tell me what you want to hear and I will make the beats."
        ),
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [usage, setUsage] = useState({ inputTokens: 0, outputTokens: 0 });
  const [hasApiKey, setHasApiKey] = useState(!!store.getApiKey());

  // API-level messages (includes tool_use/tool_result blocks)
  const apiMessagesRef = useRef<Anthropic.MessageParam[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  function addUsage(input: number, output: number) {
    setUsage((prev) => ({
      inputTokens: prev.inputTokens + input,
      outputTokens: prev.outputTokens + output,
    }));
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || isStreaming) return;

    const apiKey = store.getApiKey();
    if (!apiKey) {
      setSettingsOpen(true);
      return;
    }

    // Add user message to both display and API messages
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    apiMessagesRef.current = [
      ...apiMessagesRef.current,
      { role: "user", content: text },
    ];
    setInput("");
    setIsStreaming(true);

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      await runAgentLoop(apiKey, abortController.signal);
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${err.message}` },
        ]);
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  function buildSystem(code: string): Anthropic.TextBlockParam[] {
    const blocks: Anthropic.TextBlockParam[] = [
      {
        type: "text",
        text: STATIC_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ];
    if (code) {
      blocks.push({
        type: "text",
        text: `[Current code in editor]\n\`\`\`\n${code}\n\`\`\``,
      });
    }
    return blocks;
  }

  async function runAgentLoop(apiKey: string, signal: AbortSignal) {
    // Snapshot editor code once — tool calls may change it during the loop
    const editorCode = editorRef.current?.getCode() ?? "";
    const system = buildSystem(editorCode);
    const tools = getActiveTools(store.getToolToggles());
    let continueLoop = true;

    while (continueLoop) {
      // Add empty assistant message for streaming text
      let streamingText = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const result = await streamChat({
        messages: apiMessagesRef.current,
        model: store.getModel(),
        system,
        apiKey,
        tools,
        signal,
        onText: (chunk) => {
          streamingText += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === "assistant") {
              updated[updated.length - 1] = {
                ...last,
                content: germanise(streamingText),
              };
            }
            return updated;
          });
        },
      });

      addUsage(result.inputTokens, result.outputTokens);

      // Remove empty assistant message if no text was streamed
      if (!streamingText) {
        setMessages((prev) => {
          const updated = [...prev];
          if (updated[updated.length - 1]?.role === "assistant" && !updated[updated.length - 1].content) {
            updated.pop();
          }
          return updated;
        });
      }

      // Add assistant response to API messages
      apiMessagesRef.current = [
        ...apiMessagesRef.current,
        { role: "assistant", content: result.content },
      ];

      // Display server-side tool calls (e.g. web_search runs on Anthropic's side)
      for (const block of result.content) {
        if (block.type === "server_tool_use" && block.name === "web_search") {
          const query = (block.input as { query?: string }).query ?? "";
          console.log(`[tool] web_search(${JSON.stringify({ query })})`);
          setMessages((prev) => [
            ...prev,
            {
              role: "tool" as const,
              toolName: "web_search",
              content: query ? `Searched: ${query}` : "Searching the web...",
            },
          ]);
        }
      }

      if (result.stopReason === "tool_use") {
        // Execute tool calls
        const toolUseBlocks = result.content.filter(
          (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
        );

        const toolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const block of toolUseBlocks) {
          const toolInput = block.input as Record<string, unknown>;
          const inputStr = JSON.stringify(toolInput);
          const truncated = inputStr.length > 120 ? inputStr.slice(0, 120) + "..." : inputStr;
          console.log(`[tool] ${block.name}(${truncated})`);

          // Display tool call in chat
          setMessages((prev) => [
            ...prev,
            {
              role: "tool" as const,
              toolName: block.name,
              content: block.name === "strudel_rewrite_code" ? "Rewriting code..."
                : block.name === "strudel_edit_code" ? "Editing code..."
                : block.name === "strudel_docs_search" ? `Searching docs: ${(toolInput.query as string) ?? ""}`
                : block.name === "sample_search" ? `Searching samples: ${(toolInput.query as string) ?? ""}`
                : block.name,
            },
          ]);

          // Execute tool
          const resultStr = await executeTool(
            block.name,
            toolInput,
            editorRef.current!
          );
          console.log(`[tool] ${block.name} → ${summarizeToolResult(resultStr)}`);

          // Update tool message with result
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === "tool" && last.toolName === block.name) {
              updated[updated.length - 1] = {
                ...last,
                content: (block.name === "strudel_rewrite_code" || block.name === "strudel_edit_code") ? "Code updated"
                  : block.name === "strudel_docs_search" || block.name === "sample_search"
                    ? summarizeSearchResult(resultStr)
                    : resultStr,
              };
            }
            return updated;
          });

          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: resultStr,
          });
        }

        // Add tool results to API messages
        apiMessagesRef.current = [
          ...apiMessagesRef.current,
          { role: "user", content: toolResults },
        ];
      } else {
        continueLoop = false;
      }
    }
  }

  function handleStop() {
    abortRef.current?.abort();
  }

  const sharedBtn = "bg-transparent border-0 cursor-pointer transition-colors duration-300";

  return (
    <div
      data-open={visible ? "" : undefined}
      className="retro-panel absolute top-4 right-4 z-20 flex flex-col bg-[var(--surface)] border border-[var(--surface-border)] rounded-[var(--radius)] shadow-[var(--shadow)] w-[110px] h-[30px] data-[open]:w-[360px] data-[open]:h-[calc(100vh-2rem)] transition-[width,height] duration-300 ease-out animate-panel-in"
    >
      {/* Header — collapsed shows [ HANS ], expanded shows settings + close */}
      {!visible ? (
        <button
          onClick={() => setVisible(true)}
          className="shrink-0 w-full h-[30px] flex items-center justify-center text-[0.8rem] font-bold text-[var(--text-primary)] hover:text-[var(--accent-hover)] bg-transparent border-0 cursor-pointer transition-colors duration-300 whitespace-nowrap"
        >
          [ HANS ]
        </button>
      ) : (
        <div className="grid grid-cols-[1fr_auto_1fr] items-center pt-1 pr-1 pb-0 pl-2 shrink-0">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={`${sharedBtn} text-[1.1rem] p-1 justify-self-start ${settingsOpen ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
            title="Settings"
          >
            &#x2699;
          </button>
          <span className="text-[0.8rem] font-bold text-[var(--text-primary)] justify-self-center">
            [ HANS ]
          </span>
          <button
            onClick={() => setVisible(false)}
            className={`${sharedBtn} text-2xl leading-none px-3 py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] justify-self-end`}
          >
            &times;
          </button>
        </div>
      )}

      {visible && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Settings */}
          <SettingsDrawer
            open={settingsOpen}
            onApiKeyChange={(key) => setHasApiKey(!!key)}
            usage={usage}
          />

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-2 rounded-t-[var(--radius)] animate-body-in">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex p-3 gap-2 border-t border-[var(--surface-border)] rounded-b-[var(--radius)]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={
                hasApiKey ? "Describe a pattern..." : "Set API key first..."
              }
              disabled={!hasApiKey}
              className="flex-1 min-w-0 px-3 py-2 rounded-md text-[0.9rem] outline-none bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--input-focus-border)]"
            />
            {isStreaming ? (
              <button
                onClick={handleStop}
                className="px-4 py-2 rounded-md cursor-pointer text-[0.9rem] transition-colors duration-300 bg-[var(--input-bg)] border border-[var(--surface-border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
              >
                Stop
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim() || !hasApiKey}
                className="px-4 py-2 rounded-md cursor-pointer text-[0.9rem] border-0 transition-colors duration-300 bg-[var(--accent)] text-black font-bold enabled:hover:bg-[var(--accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Send
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
