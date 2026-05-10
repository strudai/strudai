import type { Message } from "../agent/types";

export function MessageBubble({ message }: { message: Message }) {
  if (message.role === "tool") {
    return (
      <div className="chat-message tool-call">
        <span className="tool-name">{message.toolName}</span>{" "}
        <span className="tool-status">{message.content}</span>
      </div>
    );
  }

  const isUser = message.role === "user";
  return (
    <div className={`chat-message ${isUser ? "user" : "assistant"}`}>
      {message.content}
    </div>
  );
}
