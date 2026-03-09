import asyncio
from unittest.mock import AsyncMock

import pytest

from backend.ws import ConnectionManager


@pytest.fixture
def mgr():
    return ConnectionManager()


class TestConnect:
    @pytest.mark.asyncio
    async def test_connect_accepts_and_stores(self, mgr):
        ws = AsyncMock()
        await mgr.connect(ws)
        ws.accept.assert_awaited_once()
        assert mgr.connection is ws
        assert len(mgr.session_id) > 0

    @pytest.mark.asyncio
    async def test_connect_generates_unique_session_ids(self, mgr):
        ws1 = AsyncMock()
        await mgr.connect(ws1)
        sid1 = mgr.session_id

        ws2 = AsyncMock()
        await mgr.connect(ws2)
        sid2 = mgr.session_id

        assert sid1 != sid2


class TestDisconnect:
    @pytest.mark.asyncio
    async def test_disconnect_clears_connection(self, mgr):
        ws = AsyncMock()
        await mgr.connect(ws)
        mgr.disconnect()
        assert mgr.connection is None

    @pytest.mark.asyncio
    async def test_disconnect_cancels_pending_futures(self, mgr):
        ws = AsyncMock()
        await mgr.connect(ws)
        future = asyncio.get_event_loop().create_future()
        mgr._pending["abc"] = future
        mgr.disconnect()
        assert future.cancelled()
        assert len(mgr._pending) == 0


class TestSendEvent:
    @pytest.mark.asyncio
    async def test_send_event_sends_json(self, mgr):
        ws = AsyncMock()
        await mgr.connect(ws)
        await mgr.send_event("chat_response", {"text": "hi"})
        ws.send_json.assert_awaited_once_with({
            "type": "event",
            "event": "chat_response",
            "data": {"text": "hi"},
        })

    @pytest.mark.asyncio
    async def test_send_event_no_connection_raises(self, mgr):
        with pytest.raises(RuntimeError, match="No frontend connected"):
            await mgr.send_event("test", {})


class TestRequestFromFrontend:
    @pytest.mark.asyncio
    async def test_request_sends_command_and_resolves(self, mgr):
        ws = AsyncMock()
        await mgr.connect(ws)

        async def simulate_response():
            await asyncio.sleep(0.01)
            call_args = ws.send_json.call_args[0][0]
            msg_id = call_args["id"]
            mgr.resolve(msg_id, {"code": "s('bd')"})

        task = asyncio.create_task(simulate_response())
        result = await mgr.request_from_frontend("read_code")
        await task

        assert result == {"code": "s('bd')"}
        sent = ws.send_json.call_args[0][0]
        assert sent["type"] == "command"
        assert sent["action"] == "read_code"

    @pytest.mark.asyncio
    async def test_request_no_connection_raises(self, mgr):
        with pytest.raises(RuntimeError, match="No frontend connected"):
            await mgr.request_from_frontend("read_code")

    @pytest.mark.asyncio
    async def test_request_timeout(self, mgr):
        ws = AsyncMock()
        await mgr.connect(ws)
        with pytest.raises(asyncio.TimeoutError):
            await asyncio.wait_for(
                mgr.request_from_frontend("read_code"), timeout=0.1
            )


class TestResolve:
    @pytest.mark.asyncio
    async def test_resolve_sets_future_result(self, mgr):
        future = asyncio.get_event_loop().create_future()
        mgr._pending["msg1"] = future
        mgr.resolve("msg1", {"ok": True})
        assert future.result() == {"ok": True}

    @pytest.mark.asyncio
    async def test_resolve_unknown_id_is_noop(self, mgr):
        mgr.resolve("nonexistent", {"data": 1})  # should not raise

    @pytest.mark.asyncio
    async def test_resolve_already_done_future_is_noop(self, mgr):
        future = asyncio.get_event_loop().create_future()
        future.set_result({"first": True})
        mgr._pending["msg1"] = future
        mgr.resolve("msg1", {"second": True})  # should not raise
        assert future.result() == {"first": True}
