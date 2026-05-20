// Copyright (C) 2025 Douwe van der Heijden
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

import { useState, useRef, useEffect, useCallback } from "react";
import type Anthropic from "@anthropic-ai/sdk";
import type { Message, StrudelEditorHandle } from "../agent/types";
import { MessageBubble } from "./MessageBubble";
import { SettingsDrawer } from "./SettingsDrawer";
import { SetPanel } from "./SetPanel";
import { streamChat } from "../agent/api";
import { BASE_PROMPT, SET_PROMPT } from "../agent/system-prompt";
import { getActiveTools, executeTool } from "../agent/tools";
import { germanise } from "../agent/accent";
import { subscribeToConsole, getErrorsSince } from "../agent/error-buffer";
import {
  subscribe as subscribeSet,
  isActive as isSetActive,
  getPlan as getSetPlan,
  currentBar as setCurrentBar,
  totalBars as setTotalBars,
  markersUpTo as setMarkersUpTo,
  stopSet,
  clearPlan,
  type SetMarker,
} from "../agent/set-state";
import * as store from "../store";

type DisplayHint =
  | { kind: "auto-fix" }
  | { kind: "set-trigger"; display: string };

interface ChatPanelProps {
  editorRef: React.RefObject<StrudelEditorHandle | null>;
}

const GREETING = germanise(
  "Guten Tag, I am Hans Strudel. Tell me what you want to hear and I will make the beats."
);

function initialMessages(): Message[] {
  return [{ role: "assistant", content: GREETING }];
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
    if (typeof parsed.errorCount === "number") {
      return parsed.errorCount === 0
        ? "console clean"
        : `${parsed.errorCount} error${parsed.errorCount === 1 ? "" : "s"}`;
    }
    if (Array.isArray(parsed.results)) {
      const n = parsed.results.length;
      return n === 0 ? "no matches" : `${n} result${n === 1 ? "" : "s"}`;
    }
    return "done";
  } catch {
    return "done";
  }
}

function summarizeConsoleResult(resultStr: string): string {
  try {
    const parsed = JSON.parse(resultStr);
    const n = parsed.errorCount ?? 0;
    return n === 0 ? "console clean" : `${n} error${n === 1 ? "" : "s"}`;
  } catch {
    return "checked";
  }
}

