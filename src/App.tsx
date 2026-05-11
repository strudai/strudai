import { useRef } from "react";
import type { StrudelEditorHandle } from "./agent/types";
import { StrudelEditor } from "./ui/StrudelEditor";
import { ChatPanel } from "./ui/ChatPanel";
import { Console } from "./ui/Console";

export function App() {
  const editorRef = useRef<StrudelEditorHandle>(null);

  return (
    <>
      {/* Invisible — just exposes getCode/setCode via ref */}
      <StrudelEditor ref={editorRef} />

      {/* Chat Panel — overlay on the right */}
      <ChatPanel editorRef={editorRef} />

      {/* Console — overlay on the bottom-left */}
      <Console />

      {/* CRT overlay — RGB sub-pixel grain + vignette */}
      <div className="crt-overlay" aria-hidden />

    </>
  );
}
