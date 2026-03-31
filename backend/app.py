import asyncio
import logging
import time
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

load_dotenv()

from backend.accent import germanise
from backend.agents import (
    AVAILABLE_MODELS,
    DEFAULT_MODEL,
    chat_respond,
    fixer_respond,
    performer_respond,
)
from backend.tools import registry
from backend.connection import manager

_selected_model: str = DEFAULT_MODEL
_selected_performer_model: str = DEFAULT_MODEL

logger = logging.getLogger(__name__)

app = FastAPI(title="StrudelGPT")

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"

_background_tasks: set[asyncio.Task] = set()
_current_chat_task: asyncio.Task | None = None
_performer_task: asyncio.Task | None = None
_fixer_task: asyncio.Task | None = None
_error_trigger_enabled: bool = False

# Fixer loop-prevention state
_fixer_attempt_count: int = 0
_fixer_last_errors: set[str] = set()
_fixer_last_run: float = 0.0
_FIXER_MAX_ATTEMPTS = 3
_FIXER_COOLDOWN = 5.0

# Set state for performer section tracking
_active_plan: dict | None = None
_bar_markers: list[dict] = []  # [{ bar, song_name, song_description, foundation, note }]
_last_performer_section_bar: int = -1
_last_performer_song: str | None = None


def _build_bar_markers(plan: dict) -> list[dict]:
    """Build sorted list of bar markers with song context for the performer."""
    markers = []
    offset = 0
    for song in plan["songs"]:
        for section in song["sections"]:
            markers.append({
                "bar": offset + section["bar"],
                "song_name": song["name"],
                "song_description": song["description"],
                "foundation": song.get("foundation", ""),
                "note": section["note"],
            })
        offset += song["bars"]
    return sorted(markers, key=lambda m: m["bar"])


@app.get("/api/tools")
async def get_tools() -> JSONResponse:
    return JSONResponse(registry.to_schemas())


@app.get("/api/models")
async def get_models() -> JSONResponse:
    return JSONResponse({
        "models": AVAILABLE_MODELS,
        "selected": _selected_model,
        "performer_selected": _selected_performer_model,
    })


async def _handle_chat(text: str, session_id: str, api_key: str) -> None:
    async def on_event(event_type: str, data: dict) -> None:
        try:
            await manager.send_event(f"agent_{event_type}", data)
        except RuntimeError:
            logger.debug("Skipping agent event %s — no frontend connected", event_type)

    try:
        code = await registry.execute("strudel_read_code")
        current_code = code.get("code", "")
        text = f"[Current code in editor]\n```\n{current_code}\n```\n\n{text}"
        response_text = await chat_respond(text, session_id, api_key=api_key, on_event=on_event, model=_selected_model)
    except asyncio.CancelledError:
        logger.info("Agent task cancelled")
        return
    except Exception:
        logger.exception("agent_respond failed")
        response_text = "Sorry, something went wrong. Please try again."

    response_text = germanise(response_text)
    try:
        await manager.send_event("chat_response", {"text": response_text})
    except RuntimeError:
        logger.warning("Could not send chat response — no frontend connected")


def _activate_set(plan: dict) -> None:
    """Store the plan and build bar markers for performer section tracking."""
    global _active_plan, _bar_markers, _last_performer_section_bar, _last_performer_song
    _active_plan = plan
    _bar_markers = _build_bar_markers(plan)
    _last_performer_section_bar = -1
    _last_performer_song = None


def _deactivate_set() -> None:
    """Clear set state and cancel performer if running."""
    global _active_plan, _bar_markers, _last_performer_section_bar, _last_performer_song, _performer_task
    _active_plan = None
    _bar_markers = []
    _last_performer_section_bar = -1
    _last_performer_song = None
    if _performer_task and not _performer_task.done():
        _performer_task.cancel()
        _performer_task = None


async def _handle_performer_section(marker: dict, session_id: str, api_key: str) -> None:
    """Launch the performer agent for a new section."""
    global _last_performer_song

    async def on_event(event_type: str, data: dict) -> None:
        try:
            await manager.send_event(f"performer_{event_type}", data)
        except RuntimeError:
            logger.debug("Skipping performer event %s — no frontend connected", event_type)

    is_new_song = _last_performer_song != marker["song_name"]
    _last_performer_song = marker["song_name"]

    prompt_vars = {
        "title": _active_plan["title"],
        "genre": _active_plan["genre"],
        "bpm": _active_plan["bpm"],
        "instructions": _active_plan.get("instructions", ""),
        "song_name": marker["song_name"],
        "song_description": marker["song_description"],
        "foundation": marker.get("foundation", ""),
        "is_new_song": is_new_song,
    }

    instruction = marker["note"]
    performer_session = f"{session_id}_performer_bar{marker['bar']}"

    try:
        await performer_respond(
            instruction,
            performer_session,
            api_key=api_key,
            on_event=on_event,
            model=_selected_performer_model,
            prompt_vars=prompt_vars,
        )
    except asyncio.CancelledError:
        logger.info("Performer task cancelled")
    except Exception:
        logger.exception("performer_respond failed")


def _get_section_at_cycle(cycle: int) -> dict | None:
    """Find the bar marker for the current cycle."""
    current = None
    for m in _bar_markers:
        if m["bar"] <= cycle:
            current = m
        else:
            break
    return current


def __reset_fixer_state() -> None:
    global _fixer_attempt_count, _fixer_last_errors, _fixer_last_run
    _fixer_attempt_count = 0
    _fixer_last_errors = set()
    _fixer_last_run = 0.0


