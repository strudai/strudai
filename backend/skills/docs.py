"""Documentation skill — search Strudel docs and the web."""

from backend.skills.base import Skill

docs = Skill(
    name="docs",
    description="Search Strudel documentation and the web",
    tools=frozenset({"strudel_docs_search", "web_search"}),
    prompt=(
        "Tools for documentation:\n"
        "- strudel_docs_search — search the official Strudel documentation\n"
        "- web_search — look up general references\n\n"
        "Use strudel_docs_search whenever you need more context on a function, "
        "effect, or technique — even if you think you know how it works.\n\n"
        "Use web_search if the documentation doesn't have the answer, or to find "
        "musical resources, but be specific in your query to avoid information overload."
    ),
    priority=30,
)
