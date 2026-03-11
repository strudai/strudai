import asyncio

from duckduckgo_search import DDGS
from pydantic import BaseModel

from backend.tools.registry import registry


class WebSearchParams(BaseModel):
    query: str


@registry.tool(
    name="web_search",
    description="Search the web for Strudel documentation, examples, or music/coding references.",
    params_model=WebSearchParams,
)
async def web_search(params: WebSearchParams) -> dict:
    def _search():
        with DDGS() as ddgs:
            return list(ddgs.text(params.query, max_results=5))

    results = await asyncio.to_thread(_search)
    return {
        "results": [
            {"title": r["title"], "href": r["href"], "body": r["body"]}
            for r in results
        ]
    }
