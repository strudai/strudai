"""Skill composition — merge multiple skills into a tool set and prompt."""

from backend.skills.base import Skill


def compose(*skills: Skill) -> tuple[set[str], str]:
    """Compose multiple skills into a unified tool set and prompt.

    Returns (tool_names, system_prompt).
    Prompt fragments are ordered by priority (ascending).
    Knowledge blocks are appended at the end.
    """
    all_tools: set[str] = set()
    for skill in skills:
        all_tools |= skill.tools

    ordered = sorted(skills, key=lambda s: s.priority)

    sections: list[str] = []
    knowledge_parts: list[str] = []
    for skill in ordered:
        if skill.prompt:
            sections.append(skill.prompt)
        if skill.knowledge:
            knowledge_parts.append(skill.knowledge)

    prompt = "\n\n".join(sections)
    if knowledge_parts:
        prompt += "\n\n---\nReference examples:\n\n" + "\n\n".join(knowledge_parts)

    return all_tools, prompt
