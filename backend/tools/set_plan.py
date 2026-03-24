from pydantic import BaseModel

from backend.tools.registry import registry
from backend.connection import manager


class Section(BaseModel):
    bar: int
    note: str


class Song(BaseModel):
    name: str
    bars: int
    description: str
    foundation: str
    sections: list[Section]


class SetPlanParams(BaseModel):
    title: str
    genre: str
    bpm: int
    instructions: str
    songs: list[Song]


# Module-level state: the current plan (used by start_set)
_current_plan: dict | None = None


@registry.tool(
    name="plan_set",
    description="Plan a full DJ set before performing it. Define the title, genre, BPM, overall instructions, and a list of songs with bar counts and section notes. The plan is sent to the frontend console and returned as confirmation.",
    params_model=SetPlanParams,
)
async def plan_set(params: SetPlanParams) -> dict:
    global _current_plan
    plan_dict = params.model_dump()
    _current_plan = plan_dict
    await manager.send_event("plan_set", plan_dict)
    return plan_dict


@registry.tool(
    name="start_set",
    description="Start a live set session. Begins cycle tracking and section announcements based on the current plan. Call plan_set first.",
)
async def start_set() -> dict:
    if _current_plan is None:
        return {"error": "No plan set. Call plan_set first."}
    bpm = _current_plan["bpm"]
    cps = bpm / 60 / 4  # 4 beats per cycle (bar)
    await manager.send_event("start_set", {
        "cps": cps,
        "bpm": bpm,
        "plan": _current_plan,
    })
    return {"status": "started", "bpm": bpm, "cps": cps, "plan": _current_plan}


def get_current_plan() -> dict | None:
    return _current_plan


@registry.tool(
    name="stop_set",
    description="Stop the current live set session. Stops cycle tracking.",
)
async def stop_set() -> dict:
    await manager.send_event("stop_set", {})
    return {"status": "stopped"}
