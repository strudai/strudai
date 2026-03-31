"""Sample search skill — find sample packs and sounds."""

from backend.skills.base import Skill

samples = Skill(
    name="samples",
    description="Find sample packs and sounds by name",
    tools=frozenset({"sample_search"}),
    prompt=(
        "Tools for samples:\n"
        "- sample_search — find sample packs and sounds by name"
    ),
    priority=30,
)