def _should_run_fixer(errors: list[str]) -> bool:
    """Check cooldown and dedup. Returns True if the fixer should run."""
    global _fixer_attempt_count, _fixer_last_errors, _fixer_last_run

    now = time.monotonic()
    if now - _fixer_last_run < _FIXER_COOLDOWN:
        logger.info("Fixer skipped — cooldown active")
        return False

    error_set = set(errors)
    if error_set == _fixer_last_errors:
        _fixer_attempt_count += 1
        if _fixer_attempt_count >= _FIXER_MAX_ATTEMPTS:
            logger.warning("Fixer giving up after %d attempts on the same errors", _FIXER_MAX_ATTEMPTS)
            return False
    else:
        _fixer_attempt_count = 1
        _fixer_last_errors = error_set

    return True


async def _handle_fixer(errors: list[str], session_id: str, api_key: str) -> None:
    """Launch the fixer agent for a batch of console errors."""
    global _fixer_last_run

    if not _should_run_fixer(errors):
        return

    async def on_event(event_type: str, data: dict) -> None:
        try:
            await manager.send_event(f"fixer_{event_type}", data)
        except RuntimeError:
            logger.debug("Skipping fixer event %s — no frontend connected", event_type)

    try:
        await fixer_respond(
            errors, f"{session_id}_fixer",
            api_key=api_key, on_event=on_event, model=_selected_model,
        )
    except asyncio.CancelledError:
        logger.info("Fixer task cancelled")
    except Exception:
        logger.exception("fixer_respond failed")

    _fixer_last_run = time.monotonic()

    try:
        await manager.send_event("fixer_done", {})
    except RuntimeError:
        pass


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket) -> None:
    await manager.connect(ws)
    try:
        while True:
            data = await ws.receive_json()
            msg_type = data.get("type")

            if msg_type == "response":
                manager.resolve(data["id"], data.get("data", {}))

            elif msg_type == "event":
                global _current_chat_task, _performer_task, _fixer_task
                global _selected_model, _selected_performer_model
                global _error_trigger_enabled, _last_performer_section_bar
                event = data.get("event")
                if event == "chat_message":
                    payload = data.get("data", {})
                    text = payload.get("text", "")
                    api_key = payload.get("api_key", "")
                    task = asyncio.create_task(_handle_chat(text, manager.session_id, api_key))
                    _current_chat_task = task
                    _background_tasks.add(task)
                    task.add_done_callback(_background_tasks.discard)
                elif event == "stop_agent":
                    if _current_chat_task and not _current_chat_task.done():
                        _current_chat_task.cancel()
                        _current_chat_task = None
                    if _fixer_task and not _fixer_task.done():
                        _fixer_task.cancel()
                        _fixer_task = None
                elif event == "stop_set":
                    _deactivate_set()
                elif event == "set_model":
                    model = data.get("data", {}).get("model", "")
                    if model in AVAILABLE_MODELS:
                        _selected_model = model
                elif event == "set_performer_model":
                    model = data.get("data", {}).get("model", "")
                    if model in AVAILABLE_MODELS:
                        _selected_performer_model = model
                elif event == "set_error_trigger":
                    _error_trigger_enabled = data.get("data", {}).get("enabled", False)
                    if not _error_trigger_enabled:
                        if _fixer_task and not _fixer_task.done():
                            _fixer_task.cancel()
                            _fixer_task = None
                        _reset_fixer_state()
                elif event == "console_errors":
                    if not _error_trigger_enabled:
                        continue
                    # Skip if performer is active (performer self-fixes)
                    if _performer_task and not _performer_task.done():
                        continue
                    errors = data.get("data", {}).get("errors", [])
                    api_key = data.get("data", {}).get("api_key", "")
                    if not errors or not api_key:
                        continue
                    if _fixer_task and not _fixer_task.done():
                        _fixer_task.cancel()
                    task = asyncio.create_task(
                        _handle_fixer(errors, manager.session_id, api_key)
                    )
                    _fixer_task = task
                    _background_tasks.add(task)
                    task.add_done_callback(_background_tasks.discard)
                elif event == "cycle_update":
                    if _active_plan is None:
                        from backend.tools.set_plan import get_current_plan
                        plan = get_current_plan()
                        if plan:
                            _activate_set(plan)
                        else:
                            continue
                    cycle = data.get("data", {}).get("cycle", -1)
                    section = _get_section_at_cycle(cycle)
                    if section and section["bar"] != _last_performer_section_bar:
                        _last_performer_section_bar = section["bar"]
                        api_key = data.get("data", {}).get("api_key", "")
                        if not api_key:
                            # Fall back — get from localStorage via a best-effort approach
                            api_key = ""
                        # Cancel previous performer task if still running
                        if _performer_task and not _performer_task.done():
                            _performer_task.cancel()
                        task = asyncio.create_task(
                            _handle_performer_section(section, manager.session_id, api_key)
                        )
                        _performer_task = task
                        _background_tasks.add(task)
                        task.add_done_callback(_background_tasks.discard)
    except WebSocketDisconnect:
        manager.disconnect()


@app.get("/")
async def index() -> FileResponse:
    return FileResponse(FRONTEND_DIR / "index.html")


@app.get("/favicon.ico")
async def favicon() -> FileResponse:
    return FileResponse(FRONTEND_DIR / "public" / "hans_logo.svg", media_type="image/svg+xml")


@app.get("/apple-touch-icon.png")
@app.get("/apple-touch-icon-precomposed.png")
async def apple_touch_icon() -> FileResponse:
    return FileResponse(FRONTEND_DIR / "public" / "hans_logo.svg", media_type="image/svg+xml")


# Serve other static frontend files
app.mount("/", StaticFiles(directory=str(FRONTEND_DIR)), name="frontend")
