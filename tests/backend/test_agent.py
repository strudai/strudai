import json
from unittest.mock import AsyncMock, patch

import pytest


class TestAgentToolWrappers:
    """Test that the LangChain @tool wrappers correctly call the registry."""

    @pytest.mark.asyncio
    async def test_strudel_read_code_wrapper(self):
        with patch("backend.agent.registry") as mock_reg:
            mock_reg.execute = AsyncMock(return_value={"code": "s('bd')"})
            from backend.agent import strudel_read_code

            result = await strudel_read_code.ainvoke({})
            mock_reg.execute.assert_awaited_once_with("strudel_read_code")
            assert json.loads(result) == {"code": "s('bd')"}

    @pytest.mark.asyncio
    async def test_strudel_update_code_wrapper(self):
        with patch("backend.agent.registry") as mock_reg:
            mock_reg.execute = AsyncMock(return_value={"ok": True})
            from backend.agent import strudel_update_code

            result = await strudel_update_code.ainvoke({"code": "s('hh')"})
            mock_reg.execute.assert_awaited_once_with(
                "strudel_update_code", {"code": "s('hh')"}
            )
            assert json.loads(result) == {"ok": True}

    @pytest.mark.asyncio
    async def test_strudel_read_console_wrapper(self):
        with patch("backend.agent.registry") as mock_reg:
            mock_reg.execute = AsyncMock(return_value={"logs": []})
            from backend.agent import strudel_read_console

            result = await strudel_read_console.ainvoke({})
            mock_reg.execute.assert_awaited_once_with("strudel_read_console")
            assert json.loads(result) == {"logs": []}
