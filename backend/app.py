import asyncio
import logging
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

load_dotenv()

from backend.agent import agent_respond
from backend.tools import registry
from backend.ws import manager

logger = logging.getLogger(__name__)

app = FastAPI(title="StrudelGPT")

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"

_background_tasks: set[asyncio.Task] = set()


@app.get("/api/tools")
async def get_tools() -> JSONResponse:
    return JSONResponse(registry.to_schemas())


async def _handle_chat(text: str, session_id: str) -> None:
    try:
        response_text = await agent_respond(text, session_id)
    except Exception:
        logger.exception("agent_respond failed")
        response_text = "Sorry, something went wrong. Please try again."
    await manager.send_event("chat_response", {"text": response_text})


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
                event = data.get("event")
                if event == "chat_message":
                    text = data.get("data", {}).get("text", "")
                    task = asyncio.create_task(_handle_chat(text, manager.session_id))
                    _background_tasks.add(task)
                    task.add_done_callback(_background_tasks.discard)
    except WebSocketDisconnect:
        manager.disconnect()


@app.get("/")
async def index() -> FileResponse:
    return FileResponse(FRONTEND_DIR / "index.html")


# Serve other static frontend files
app.mount("/", StaticFiles(directory=str(FRONTEND_DIR)), name="frontend")
