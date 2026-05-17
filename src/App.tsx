import { useRef, useEffect } from "react";
import type { StrudelEditorHandle } from "./agent/types";
import { StrudelEditor } from "./ui/StrudelEditor";
import { ChatPanel } from "./ui/ChatPanel";
import { Console } from "./ui/Console";
import * as store from "./store";
import { NextStepProvider, NextStepReact, useNextStep } from "nextstepjs";
import type { Tour } from "nextstepjs";

const ONBOARDING_KEY = "strudelgpt_onboarding_done";

const TOURS: Tour[] = [
  {
    tour: "welcome",
    steps: [
      {
        icon: "🎵",
        title: "Willkommen!",
        content:
          "I am Hans Strudel — your AI companion for live-coded music. Let me show you around.",
        showSkip: true,
        showControls: true,
      },
      {
        icon: "🎹",
        title: "The Editor",
        content:
          "Write Strudel patterns here. Press the play button or Ctrl+Enter to hear your music.",
        selector: "#strudelEditor",
        side: "top",
        showSkip: true,
        showControls: true,
      },
      {
        icon: "💬",
        title: "Talk to Hans",
        content:
          "Click [HANS] to open my chat. Describe what you want to hear and I will code it for you.",
        selector: "#hans-panel",
        side: "left",
        showSkip: true,
        showControls: true,
      },
    ],
  },
];

function AppContent({
  editorRef,
}: {
  editorRef: React.RefObject<StrudelEditorHandle | null>;
}) {
  const { startNextStep } = useNextStep();

  useEffect(() => {
    if (!localStorage.getItem(ONBOARDING_KEY)) {
      startNextStep("welcome");
    }
  }, [startNextStep]);

  return (
    <>
      <StrudelEditor ref={editorRef} />
      <ChatPanel editorRef={editorRef} />
      <Console />
      <div className="crt-overlay" aria-hidden />
    </>
  );
}

export function App() {
  const editorRef = useRef<StrudelEditorHandle>(null);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "theme-retro",
      store.getTheme() === "retro"
    );
  }, []);

  function markDone() {
    localStorage.setItem(ONBOARDING_KEY, "1");
  }

  return (
    <NextStepProvider>
      <NextStepReact
        steps={TOURS}
        onComplete={markDone}
        onSkip={markDone}
        disableConsoleLogs
      >
        <AppContent editorRef={editorRef} />
      </NextStepReact>
    </NextStepProvider>
  );
}
