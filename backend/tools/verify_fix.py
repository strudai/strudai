"""Wait for Strudel to compile, then read the console to check for errors."""

import asyncio

from backend.tools.registry import registry
from backend.connection import manager

COMPILE_WAIT = 3  # seconds


@registry.tool(
    name="strudel_verify_fix",
    description=(
        "Wait a few seconds for Strudel to compile the edited code, "
        "then read the console. Use this after making a fix to check "
        "if errors are resolved. Do not use strudel_read_console for "
        "verification — use this instead."
    ),
)
async def strudel_verify_fix() -> dict:
    await asyncio.sleep(COMPILE_WAIT)
    resp = await manager.request_from_frontend("read_console")
    return resp
