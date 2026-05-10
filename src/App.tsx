import { useRef } from "react";
import type { StrudelEditorHandle } from "./types";
import { StrudelEditor } from "./components/StrudelEditor";
import { ChatPanel } from "./components/ChatPanel";

export function App() {
  const editorRef = useRef<StrudelEditorHandle>(null);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* Strudel Editor — fills entire screen */}
      <div className="absolute inset-0">
        <StrudelEditor ref={editorRef} />
      </div>

      {/* Chat Panel — overlay on the right */}
      <ChatPanel editorRef={editorRef} />
    </main>
  );
}
