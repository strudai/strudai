import asyncio
import uuid

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.connection: WebSocket | None = None
        self.session_id: str = ""
        self._pending: dict[str, asyncio.Future[dict]] = {}

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        self.connection = ws
        self.session_id = uuid.uuid4().hex

    def disconnect(self) -> None:
        self.connection = None
        # Cancel any pending futures
        for fut in self._pending.values():
            if not fut.done():
                fut.cancel()
        self._pending.clear()

    async def send_event(self, event: str, data: dict) -> None:
        if self.connection is None:
            raise RuntimeError("No frontend connected")
        await self.connection.send_json({"type": "event", "event": event, "data": data})

    async def request_from_frontend(self, action: str, params: dict | None = None) -> dict:
        """Send a command to the frontend and wait for its response."""
        if self.connection is None:
            raise RuntimeError("No frontend connected")
        msg_id = uuid.uuid4().hex[:8]
        future: asyncio.Future[dict] = asyncio.get_running_loop().create_future()
        self._pending[msg_id] = future
        await self.connection.send_json({
            "id": msg_id,
            "type": "command",
            "action": action,
            "params": params or {},
        })
        try:
            return await asyncio.wait_for(future, timeout=10.0)
        finally:
            self._pending.pop(msg_id, None)

    def resolve(self, msg_id: str, data: dict) -> None:
        """Resolve a pending request future with the frontend's response."""
        fut = self._pending.get(msg_id)
        if fut and not fut.done():
            fut.set_result(data)


manager = ConnectionManager()
