# StrudelGPT

An AI assistant for [Strudel](https://strudel.cc/), the browser-based live coding music platform. Chat with "Hans Strudel" to create, modify, and understand Strudel patterns — the agent reads your editor, writes code, checks the console, and searches the web.

## Quick start

```bash
# Install dependencies
uv sync

# Add your API key
echo 'CLAUDE_API_KEY=sk-ant-...' > .env

# Run
uv run main.py
```

Open http://localhost:8000. The Strudel editor is on the left, the chat panel toggles from the bottom-right.

## How it works

The frontend embeds a `<strudel-repl>` iframe and connects to the backend over WebSocket. When you send a chat message, the LangGraph agent (Claude Haiku) processes it and can use tools to interact with the editor:

| Tool | Description |
|------|-------------|
| `strudel_read_code` | Read current code from the editor |
| `strudel_update_code` | Write and evaluate new code |
| `strudel_read_console` | Check for errors or logs |
| `web_search` | Search Strudel docs and examples |

## Project structure

```
backend/
  app.py              FastAPI server, WebSocket endpoint, static files
  agent.py            LangGraph agent with tool bindings
  ws.py               WebSocket connection manager
  tools/              Tool implementations + registry
  prompts/            Jinja2 system prompt template
  knowledge/
    fetch.py           Fetch Strudel docs from Codeberg
    fetch_examples.py  Fetch community examples from awesome-strudel
    compress.py        Compress docs + examples into agent context
    raw/               Source markdown files (fetched)
    compressed.md      Generated brief reference (gitignored)
frontend/
  index.html          UI — Strudel embed + chat panel (vanilla HTML/TS)
  theme.css           Dark theme
tests/                Mirrors backend structure
```

## Knowledge pipeline

The agent loads a compressed reference at startup for better Strudel code generation. To build or refresh it:

```bash
# Fetch raw docs from Codeberg (optional — already committed)
uv run python -m backend.knowledge.fetch

# Fetch community examples from awesome-strudel
uv run python -m backend.knowledge.fetch_examples

# Compress into ~2k token reference (requires CLAUDE_API_KEY)
uv run python -m backend.knowledge.compress
```

To add more knowledge, drop `.md` files into `backend/knowledge/raw/` and re-run the compress step.

## Testing

```bash
uv run pytest           # run all tests
uv run pytest -v        # verbose output
```

## Stack

- **Backend**: Python 3.13, FastAPI, LangGraph, LangChain, Claude API
- **Frontend**: Vanilla HTML/TypeScript, Strudel embed via CDN
- **Tools**: uv (Python), pytest
