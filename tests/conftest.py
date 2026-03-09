import asyncio
from unittest.mock import AsyncMock, MagicMock

import pytest

from backend.tools.registry import ToolRegistry
from backend.ws import ConnectionManager


@pytest.fixture
def registry():
    return ToolRegistry()


@pytest.fixture
def manager():
    return ConnectionManager()


@pytest.fixture
def connected_manager(manager):
    """A ConnectionManager with a mock WebSocket already connected."""
    ws = AsyncMock()
    ws.accept = AsyncMock()
    loop = asyncio.get_event_loop()
    loop.run_until_complete(manager.connect(ws))
    return manager
