import logging
import time

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import SystemMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode

from backend.prompts import render
from backend.tools.registry import registry

logger = logging.getLogger(__name__)

memory = MemorySaver()

FIXER_TOOLS = {
    "strudel_read_code",
    "strudel_edit_code",
    "strudel_rewrite_code",
    "strudel_read_console",
    "strudel_docs_search",
    "sample_search",
}

# Infinite-loop prevention state
_fixer_attempt_count: int = 0
_last_fixer_errors: set[str] = set()
_last_fixer_run_time: float = 0.0
_MAX_ATTEMPTS = 3
_COOLDOWN_SECONDS = 5.0


def reset_fixer_state() -> None:
    """Reset all loop-prevention state (called when fixer is disabled)."""
    global _fixer_attempt_count, _last_fixer_errors, _last_fixer_run_time
    _fixer_attempt_count = 0
    _last_fixer_errors = set()
    _last_fixer_run_time = 0.0


def _should_continue(state: MessagesState) -> str:
    last = state["messages"][-1]
    if hasattr(last, "tool_calls") and last.tool_calls:
        return "tools"
    return END


def _build_fixer(model: str, api_key: str):
    tools = registry.to_langchain_tools(include=FIXER_TOOLS)

    llm = ChatAnthropic(
        model=model,
        api_key=api_key,
    ).bind_tools(tools)

    system_prompt = render("fixer.j2")

    async def fix(state: MessagesState) -> MessagesState:
        messages = [SystemMessage(content=system_prompt), *state["messages"]]
        response = await llm.ainvoke(messages)
        return {"messages": [response]}

    tool_node = ToolNode(tools)

    graph = StateGraph(MessagesState)
    graph.add_node("fix", fix)
    graph.add_node("tools", tool_node)
    graph.set_entry_point("fix")
    graph.add_conditional_edges("fix", _should_continue, {"tools": "tools", END: END})
    graph.add_edge("tools", "fix")
    return graph.compile(checkpointer=memory)


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
    global _fixer_attempt_count, _last_fixer_errors, _last_fixer_run_time

    # Cooldown check
    now = time.monotonic()
    if now - _last_fixer_run_time < _COOLDOWN_SECONDS:
        logger.info("Fixer skipped — cooldown active (%.1fs remaining)",
                     _COOLDOWN_SECONDS - (now - _last_fixer_run_time))
        return ""

    # Dedup check
    error_set = set(errors)
    if error_set == _last_fixer_errors:
        _fixer_attempt_count += 1
        if _fixer_attempt_count >= _MAX_ATTEMPTS:
            logger.warning("Fixer giving up after %d attempts on the same errors", _MAX_ATTEMPTS)
            return ""
    else:
        _fixer_attempt_count = 1
        _last_fixer_errors = error_set

    # Build the instruction message
    error_lines = "\n".join(f"- {e}" for e in errors)
    instruction = (
        f"The following errors appeared in the Strudel console:\n\n"
        f"{error_lines}\n\n"
        f"Read the current code, diagnose the issue, and fix it."
    )

    agent = _build_fixer(model, api_key)
    config = {"configurable": {"thread_id": session_id}}

    final_content = ""
    async for event in agent.astream_events(
        {"messages": [("human", instruction)]}, config=config, version="v2"
    ):
        kind = event["event"]

        if kind == "on_chat_model_end":
            msg = event["data"]["output"]
            if hasattr(msg, "tool_calls") and msg.tool_calls and on_event:
                for tc in msg.tool_calls:
                    await on_event("tool_call", {
                        "tool": tc["name"],
                        "input": tc["args"],
                    })

        elif kind == "on_tool_end" and on_event:
            data = event["data"]
            tool_msg = data.get("output", data) if isinstance(data, dict) else data
            output = getattr(tool_msg, "content", None) or str(tool_msg)
            await on_event("tool_result", {
                "tool": event["name"],
                "output": output,
            })

        elif kind == "on_chain_end" and event["name"] == "LangGraph":
            messages = event["data"]["output"].get("messages", [])
            if messages:
                content = messages[-1].content
                if isinstance(content, list):
                    final_content = "".join(
                        block.get("text", "") if isinstance(block, dict) else str(block)
                        for block in content
                    )
                else:
                    final_content = content

    _last_fixer_run_time = time.monotonic()
    return final_content
