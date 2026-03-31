"""Debugging skill — read console output for errors and logs."""

from backend.skills.base import Skill

debugging = Skill(
    name="debugging",
    description="Read console output for errors and logs",
    tools=frozenset({"strudel_read_console"}),
    prompt=(
        "Tools for debugging:\n"
        "- strudel_read_console — check for errors or logs"
    ),
    priority=25,
)
