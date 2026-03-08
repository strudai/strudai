# Backend

Python orchestration layer for StrudelGPT.

## Responsibilities

- FastAPI server with WebSocket bridge to the frontend
- Tool registry — decorator-based, Pydantic-validated, LLM-ready schema export
- Agentic logic — generating and modifying Strudel patterns via LLM (planned)

## Key files

- `app.py` — FastAPI app: WS endpoint `/ws`, REST endpoint `/api/tools`, static file serving
- `ws.py` — `ConnectionManager`: single WS connection, request/response with `asyncio.Future`
- `tools/registry.py` — `@tool` decorator, `ToolRegistry` class
- `tools/strudel_*.py` — individual tool implementations

## WebSocket protocol (JSON)

- **Backend → Frontend commands:** `{id, type:"command", action, params}`
- **Frontend → Backend responses:** `{id, type:"response", data}`
- **Frontend → Backend events:** `{type:"event", event:"chat_message", data:{text}}`
- **Backend → Frontend events:** `{type:"event", event:"chat_response", data:{text}}`

## Conventions

- All backend code lives in this directory
- Use `uv` for dependency management (root `pyproject.toml`)
- Python 3.13+