export function ChatPanel({ editorRef }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [usage, setUsage] = useState({
    cachedInputTokens: 0,
    uncachedInputTokens: 0,
    outputTokens: 0,
    contextTokens: 0,
  });
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

  function addUsage(cached: number, uncached: number, output: number) {
    setUsage((prev) => ({
      cachedInputTokens: prev.cachedInputTokens + cached,
      uncachedInputTokens: prev.uncachedInputTokens + uncached,
      outputTokens: prev.outputTokens + output,
      // The latest request's full input is the context size at that point.
      contextTokens: cached + uncached,
    }));
  }

  function handleClearChat() {
    if (isStreaming) return;
    setMessages(initialMessages());
    apiMessagesRef.current = [];
    setUsage((prev) => ({ ...prev, contextTokens: 0 }));
    clearPlan();
  }

  async function handleSend(seedText?: string, hint?: DisplayHint) {
    const text = (seedText ?? input).trim();
    if (!text || isStreamingRef.current) return;
    isStreamingRef.current = true;

    const apiKey = store.getApiKey();
    if (!apiKey) {
      isStreamingRef.current = false;
      setSettingsOpen(true);
      return;
    }

    // The API always needs a user message; the displayed bubble differs:
    // auto-fix and set-trigger render as tool-style pills, not user messages.
    const displayMessage: Message =
      hint?.kind === "auto-fix"
        ? { role: "tool", toolName: "auto-fix", content: "Strudel error detected — fixing" }
        : hint?.kind === "set-trigger"
        ? { role: "tool", toolName: "set-trigger", content: hint.display }
        : { role: "user", content: text };
    setMessages((prev) => [...prev, displayMessage]);
    apiMessagesRef.current = [
      ...apiMessagesRef.current,
      { role: "user", content: text },
    ];
    if (!seedText) setInput("");
    setIsStreaming(true);

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      await runAgentLoop(apiKey, abortController.signal);
    } catch (err) {
      // If the user hit stop, swallow whatever the abort threw (the SDK's
      // abort error name isn't reliably "AbortError").
      if (!abortController.signal.aborted && err instanceof Error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${err.message}` },
        ]);
      }
    } finally {
      setIsStreaming(false);
      isStreamingRef.current = false;
      abortRef.current = null;
    }
  }

  // Synchronous mutex — managed directly in handleSend/finally, not via React state.
  const isStreamingRef = useRef(false);

  // Auto-fix watcher: when enabled, new errors trigger a fix turn.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let windowStart = 0;
    // Signature of the last error set auto-fix acted on — prevents re-triggering
    // a fresh turn on the exact same unfixed errors (would loop forever).
    let lastSignature = "";
    const unsubscribe = subscribeToConsole(() => {
      if (!store.getAutoFix()) return;
      if (isStreamingRef.current) return;
      if (!timer) windowStart = Date.now() - 500; // start of this error burst
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        // Re-check at fire time — state may have changed during debounce
        if (isStreamingRef.current || !store.getAutoFix()) return;
        if (!store.getApiKey()) return;
        const errors = getErrorsSince(windowStart);
        if (errors.length === 0) return;
        const signature = [...new Set(errors)].sort().join("|||");
        if (signature === lastSignature) return; // already tried these
        lastSignature = signature;
        handleSend(
          "The Strudel REPL just threw an error. Check the editor and fix it.\n\n" +
            errors.join("\n"),
          { kind: "auto-fix" }
        );
      }, 2000);
    });
    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set-mode bar watcher. While a set is active, tick every 500ms: compute the
  // current absolute bar, pull any markers whose time has come, and feed each
  // into the same agent loop as a tool-pill set-trigger. If the agent is mid-
  // stream when a marker fires we abort and queue the trigger; it drains in
  // the next tick (or when streaming flips off).
  const triggerQueueRef = useRef<Array<{ prompt: string; display: string }>>([]);
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    function buildTrigger(marker: SetMarker) {
      const plan = getSetPlan();
      if (!plan) return null;
      const song = plan.songs[marker.songIndex];
      const section = song.sections[marker.sectionIndex];
      const display = `[bar ${marker.absoluteBar} · ${song.name}] ${section.note}`;
      let prompt = `[set/bar ${marker.absoluteBar}, song "${song.name}" (bar ${section.bar}/${song.bars})]\n${section.note}`;
      if (marker.isFirstSectionOfSong) {
        const intro =
          marker.songIndex === 0
            ? `This is bar 0 of the set — first song "${song.name}". Use strudel_rewrite_code. Start the code with setcpm(${plan.bpm}). Foundation: ${song.foundation}`
            : `Start of next song "${song.name}". Use strudel_rewrite_code for a fresh foundation (keep setcpm(${plan.bpm}) at the top). Foundation: ${song.foundation}`;
        prompt += `\n\n${intro}`;
      }
      return { prompt, display };
    }

    function tick() {
      if (!isSetActive()) return;
      const total = setTotalBars();
      const bar = setCurrentBar();
      if (bar > total) {
        stopSet();
        return;
      }
      const due = setMarkersUpTo(bar);
      for (const m of due) {
        const t = buildTrigger(m);
        if (t) triggerQueueRef.current.push(t);
      }
      // A fresh marker mid-stream cancels the current reply so the new section
      // gets a clean turn (mirrors v1's "cancel previous performer task").
      if (due.length > 0 && isStreamingRef.current) {
        abortRef.current?.abort();
      }
      if (!isStreamingRef.current && triggerQueueRef.current.length > 0) {
        const next = triggerQueueRef.current.shift()!;
        handleSend(next.prompt, { kind: "set-trigger", display: next.display });
      }
    }

    function syncTimer() {
      if (isSetActive() && !timer) {
        timer = setInterval(tick, 500);
        tick(); // fire bar 0 immediately
      } else if (!isSetActive() && timer) {
        clearInterval(timer);
        timer = null;
        triggerQueueRef.current = [];
      }
    }

    const unsubscribe = subscribeSet(syncTimer);
    syncTimer();
    return () => {
      unsubscribe();
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drain any queued set triggers as soon as streaming finishes.
  useEffect(() => {
    if (isStreaming) return;
    if (triggerQueueRef.current.length === 0) return;
    const next = triggerQueueRef.current.shift()!;
    handleSend(next.prompt, { kind: "set-trigger", display: next.display });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStreaming]);


  function buildSystem(code: string): Anthropic.TextBlockParam[] {
    const blocks: Anthropic.TextBlockParam[] = [
      { type: "text", text: BASE_PROMPT, cache_control: { type: "ephemeral", ttl: "1h" } },
    ];
    if (isSetActive()) {
      blocks.push({ type: "text", text: SET_PROMPT, cache_control: { type: "ephemeral", ttl: "1h" } });
    }
    if (code) {
      blocks.push({ type: "text", text: `[Current code in editor]\n\`\`\`\n${code}\n\`\`\`` });
    }
    return blocks;
  }

  function trimHistory(messages: Anthropic.MessageParam[], maxTurns = 8): Anthropic.MessageParam[] {
    const realUserIndices: number[] = [];
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (msg.role === "user") {
        const isToolResult = Array.isArray(msg.content) &&
          msg.content.length > 0 &&
          (msg.content[0] as { type: string }).type === "tool_result";
        if (!isToolResult) realUserIndices.push(i);
      }
    }
    if (realUserIndices.length <= maxTurns) return messages;
    return messages.slice(realUserIndices[realUserIndices.length - maxTurns]);
  }

  function addHistoryCache(messages: Anthropic.MessageParam[]): Anthropic.MessageParam[] {
    const realUserIndices: number[] = [];
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (msg.role === "user") {
        const isToolResult = Array.isArray(msg.content) &&
          msg.content.length > 0 &&
          (msg.content[0] as { type: string }).type === "tool_result";
        if (!isToolResult) realUserIndices.push(i);
      }
    }
    if (realUserIndices.length < 2) return messages;
    const targetIdx = realUserIndices[realUserIndices.length - 2];
    return messages.map((msg, i) => {
      if (i !== targetIdx) return msg;
      const content = msg.content;
      if (typeof content === "string") {
        return { ...msg, content: [{ type: "text" as const, text: content, cache_control: { type: "ephemeral" as const } }] };
      }
      if (Array.isArray(content) && content.length > 0) {
        const last = content[content.length - 1];
        return { ...msg, content: [...content.slice(0, -1), { ...last, cache_control: { type: "ephemeral" as const } }] };
      }
      return msg;
    });
  }

  async function runAgentLoop(apiKey: string, signal: AbortSignal) {
    // Snapshot editor code once — tool calls may change it during the loop
    const editorCode = editorRef.current?.getCode() ?? "";
    const system = buildSystem(editorCode);
    const tools = getActiveTools(store.getToolToggles());
    let continueLoop = true;

    while (continueLoop) {
      if (signal.aborted) break;

      // Add empty assistant message for streaming text
      let streamingText = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const result = await streamChat({
        messages: addHistoryCache(trimHistory(apiMessagesRef.current, 12)),
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

      addUsage(
        result.cachedInputTokens,
        result.uncachedInputTokens,
        result.outputTokens
      );

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
                : block.name === "strudel_read_console" ? "Checking console..."
                : block.name === "strudel_docs_search" ? `Searching docs: ${(toolInput.query as string) ?? ""}`
                : block.name === "sample_search" ? `Searching samples: ${(toolInput.query as string) ?? ""}`
                : block.name === "example_search" ? `Searching examples: ${(toolInput.query as string) ?? ""}`
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
                  : block.name === "strudel_read_console" ? summarizeConsoleResult(resultStr)
                  : block.name === "strudel_docs_search" || block.name === "sample_search" || block.name === "example_search"
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

        // User may have hit stop while tools were running
        if (signal.aborted) break;
      } else {
        continueLoop = false;
      }
    }
  }

  function handleStop() {
    triggerQueueRef.current = [];
    abortRef.current?.abort();
  }

  const sharedBtn = "bg-transparent border-0 cursor-pointer transition-colors duration-300";

  return (
    <div
      id="hans-panel"
      data-open={visible ? "" : undefined}
      className="retro-panel fixed top-4 right-4 z-20 flex flex-col bg-[var(--surface)] border border-[var(--surface-border)] rounded-[var(--radius)] shadow-[var(--shadow)] w-[110px] h-[30px] data-[open]:w-[360px] data-[open]:h-[calc(100vh-2rem)] transition-[width,height] duration-300 ease-out animate-panel-in"
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
        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-[30px] pr-1 pl-2 shrink-0">
          <span className="flex items-center justify-self-start">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`${sharedBtn} text-[1.1rem] p-1 ${settingsOpen ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
              title="Settings"
            >
              &#x2699;
            </button>
            <button
              onClick={handleClearChat}
              className={`${sharedBtn} text-[1rem] p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]`}
              title="New chat"
            >
              &#x21bb;
            </button>
          </span>
          <span className="text-[0.8rem] font-bold text-[var(--text-primary)] justify-self-center">
            [ HANS ]
          </span>
          <button
            onClick={() => setVisible(false)}
            className={`${sharedBtn} text-2xl leading-none px-3 py-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] justify-self-end`}
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

          {/* Set plan (visible only when a plan exists) */}
          <SetPanel />

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
                onClick={() => handleSend()}
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
