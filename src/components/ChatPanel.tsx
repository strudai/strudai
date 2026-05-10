import { useState, useRef, useEffect, useCallback } from "react";
import type { Message, StrudelEditorHandle } from "../types";
import { MessageBubble } from "./MessageBubble";
import { SettingsDrawer } from "./SettingsDrawer";
import { streamChat } from "../api";
import { SYSTEM_PROMPT } from "../system-prompt";
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
  const [usage, setUsage] = useState({ inputTokens: 0, outputTokens: 0 });
  const [hasApiKey, setHasApiKey] = useState(!!store.getApiKey());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isStreaming) return;

    const apiKey = store.getApiKey();
    if (!apiKey) {
      setSettingsOpen(true);
      return;
    }

    // Prepend current Strudel code to user message
    const code = editorRef.current?.getCode() ?? "";
    const fullText = code
      ? `[Current code in editor]\n\`\`\`\n${code}\n\`\`\`\n\n${text}`
      : text;

    const userMessage: Message = { role: "user", content: fullText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    const abortController = new AbortController();
    abortRef.current = abortController;

    // Add empty assistant message for streaming
    const streamingMessages = [
      ...newMessages,
      { role: "assistant" as const, content: "" },
    ];
    setMessages(streamingMessages);

    try {
      const result = await streamChat({
        messages: newMessages,
        model: store.getModel(),
        systemPrompt: SYSTEM_PROMPT,
        apiKey,
        signal: abortController.signal,
        onText: (chunk) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === "assistant") {
              updated[updated.length - 1] = {
                ...last,
                content: last.content + chunk,
              };
            }
            return updated;
          });
        },
      });

      setUsage((prev) => ({
        inputTokens: prev.inputTokens + result.inputTokens,
        outputTokens: prev.outputTokens + result.outputTokens,
      }));
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === "assistant" && !last.content) {
            updated[updated.length - 1] = {
              ...last,
              content: `Error: ${err.message}`,
            };
          }
          return updated;
        });
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  function handleStop() {
    abortRef.current?.abort();
  }

  return (
    <div className="absolute top-4 right-4 bottom-4 w-[360px] flex flex-col bg-[var(--surface)] border border-[var(--surface-border)] rounded-xl shadow-lg z-20">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--surface-border)]">
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-lg"
          title="Settings"
        >
          &#x2699;
        </button>
        <span className="text-xs text-[var(--text-muted)]">StrudelGPT</span>
        <div className="w-6" />
      </div>

      {/* Settings */}
      <SettingsDrawer
        open={settingsOpen}
        onApiKeyChange={(key) => setHasApiKey(!!key)}
        usage={usage}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {isStreaming && messages[messages.length - 1]?.content === "" && (
          <div className="self-start text-[var(--text-muted)] text-sm animate-pulse">
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 px-3 py-2 border-t border-[var(--surface-border)]">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder={
            hasApiKey ? "Describe a pattern..." : "Set API key first..."
          }
          disabled={!hasApiKey}
          className="flex-1 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] outline-none disabled:opacity-50"
        />
        {isStreaming ? (
          <button
            onClick={handleStop}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!input.trim() || !hasApiKey}
            className="px-3 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
}
