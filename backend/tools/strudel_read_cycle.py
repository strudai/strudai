from backend.tools.registry import registry
from backend.ws import manager


@registry.tool(
    name="strudel_read_cycle",
    description="Read the current cycle position during a live set. Returns the cycle number, CPS, and elapsed seconds since the set started. Returns cycle -1 if no set is running.",
)
async def strudel_read_cycle() -> dict:
    return await manager.request_from_frontend("read_cycle")
