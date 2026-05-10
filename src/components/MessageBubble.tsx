import type { Message } from "../types";

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`chat-message ${isUser ? "user" : "assistant"}`}>
      {message.content}
    </div>
  );
}
