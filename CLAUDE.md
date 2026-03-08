# CLAUDE.md

## Project

StrudelGPT — agentic capabilities for [Strudel](https://strudel.cc/), a live coding music platform.

## Structure

- `backend/` — Python orchestration layer (API server, agentic logic)
- `frontend/` — Lightweight web UI that embeds Strudel via iframe
- `main.py` — Application entrypoint

## Build & Run

- `uv run main.py` — starts FastAPI server on http://localhost:8000
- `uv add <pkg>` — add a dependency
- `uv sync` — install/sync dependencies

## Stack

- **Back-end**: Python 3.13 — orchestration, agentic logic, API server
- **Front-end**: HTML, TypeScript — thin layer embedding Strudel in an iframe
- **Package managers**: uv (Python), npm/bun (JS — TBD)
