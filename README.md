# StrudAI

An AI assistant for [Strudel](https://strudel.cc/), the browser-based live coding music platform. Chat with "Hans Strudel" to create, modify, and understand Strudel patterns.

## Quick start

```bash
npm install
npm run dev
```

Open the local URL. Click the Hans Strudel icon in the top-right to open the chat panel. Set your Anthropic API key in the settings menu (gear icon) to get started.

## How it works

Fully client-side — no backend. The app embeds a `<strudel-editor>` web component (via CDN) and calls the Anthropic API directly from the browser using your API key. The editor code is injected into the system prompt with each message so the agent always knows what's playing.

### Tools

| Tool | Description |
|------|-------------|
| `strudel_edit_code` | Search-and-replace a section of the editor code |
| `strudel_rewrite_code` | Replace the entire editor contents and evaluate |

### Settings

- **Model** — choose between Haiku, Sonnet, or Opus
- **API key** — stored in `localStorage`, never sent anywhere except the Anthropic API

The settings menu also shows token usage for the current session.

## Project structure

```text
src/
  agent/
    api.ts              Anthropic SDK streaming wrapper
    system-prompt.ts    Assembles system prompt from prompts/*.md
    tools.ts            Tool definitions and executor
    types.ts            Shared types
  ui/
    ChatPanel.tsx       Main chat component with agentic loop
    MessageBubble.tsx   Message rendering
    SettingsDrawer.tsx  API key, model select, usage display
    StrudelEditor.tsx   Editor handle (getCode/setCode)
    index.css           All styles
  App.tsx               Root component
  main.tsx              Entry point
  store.ts              localStorage wrappers
prompts/
  agent.md              Hand-written: personality + tool guidance
  style.md              Hand-written: common-mistake corrections / style rules
  strudel.md            Generated: Strudel API reference (bundled at build time)
  hydra.md              Generated: Hydra (visuals) reference (bundled at build time)
  build.py              Run full pipeline (fetch + compress, both domains)
  fetch.py              Fetch upstream docs + examples for Strudel and Hydra
  compress.py           Compress raw into the .md references via Claude
index.html              Vite entry point + Strudel editor
```

The system prompt is assembled at bundle time by joining `agent.md`, `strudel.md`, `hydra.md`, and `style.md` (in that order). Edit each file independently to update the agent's behaviour, style rules, or reference material.

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
- **API**: Anthropic SDK (client-side, user-provided key)
- **Editor**: Strudel REPL web component via CDN

## Thank you

This project is a thin wrapper around [Strudel](https://strudel.cc/) — a beautiful live coding environment by Alex McLean and contributors that runs entirely in the browser. If you enjoy it, consider [supporting Tidal Cycles](https://opencollective.com/tidalcycles).

To instruct the model on how to make strudel code, I pull some examples. Community examples sourced from [awesome-strudel](https://github.com/terryds/awesome-strudel) and [strudel-songs-collection](https://github.com/eefano/strudel-songs-collection).
