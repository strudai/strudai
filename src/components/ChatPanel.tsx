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
  const [visible, setVisible] = useState(true);
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

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="chat-toggle visible"
      >
        <img src="/hans_logo.svg" alt="Chat" className="chat-toggle-icon" />
      </button>
    );
  }

  return (
    <div className="chat-panel">
      {/* Header */}
      <div className="chat-header">
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className={`settings-btn${settingsOpen ? " active" : ""}`}
          title="Settings"
        >
          &#x2699;
        </button>
        <button
          onClick={() => setVisible(false)}
          className="chat-close"
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
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {isStreaming && messages[messages.length - 1]?.content === "" && (
          <div className="chat-message status">
            <span className="dot-pulse">
              <span />
              <span />
              <span />
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder={
            hasApiKey ? "Describe a pattern..." : "Set API key first..."
          }
          disabled={!hasApiKey}
        />
        {isStreaming ? (
          <button onClick={handleStop} className="stop-btn">
            Stop
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!input.trim() || !hasApiKey}
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
}
