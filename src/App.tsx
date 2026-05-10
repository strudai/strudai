import { useRef } from "react";
import type { StrudelEditorHandle } from "./agent/types";
import { StrudelEditor } from "./ui/StrudelEditor";
import { ChatPanel } from "./ui/ChatPanel";

export function App() {
  const editorRef = useRef<StrudelEditorHandle>(null);

  return (
    <>
      {/* Invisible — just exposes getCode/setCode via ref */}
      <StrudelEditor ref={editorRef} />

      {/* Chat Panel — overlay on the right */}
      <ChatPanel editorRef={editorRef} />
    </>
  );
}
