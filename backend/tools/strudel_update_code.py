from pydantic import BaseModel

from backend.tools.registry import registry
from backend.ws import manager


class UpdateCodeParams(BaseModel):
    code: str


@registry.tool(
    name="strudel_update_code",
    description="Update the Strudel editor code and evaluate it.",
    params_model=UpdateCodeParams,
)
async def strudel_update_code(params: UpdateCodeParams) -> dict:
    resp = await manager.request_from_frontend("update_code", {"code": params.code})
    return resp
