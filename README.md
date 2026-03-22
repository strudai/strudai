# StrudelGPT

An AI assistant for [Strudel](https://strudel.cc/), the browser-based live coding music platform. Chat with "Hans Strudel" to create, modify, and understand Strudel patterns.

## Quick start

```bash
# Install dependencies
uv sync

# Run
uv run main.py
```

Open <http://localhost:8000>. Click the Hans Strudel icon in the top-right to open the chat panel. Set your Anthropic API key in the settings menu (gear icon) to get started.

## How it works

The frontend embeds a `<strudel-editor>` web component (via `@strudel/repl` CDN) and connects to the backend over WebSocket. The editor code is automatically sent with each chat message so the agent always knows what's playing. Responses are post-processed with a light German accent.

### Tools

| Tool | Description |
|------|-------------|
| `strudel_read_code` | Read current code from the editor |
| `strudel_update_code` | Write and evaluate new code |
| `strudel_read_console` | Check for errors or logs |
| `strudel_docs_search` | Search official Strudel documentation (Algolia) |
| `sample_search` | Find sample packs and sounds by name |
| `web_search` | General web search (DuckDuckGo) |

### Settings

- **Model** — choose between Haiku (fast/cheap, default), Sonnet (balanced), or Opus (most capable)
- **API key** — stored in your browser's `localStorage`, never on the server. Each user brings their own key.

## Project structure

```text
backend/
  app.py              FastAPI server, WebSocket endpoint, static files
  agent.py            LangGraph agent with tool bindings
  accent.py           German accent post-processing
  ws.py               WebSocket connection manager
  tools/              Tool implementations + registry
  prompts/            Jinja2 system prompt template
  knowledge/
    build.py           Run full pipeline (fetch + compress)
    fetch.py           Fetch Strudel docs from Codeberg
    fetch_examples.py  Fetch community examples from awesome-strudel
    compress.py        Compress docs + examples into agent context
    raw/               Source markdown files (fetched)
    compressed.md      Generated brief reference (gitignored)
frontend/
  index.html          UI shell — Strudel editor + chat panel
  app.js              WebSocket client, chat logic, settings, console
  styles.css          Component styles
  theme.css           Design tokens (colors, spacing)
  public/             Static assets (logo)
tests/                Mirrors backend structure
```

## Knowledge pipeline

The agent loads a compressed reference at startup for better Strudel code generation. To build or refresh it:

```bash
# Run the full pipeline: fetch docs, fetch examples, compress
uv run python -m backend.knowledge.build
```

Or run individual steps:

```bash
uv run python -m backend.knowledge.fetch            # fetch docs from Codeberg
uv run python -m backend.knowledge.fetch_examples    # fetch community examples
uv run python -m backend.knowledge.compress          # compress into ~2k token reference
```

To add more knowledge, drop `.md` files into `backend/knowledge/raw/` and re-run the compress step.

## Testing

```bash
uv run pytest           # run all tests
uv run pytest -v        # verbose output
```

## Stack

- **Backend**: Python 3.13, FastAPI, LangGraph, LangChain, Claude API
- **Frontend**: Vanilla HTML/JS, Strudel embed via `@strudel/repl` CDN
- **Tools**: uv (Python), pytest
