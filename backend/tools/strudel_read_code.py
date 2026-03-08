from backend.tools.registry import registry
from backend.ws import manager


@registry.tool(
    name="strudel_read_code",
    description="Read the current Strudel code from the editor.",
)
async def strudel_read_code() -> dict:
    resp = await manager.request_from_frontend("read_code")
    return resp
