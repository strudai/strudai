# StrudAI

An AI assistant for [Strudel](https://strudel.cc/), the browser-based live coding music platform. Chat with "Hans Strudel" to create, modify, and understand Strudel patterns — or hand the wheel to Hans entirely and run a bar-aligned live set.

## Quick start

```bash
npm install
npm run dev
```

Open the local URL. Click **[ HANS ]** in the top-right to open the chat. Enter your Anthropic API key in the settings panel (gear icon) to get started. An API key can be created at [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) — you are billed directly by Anthropic for usage.

## How it works

Fully client-side — no backend. The app embeds a `<strudel-editor>` web component (via CDN) and calls the Anthropic API directly from the browser using your key. The current editor code is injected into every system prompt so the agent always knows what is playing.

### Tools

| Tool | Description |
|------|-------------|
| `strudel_edit_code` | Targeted search-and-replace edit of the editor code |
| `strudel_rewrite_code` | Replace the entire editor contents and evaluate |
| `strudel_read_console` | Read recent console output to check for errors |
| `strudel_docs_search` | Search the official Strudel documentation |
| `sample_search` | Find Strudel sample packs and sound names |
| `example_search` | Search community Strudel patterns by keyword |
| `web_search` | Live web search (server-side, billed separately) |
| `plan_set` | Define the structure of a live set (songs, BPM, sections) |
| `start_set` | Begin bar-aligned live set playback |
| `stop_set` | End the active live set |

### Live set mode

Ask Hans to plan a set — e.g. *"plan a 20-minute techno set at 135 BPM"* — and he will call `plan_set` to lay out songs and bar-positioned section instructions. After you confirm, `start_set` launches a 500 ms tick loop that fires each section cue at the right bar, automatically rewriting the code as the set progresses. A collapsible set panel inside the chat shows the current song, bar position, and section notes in real time.

### Settings

- **Theme** — Retro (amber CRT, default) or Classic (dark purple)
- **Model** — choose from available Anthropic models
- **API key** — stored in `localStorage`, never sent anywhere except the Anthropic API
- **Auto-fix** — when enabled, console errors trigger an automatic fix turn
- **Tools** — toggle individual tools on or off per category

The settings panel also shows token usage (cached vs. uncached input, output) for the current session.

## Project structure

```text
src/
  agent/
    api.ts              Anthropic SDK streaming wrapper
    accent.ts           Germanises assistant text (Hans persona)
    error-buffer.ts     Console error capture and subscription
    set-state.ts        Live set state machine (plan, bars, markers)
    system-prompt.ts    Assembles system prompt from prompts/*.md
    tools.ts            Tool definitions and executor
    types.ts            Shared types
  ui/
    App.tsx             Root component + onboarding tour wiring
    ChatPanel.tsx       Main chat component with agentic loop
    Console.tsx         Floating console panel
    MessageBubble.tsx   Message rendering
    OnboardingCard.tsx  First-visit onboarding card (nextstepjs)
    SetPanel.tsx        Live set status panel inside the chat
    SettingsDrawer.tsx  API key, model, tool toggles, usage display
    StrudelEditor.tsx   Editor handle (getCode/setCode)
    index.css           All styles
  main.tsx              Entry point
  store.ts              localStorage wrappers
  stubs/
    next-navigation.ts  Stub for nextstepjs's unused Next.js adapter
prompts/
  agent.md              Hand-written: personality + tool guidance
  set.md                Hand-written: live set mode instructions
  style.md              Hand-written: common-mistake corrections / style rules
  strudel.md            Generated: Strudel API reference (bundled at build time)
  hydra.md              Generated: Hydra (visuals) reference (bundled at build time)
  build.py              Run full pipeline (fetch + compress, both domains)
  fetch.py              Fetch upstream docs + examples for Strudel and Hydra
  compress.py           Compress raw into the .md references via Claude
index.html              Vite entry point + Strudel editor web component
```

The system prompt is assembled at bundle time by joining `agent.md`, `set.md`, `strudel.md`, `hydra.md`, and `style.md`. Edit each file independently to update the agent's behaviour or reference material.

## Knowledge pipeline

`prompts/strudel.md` and `prompts/hydra.md` are auto-generated. To rebuild both:

```bash
cd prompts
uv run --with anthropic --with python-dotenv python build.py
```

Or run individual steps:

```bash
uv run python fetch.py              # fetch all (docs + examples + hydra)
uv run python fetch.py docs         # Strudel docs only
uv run python fetch.py examples     # Strudel community examples only
uv run python fetch.py hydra        # Hydra sources only
uv run --with anthropic --with python-dotenv python compress.py          # compress both
uv run --with anthropic --with python-dotenv python compress.py strudel  # only strudel.md
uv run --with anthropic --with python-dotenv python compress.py hydra    # only hydra.md
```

Requires `ANTHROPIC_API_KEY` env var (or `.env` file) for compression.

## Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Onboarding**: nextstepjs
- **API**: Anthropic SDK (client-side, user-provided key)
- **Editor**: Strudel REPL web component via CDN

## Thank you

This project is a thin wrapper around [Strudel](https://strudel.cc) — a beautiful live coding environment by Alex McLean, Felix Roos, and contributors that runs entirely in the browser. If you enjoy it, consider [supporting Tidal Cycles](https://opencollective.com/tidalcycles).

Community examples sourced from [awesome-strudel](https://github.com/terryds/awesome-strudel) and [strudel-songs-collection](https://github.com/eefano/strudel-songs-collection).
