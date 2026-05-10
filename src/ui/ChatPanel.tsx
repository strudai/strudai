import { useState, useRef, useEffect, useCallback } from "react";
import type Anthropic from "@anthropic-ai/sdk";
import type { Message, StrudelEditorHandle } from "../agent/types";
import { MessageBubble } from "./MessageBubble";
import { SettingsDrawer } from "./SettingsDrawer";
import { streamChat } from "../agent/api";
import { STATIC_PROMPT } from "../agent/system-prompt";
import { getActiveTools, executeTool } from "../agent/tools";
import * as store from "../store";

interface ChatPanelProps {
  editorRef: React.RefObject<StrudelEditorHandle | null>;
}

export function ChatPanel({ editorRef }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Guten Tag, I am Hans Strudel. Tell me what you want to hear and I will make the beats.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [visible, setVisible] = useState(true);
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
                content: streamingText,
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

          // Display tool call in chat
          setMessages((prev) => [
            ...prev,
            {
              role: "tool" as const,
              toolName: block.name,
              content: block.name === "strudel_rewrite_code" ? "Rewriting code..."
                : block.name === "strudel_edit_code" ? "Editing code..."
                : block.name,
            },
          ]);

          // Execute tool
          const resultStr = executeTool(
            block.name,
            toolInput,
            editorRef.current!
          );

          // Update tool message with result
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === "tool" && last.toolName === block.name) {
              updated[updated.length - 1] = {
                ...last,
                content: (block.name === "strudel_rewrite_code" || block.name === "strudel_edit_code") ? "Code updated" : resultStr,
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

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="absolute top-[calc(1rem-16px)] right-[calc(1rem-5px)] w-14 h-14 z-20 rounded-full bg-transparent border-0 p-0 cursor-pointer flex items-center justify-center transition-[transform,opacity] duration-300 hover:scale-110"
      >
        <img src="/hans_logo.svg" alt="Chat" className="w-full h-full object-contain" />
      </button>
    );
  }

  const sharedBtn = "bg-transparent border-0 cursor-pointer transition-colors duration-300";

  return (
    <div className="absolute top-4 right-4 bottom-4 w-[360px] z-20 flex flex-col bg-[var(--surface)] border border-[var(--surface-border)] rounded-[var(--radius)] shadow-[var(--shadow)]">
      {/* Header */}
      <div className="flex justify-between items-center pt-1 pr-1 pb-0 pl-2">
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className={`${sharedBtn} text-[1.1rem] p-1 ${settingsOpen ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
          title="Settings"
        >
          &#x2699;
        </button>
        <button
          onClick={() => setVisible(false)}
          className={`${sharedBtn} text-2xl leading-none px-3 py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]`}
        >
          &times;
        </button>
      </div>

      {/* Settings */}
      <SettingsDrawer
        open={settingsOpen}
        onApiKeyChange={(key) => setHasApiKey(!!key)}
        usage={usage}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 rounded-t-[var(--radius)]">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {isStreaming && messages[messages.length - 1]?.content === "" && (
          <div className="self-start flex items-center gap-2 px-3 py-[0.35rem] text-[0.8rem] text-[var(--text-muted)]">
            <span className="inline-flex gap-[3px]">
              <span className="w-[5px] h-[5px] rounded-full bg-[var(--text-muted)] animate-dot-pulse" />
              <span className="w-[5px] h-[5px] rounded-full bg-[var(--text-muted)] animate-dot-pulse [animation-delay:0.2s]" />
              <span className="w-[5px] h-[5px] rounded-full bg-[var(--text-muted)] animate-dot-pulse [animation-delay:0.4s]" />
            </span>
          </div>
        )}
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
            className="px-4 py-2 rounded-md cursor-pointer text-[0.9rem] border-0 transition-colors duration-300 bg-[var(--accent)] text-[var(--text-primary)] enabled:hover:bg-[var(--accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
}
