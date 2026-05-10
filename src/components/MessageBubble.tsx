import type { Message } from "../types";

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div
      className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
        isUser
          ? "self-end bg-[var(--bubble-user)] text-[var(--bubble-user-text)]"
          : "self-start bg-[var(--bubble-assistant)] text-[var(--bubble-assistant-text)]"
      }`}
    >
      {message.content}
    </div>
  );
}
