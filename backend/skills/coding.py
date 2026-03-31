"""Coding skill — read and modify Strudel code in the editor."""

from backend.skills.base import Skill

coding = Skill(
    name="coding",
    description="Read and edit Strudel code in the editor",
    tools=frozenset({
        "strudel_read_code",
        "strudel_edit_code",
    }),
    prompt=(
        "Tools for code:\n"
        "- strudel_read_code — see what's currently in the editor\n"
        "- strudel_edit_code — change a specific part of the code "
        "(search-and-replace). Preferred for modifications."
    ),
    priority=20,
)

rewriting = Skill(
    name="rewriting",
    description="Full code rewrite capability",
    tools=frozenset({"strudel_rewrite_code"}),
    prompt=(
        "- strudel_rewrite_code — replace the entire editor code. "
        "Use only when writing from scratch or rewriting most of the code.\n\n"
        "When modifying existing code, prefer strudel_edit_code over "
        "strudel_rewrite_code. Only rewrite when most of the code needs to change."
    ),
    priority=21,
)
