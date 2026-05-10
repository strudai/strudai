import { useRef } from "react";
import type { StrudelEditorHandle } from "./types";
import { StrudelEditor } from "./components/StrudelEditor";
import { ChatPanel } from "./components/ChatPanel";

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
