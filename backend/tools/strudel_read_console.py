from backend.tools.registry import registry
from backend.ws import manager


@registry.tool(
    name="strudel_read_console",
    description="Read and drain the console log buffer from the frontend.",
)
async def strudel_read_console() -> dict:
    resp = await manager.request_from_frontend("read_console")
    return resp
