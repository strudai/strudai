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
        with urllib.request.urlopen(INDEX_URL) as resp:
            _cache = json.loads(resp.read().decode())
    return _cache


class SampleSearchParams(BaseModel):
    query: str


@registry.tool(
    name="sample_search",
    description=(
        "Search Strudel sample packs by pack name or sound name. "
        "Returns matching packs and their available sounds."
    ),
    params_model=SampleSearchParams,
)
async def sample_search(params: SampleSearchParams) -> dict:
    index = await asyncio.to_thread(_fetch_index)
    q = params.query.lower()

    matches: list[dict] = []
    for pack in index:
        name = pack["name"].lower()
        samples = pack["samples"]
        matching_samples = [s for s in samples if q in s.lower()]

        if q in name:
            matches.append({
                "pack": pack["name"],
                "sounds": samples,
                "builtin": pack.get("builtin", False),
            })
        elif matching_samples:
            matches.append({
                "pack": pack["name"],
                "sounds": matching_samples,
                "builtin": pack.get("builtin", False),
            })

    return {"query": params.query, "results": matches[:10]}
