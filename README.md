# StrudAI

An AI assistant for [Strudel](https://strudel.cc/), the browser-based live coding music platform. Self hosted at [strudai.com](https://strudai.com).

![StrudAI demo](docs/hans-demo.gif)

## Quick start

```bash
npm install
npm run dev
```

Open the local URL. Click **[ HANS ]** in the top-right to open the chat. Enter an API key in the settings panel (gear icon) to get started.

Two providers are supported — the key prefix is detected automatically:

| Provider | Key prefix | Where to get one |
|----------|------------|-----------------|
| **Anthropic** | `sk-ant-…` | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) |
| **OpenRouter** | `sk-or-…` | [openrouter.ai/settings/keys](https://openrouter.ai/settings/keys) |

You are billed directly by the provider for usage.

## How it works

Fully client-side, no backend. The app embeds a `<strudel-editor>` web component (via CDN) and calls the provider API directly from the browser using your key. The current editor code is injected into every system prompt so the agent always knows what is playing.

### Agent tools

| Tool | Description |
|------|-------------|
| `strudel_edit_code` | Targeted search-and-replace edit of the editor code |
| `strudel_rewrite_code` | Replace the entire editor contents and evaluate |
| `strudel_read_console` | Read recent console output to check for errors |
| `strudel_docs_search` | Search the official Strudel documentation |
| `sample_search` | Find Strudel sample packs and sound names |
| `example_search` | Search community Strudel patterns by keyword to understand chaining and function use |
| `web_search` | Live web search via server-side tool (Anthropic or OpenRouter native) |
| `plan_set` | Define the structure of a live set (songs, BPM, sections) |
| `start_set` | Begin bar-aligned live set playback |
| `stop_set` | End the active live set |

### Live set mode

Ask Hans to plan a set - e.g. *"plan a 20-minute techno set at 135 BPM"* - and he will call `plan_set` to lay out songs and bar-positioned section instructions. After you confirm, `start_set` launches a 500 ms tick loop that fires each section cue at the right bar, automatically rewriting the code as the set progresses. A collapsible set panel inside the chat shows the current song, bar position, and section notes in real time.

### Settings

- **Theme** — Retro (amber CRT, default) or Classic (dark purple)
- **Model** — choose from available models for your provider (OpenRouter shows a searchable list)
- **API key** — stored in `localStorage`, never sent anywhere except the provider API; provider is auto-detected from the key prefix (`sk-ant-` → Anthropic, `sk-or-` → OpenRouter)
- **Auto-fix** — when enabled, console errors trigger an automatic fix turn
- **Tools** — toggle individual tools on or off per category

The settings panel also shows token usage (cached vs. uncached input, output) for the current session.

## Project structure

```text
src/
  agent/
    api.ts              Anthropic + OpenRouter streaming wrapper with provider detection
    accent.ts           Germanises assistant text (Hans persona)
    audio-analyzer.ts   Web Audio FFT analyser tapped into Strudel's output node
    audio-intercept.ts  Patches AudioNode.connect to discover Strudel's audio graph
    canvas-intercept.ts Forces preserveDrawingBuffer on all WebGL contexts (Hydra capture)
    error-buffer.ts     Console error capture and subscription
    performer.ts        Autonomous performer agent for live set sections
    set-preplan.ts      Look-ahead pre-generation of upcoming live set sections
    set-state.ts        Live set state machine (plan, bars, markers)
    system-prompt.ts    Assembles system prompt from knowledge/*.md
    tools.ts            Tool definitions and executor
    types.ts            Shared types
    visual-capture.ts   Captures Hydra/Strudel canvas for the strudel_vision tool
  ui/
    ChatPanel.tsx       Main chat component with agentic loop
    Console.tsx         Floating console panel
    MessageBubble.tsx   Message rendering
    OnboardingCard.tsx  First-visit onboarding card (nextstepjs)
    SetPanel.tsx        Live set status panel inside the chat
    SettingsDrawer.tsx  API key, model, tool toggles, usage display
    StrudelEditor.tsx   Editor handle (getCode/setCode)
    index.css           All styles
  App.tsx               Root component + onboarding tour wiring
  main.tsx              Entry point
  store.ts              localStorage wrappers
knowledge/
  agent.md              Hand-written: Hans persona, tool guidance, behaviour rules
  set.md                Hand-written: live set mode instructions
  style.md              Hand-written: common-mistake corrections, style rules
  strudel.md            Generated: Strudel API reference (bundled at build time)
  hydra.md              Generated: Hydra visuals reference (bundled at build time)
  build.py              Run full knowledge pipeline (fetch + compress)
  fetch.py              Fetch upstream docs + examples for Strudel and Hydra
  compress.py           Compress raw fetched content into .md via Claude
docker/
  nginx/
    default.conf        Nginx virtual host config (prod + dev subdomains, TLS)
    security_headers.conf  CSP, HSTS, and other security headers
compose.yml             Docker Compose for self-hosted nginx deployment
index.html              Vite entry point + Strudel editor web component
```

The system prompt is assembled at bundle time from `knowledge/agent.md`, `knowledge/strudel.md`, `knowledge/hydra.md`, and `knowledge/style.md`. `knowledge/set.md` is only included when a live set is active. Edit each file independently to update the agent's behaviour or reference material.

## Knowledge pipeline

`knowledge/strudel.md` and `knowledge/hydra.md` are auto-generated from upstream sources. To rebuild both:

```bash
cd knowledge
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

## Deployment

The app builds to a static `dist/` folder. The included Docker Compose setup serves it with nginx on `strudai.com`, with a separate `dev.strudai.com` virtual host for preview builds. Nginx is configured with security headers (CSP, HSTS, `X-Frame-Options`) and long-lived caching for Vite-fingerprinted assets.

```bash
npm run build
docker compose up -d
```

## Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Onboarding**: nextstepjs
- **API**: Anthropic SDK + OpenAI SDK (client-side, user-provided key; supports Anthropic and OpenRouter)
- **Editor**: Strudel REPL web component via CDN
- **Hosting**: nginx + Docker Compose

## Thank you & Reflections

This project is a thin wrapper around [Strudel](https://strudel.cc), a beautiful live coding environment by Alex McLean, Felix Roos, and contributors that runs entirely in the browser. If you enjoy it, consider [supporting Tidal Cycles](https://opencollective.com/tidalcycles).

Community examples sourced from [awesome-strudel](https://github.com/terryds/awesome-strudel) and [strudel-songs-collection](https://github.com/eefano/strudel-songs-collection).

I know that this goes against much of the ethos around live coding. I really love how creative the scene is, and don't want to take anything away from that. It was a fun engineering/data science challenge to try to get my computer to play (shitty) autonomous live sets for me anyway, which is why I built this. A lot of respect to all the creators above!

## License

Copyright (C) 2026 Douwe van der Heijden

This program is free software: you can redistribute it and/or modify it under the terms of the [GNU Affero General Public License](LICENSE) as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

StrudelGPT is built on top of [Strudel](https://strudel.cc/), which is also licensed under the AGPL-3.0.
