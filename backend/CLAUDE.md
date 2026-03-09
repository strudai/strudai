# Backend

Python orchestration layer for StrudelGPT.

## Responsibilities

- FastAPI server with WebSocket bridge to the frontend
- Tool registry — decorator-based, Pydantic-validated, LLM-ready schema export
- Agentic logic — generating and modifying Strudel patterns via LLM (planned)

## Key files

- `app.py` — FastAPI app: WS endpoint `/ws`, REST endpoint `/api/tools`, static file serving
- `agent.py` — LangGraph agent: graph definition, LangChain tool wrappers, session management
- `ws.py` — `ConnectionManager`: single WS connection, request/response with `asyncio.Future`
- `tools/registry.py` — `@tool` decorator, `ToolRegistry` class
- `tools/strudel_*.py` — individual tool implementations
- `prompts/` — Jinja2 prompt templates (`.j2` files), rendered via `backend.prompts.render()`

## WebSocket protocol (JSON)

- **Backend → Frontend commands:** `{id, type:"command", action, params}`
- **Frontend → Backend responses:** `{id, type:"response", data}`
- **Frontend → Backend events:** `{type:"event", event:"chat_message", data:{text}}`
- **Backend → Frontend events:** `{type:"event", event:"chat_response", data:{text}}`

## Testing

- Tests live in `tests/backend/`, mirroring this directory's structure
- Run with `uv run pytest` (or `uv run pytest -v` for verbose)
- Use `pytest-asyncio` for async tests (`asyncio_mode = "auto"` in pyproject.toml)
- Mock `manager` (WebSocket layer) when testing tools in isolation
- Mock `registry` when testing agent tool wrappers in isolation

## Conventions

- All backend code lives in this directory
- Use `uv` for dependency management (root `pyproject.toml`)
- Python 3.13+
