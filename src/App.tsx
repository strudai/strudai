import { useRef, useEffect } from "react";
import type { StrudelEditorHandle } from "./agent/types";
import { StrudelEditor } from "./ui/StrudelEditor";
import { ChatPanel } from "./ui/ChatPanel";
import { Console } from "./ui/Console";
import * as store from "./store";
import { NextStepProvider, NextStepReact, useNextStep } from "nextstepjs";
import type { Tour } from "nextstepjs";
import { OnboardingCard } from "./ui/OnboardingCard";

const ONBOARDING_KEY = "strudelgpt_onboarding_done";

// Step index at which #hans-panel should be highlighted (0-based).
const HANS_STEP_INDEX = 2;

const TOURS: Tour[] = [
  {
    tour: "welcome",
    steps: [
      {
        icon: null,
        title: "Welcome to StrudAI",
        content: (
          <span>
            StrudAI is an AI assistant for{" "}
            <strong style={{ color: "var(--text-primary)" }}>Strudel</strong> —
            a browser-based live coding environment for music. Write patterns in
            the editor and the audio plays instantly, no installation required.
          </span>
        ),
      },
      {
        icon: null,
        title: "The Editor",
        content:
          "The code editor occupies the full background. Write Strudel patterns there and use the play controls to hear them. You can edit while the music is running.",
      },
      {
        icon: null,
        title: "Hans Strudel",
        content: (
          <span>
            The <strong style={{ color: "var(--text-primary)" }}>[ HANS ]</strong>{" "}
            panel in the top-right corner opens a chat with an AI assistant.
            Describe the music you want and Hans will write or modify the code
            for you.
            <br />
            <br />
            An Anthropic API key is required. You can create one at{" "}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--accent)", textDecoration: "underline" }}
            >
              console.anthropic.com
            </a>
            . Enter it in the settings panel (&#x2699;) inside the chat.
          </span>
        ),
      },
      {
        icon: null,
        title: "Built on Strudel",
        content: (
          <span>
            StrudAI is a thin wrapper around{" "}
            <a
              href="https://strudel.cc"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--accent)", textDecoration: "underline" }}
            >
              Strudel
            </a>
            , a live coding environment by Alex McLean and contributors. If you
            enjoy it, please consider{" "}
            <a
              href="https://opencollective.com/tidalcycles"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--accent)", textDecoration: "underline" }}
            >
              supporting Tidal Cycles
            </a>
            .
          </span>
        ),
      },
    ],
  },
];

function AppContent({
  editorRef,
}: {
  editorRef: React.RefObject<StrudelEditorHandle | null>;
}) {
  const { startNextStep, currentStep, currentTour, isNextStepVisible } =
    useNextStep();

  // Auto-start tour on first visit.
  useEffect(() => {
    if (!localStorage.getItem(ONBOARDING_KEY)) {
      startNextStep("welcome");
    }
  }, [startNextStep]);

  // Pulse-highlight the Hans panel while that step is active.
  useEffect(() => {
    const el = document.getElementById("hans-panel");
    if (!el) return;
    const active =
      isNextStepVisible &&
      currentTour === "welcome" &&
      currentStep === HANS_STEP_INDEX;
    el.classList.toggle("onboarding-highlight", active);
    return () => el.classList.remove("onboarding-highlight");
  }, [isNextStepVisible, currentTour, currentStep]);

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
        cardComponent={OnboardingCard}
        onComplete={markDone}
        onSkip={markDone}
        shadowRgb="0, 0, 0"
        shadowOpacity="0.6"
        disableConsoleLogs
      >
        <AppContent editorRef={editorRef} />
      </NextStepReact>
    </NextStepProvider>
  );
}
