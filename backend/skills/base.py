"""Skill dataclass — the core unit of agent capability."""

from dataclasses import dataclass, field


@dataclass(frozen=True)
class Skill:
    """A composable unit of agent capability.

    A skill bundles a tool subset, a prompt fragment, and optional
    knowledge/examples into a single declarative unit.  Skills are
    composed at agent-construction time — they carry no runtime state.
    """

    name: str
    description: str
    tools: frozenset[str] = field(default_factory=frozenset)
    prompt: str = ""
    knowledge: str = ""
    priority: int = 50  # lower = earlier in composed prompt
