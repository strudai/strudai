import asyncio
import json
import urllib.request

from pydantic import BaseModel

from backend.tools.registry import registry

INDEX_URL = "https://strudel-samples.alternet.site/static/strudel_index.json"

_cache: list[dict] | None = None


def _fetch_index() -> list[dict]:
    global _cache
    if _cache is None:
        req = urllib.request.Request(INDEX_URL, headers={"User-Agent": "StrudelGPT"})
        with urllib.request.urlopen(req) as resp:
            _cache = json.loads(resp.read().decode())
    return _cache


class SampleSearchParams(BaseModel):
    query: str


USAGE_HINT = (
    'Load external packs with samples("github:user/repo") then use s("soundname"). '
    "Builtin sounds don't need loading — just use s(\"bd sd hh\"). "
    'Use :N for variants, e.g. s("sd:1").'
)


@registry.tool(
    name="sample_search",
    description=(
        "Search Strudel sample packs by pack name or sound name. "
        "Returns matching packs with their sounds and how to load them."
    ),
    params_model=SampleSearchParams,
)
async def sample_search(params: SampleSearchParams) -> dict:
    index = await asyncio.to_thread(_fetch_index)
    q = params.query.lower()

    matches: list[dict] = []
    for pack in index:
        name = pack.get("name", "").lower()
        samples = pack.get("samples", [])
        matching_samples = [s for s in samples if q in s.lower()]

        if q in name or matching_samples:
            entry: dict = {
                "pack": pack.get("name", ""),
                "sounds": samples if q in name else matching_samples,
                "builtin": pack.get("builtin", False),
            }
            if not entry["builtin"]:
                entry["load_with"] = f'samples("github:{pack.get("name", "")}")'
            matches.append(entry)

    return {"query": params.query, "results": matches[:10], "usage": USAGE_HINT}
