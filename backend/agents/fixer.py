"""Error fixer agent — diagnoses and fixes Strudel console errors."""

import logging
import time

from langgraph.checkpoint.memory import MemorySaver

from backend.agents.base import build_graph, stream_events
from backend.prompts import render

logger = logging.getLogger(__name__)

memory = MemorySaver()

FIXER_TOOLS = {
    "strudel_read_code",
    "strudel_edit_code",
    "strudel_read_console",
    "strudel_docs_search",
    "sample_search",
}

# Infinite-loop prevention state
_attempt_count: int = 0
_last_errors: set[str] = set()
_last_run_time: float = 0.0
_MAX_ATTEMPTS = 3
_COOLDOWN_SECONDS = 5.0


def reset_fixer_state() -> None:
    """Reset all loop-prevention state (called when fixer is disabled)."""
    global _attempt_count, _last_errors, _last_run_time
    _attempt_count = 0
    _last_errors = set()
    _last_run_time = 0.0


async def fixer_respond(
    errors: list[str],
    session_id: str,
    *,
    api_key: str,
    on_event=None,
    model: str,
) -> str:
    """Run the fixer agent on a batch of console errors.

    Returns empty string if skipped due to loop prevention.
    """
    global _attempt_count, _last_errors, _last_run_time

    # Cooldown check
    now = time.monotonic()
    if now - _last_run_time < _COOLDOWN_SECONDS:
        logger.info("Fixer skipped — cooldown active (%.1fs remaining)",
                     _COOLDOWN_SECONDS - (now - _last_run_time))
        return ""

    # Dedup check
    error_set = set(errors)
    if error_set == _last_errors:
        _attempt_count += 1
        if _attempt_count >= _MAX_ATTEMPTS:
            logger.warning("Fixer giving up after %d attempts on the same errors", _MAX_ATTEMPTS)
            return ""
    else:
        _attempt_count = 1
        _last_errors = error_set

    # Build the instruction message
    error_lines = "\n".join(f"- {e}" for e in errors)
    instruction = (
        f"The following errors appeared in the Strudel console:\n\n"
        f"{error_lines}\n\n"
        f"Read the current code, diagnose the issue, and fix it."
    )

    system_prompt = render("fixer.j2")

    agent = build_graph(
        model=model,
        api_key=api_key,
        system_prompt=system_prompt,
        node_name="fix",
        tool_names=FIXER_TOOLS,
        checkpointer=memory,
    )

    result = await stream_events(agent, instruction, session_id, on_event=on_event)
    _last_run_time = time.monotonic()
    return result
