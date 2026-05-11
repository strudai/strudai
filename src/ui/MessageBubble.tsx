import type { Message } from "../agent/types";

const baseClasses =
  "rounded-lg max-w-[90%] whitespace-pre-wrap leading-[1.4]";

export function MessageBubble({ message }: { message: Message }) {
  if (message.role === "tool") {
    return (
      <div
        className={`${baseClasses} self-start px-3 py-[0.35rem] text-[0.8rem] font-mono bg-[rgba(124,92,191,0.12)] border border-[rgba(124,92,191,0.25)] text-[var(--text-secondary)]`}
      >
        <span className="text-[var(--accent-hover)] font-semibold">
          {message.toolName}
        </span>{" "}
        <span className="text-[var(--text-muted)] italic">
          {message.content}
        </span>
      </div>
    );
  }

  const isUser = message.role === "user";
  const isEmptyAssistant = !isUser && message.content === "";
  return (
    <div
      className={`${baseClasses} px-3 py-2 text-[0.9rem] ${
        isUser
          ? "self-end bg-[var(--bubble-user)] text-[var(--bubble-user-text)]"
          : "self-start bg-[var(--bubble-assistant)] text-[var(--bubble-assistant-text)]"
      }`}
    >
      {isEmptyAssistant ? (
        <span className="inline-flex gap-[3px] align-middle">
          <span className="w-[5px] h-[5px] rounded-full bg-[var(--text-muted)] animate-dot-pulse" />
          <span className="w-[5px] h-[5px] rounded-full bg-[var(--text-muted)] animate-dot-pulse [animation-delay:0.2s]" />
          <span className="w-[5px] h-[5px] rounded-full bg-[var(--text-muted)] animate-dot-pulse [animation-delay:0.4s]" />
        </span>
      ) : (
        message.content
      )}
    </div>
  );
}
