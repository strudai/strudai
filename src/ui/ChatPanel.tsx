import { useState, useRef, useEffect, useCallback } from "react";
import type Anthropic from "@anthropic-ai/sdk";
import type { Message, StrudelEditorHandle } from "../agent/types";
import { MessageBubble } from "./MessageBubble";
import { SettingsDrawer } from "./SettingsDrawer";
import { streamChat } from "../agent/api";
import { SYSTEM_PROMPT } from "../agent/system-prompt";
import { TOOLS, executeTool } from "../agent/tools";
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

    // Prepend current Strudel code to user message
    const code = editorRef.current?.getCode() ?? "";
    const fullText = code
      ? `[Current code in editor]\n\`\`\`\n${code}\n\`\`\`\n\n${text}`
      : text;

    // Add user message to both display and API messages
    setMessages((prev) => [...prev, { role: "user", content: fullText }]);
    apiMessagesRef.current = [
      ...apiMessagesRef.current,
      { role: "user", content: fullText },
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

  async function runAgentLoop(apiKey: string, signal: AbortSignal) {
    let continueLoop = true;

    while (continueLoop) {
      // Add empty assistant message for streaming text
      let streamingText = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const result = await streamChat({
        messages: apiMessagesRef.current,
        model: store.getModel(),
        systemPrompt: SYSTEM_PROMPT,
        apiKey,
        tools: TOOLS,
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
              content: block.name === "strudel_rewrite_code" ? "Rewriting code..." : block.name,
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
                content: block.name === "strudel_rewrite_code" ? "Code updated" : resultStr,
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
