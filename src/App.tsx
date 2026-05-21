// Copyright (C) 2025 Douwe van der Heijden
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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
        content: (
          <span>
            The code editor occupies the full background. Write Strudel patterns
            there, the audio will play if you run them.
            <br />
            <br />
            <strong style={{ color: "var(--text-primary)" }}>
              Ctrl+Enter
            </strong>{" "}
            to play &nbsp;·&nbsp;{" "}
            <strong style={{ color: "var(--text-primary)" }}>Ctrl+.</strong> to
            stop
          </span>
        ),
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
              console.anthropic.com            </a>
            . Enter it in the settings panel (&#x2699;) inside the chat. You
            will be billed by Anthropic for API usage.
          </span>
        ),
      },
      {
        icon: null,
        title: "What to ask Hans",
        content: (
          <span>
            Hans reads the code in your editor before every reply, no need to copy paste it.
            <br />
            <br />
            <strong style={{ color: "var(--text-primary)" }}>
              Songs
            </strong>{" "}
            — "write me a dark techno groove at 130 BPM"
            <br />
            <strong style={{ color: "var(--text-primary)" }}>
              Visuals
            </strong>{" "}
            — "add some visuals that react to the kick"
            <br />
            <strong style={{ color: "var(--text-primary)" }}>
              Live sets
            </strong>{" "}
            — "plan a 3-song minimal house set and play it"
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
            , a live coding environment by Alex McLean, Felix Roos and contributors. If you
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
      {
        icon: null,
        title: "Open Source",
        content: (
          <span>
            StrudAI runs entirely on your computer — no servers, no telemetry.
            The source is released under the{" "}
            <strong style={{ color: "var(--text-primary)" }}>AGPL-3.0</strong>{" "}
            licence and available on{" "}
            <a
              href="https://github.com/strudai/strudai"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--accent)", textDecoration: "underline" }}
            >
              GitHub
            </a>
            . Contributions welcome.
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
        clickThroughOverlay
        disableConsoleLogs
      >
        <AppContent editorRef={editorRef} />
      </NextStepReact>
    </NextStepProvider>
  );
}
