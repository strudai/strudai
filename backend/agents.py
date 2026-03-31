"""Agent runner — builds LangGraph agents from skill compositions."""

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import SystemMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode

from backend.knowledge.compress import OUTPUT_FILE as KNOWLEDGE_FILE
from backend.usage import estimate_cost
from backend.skills import compose
from backend.skills.base import Skill
from backend.skills.coding import coding, rewriting
from backend.skills.debugging import debugging
from backend.skills.docs import docs
from backend.skills.fixing import fixing
from backend.skills.genres import get_genre
from backend.skills.performing import performing, performing_new_song
from backend.skills.persona import hans
from backend.skills.samples import samples
from backend.skills.set_planning import set_planning
from backend.tools.registry import registry

AVAILABLE_MODELS = [
    "claude-haiku-4-5-20251001",
    "claude-sonnet-4-6",
    "claude-opus-4-6",
]

DEFAULT_MODEL = "claude-haiku-4-5-20251001"

CHAT_SKILLS = [hans, coding, rewriting, debugging, docs, samples, set_planning]
PERFORMER_SKILLS = [performing, coding, debugging, docs, samples]
FIXER_SKILLS = [fixing, coding, docs, samples]

_memory = MemorySaver()


async def run(
    skills: list[Skill],
    text: str,
    session_id: str,
    *,
    api_key: str,
    model: str = DEFAULT_MODEL,
    context: str = "",
    node_name: str = "agent",
    on_event=None,
) -> str:
    """Compose skills into an agent and run it.

    Args:
        skills: Skills to compose into the agent.
        text: The user/instruction message.
        session_id: Thread ID for conversation memory.
        api_key: Anthropic API key.
        model: Claude model identifier.
        context: Optional text prepended to the system prompt.
        node_name: Name for the LLM node in the graph.
        on_event: Callback for streaming events (tool_call, tool_result, etc).
    """
    tool_names, prompt_body = compose(*skills)
    system_prompt = f"{context}\n\n{prompt_body}".strip() if context else prompt_body

    tools = registry.to_langchain_tools(include=tool_names)
    llm = ChatAnthropic(model=model, api_key=api_key).bind_tools(tools)

    async def invoke(state: MessagesState) -> MessagesState:
        messages = [SystemMessage(content=system_prompt), *state["messages"]]
        response = await llm.ainvoke(messages)
        return {"messages": [response]}

    def should_continue(state: MessagesState) -> str:
        last = state["messages"][-1]
        if hasattr(last, "tool_calls") and last.tool_calls:
            return "tools"
        return END

    graph = StateGraph(MessagesState)
    graph.add_node(node_name, invoke)
    graph.add_node("tools", ToolNode(tools))
    graph.set_entry_point(node_name)
    graph.add_conditional_edges(node_name, should_continue, {"tools": "tools", END: END})
    graph.add_edge("tools", node_name)
    agent = graph.compile(checkpointer=_memory)

    return await _stream(agent, text, session_id, model=model, on_event=on_event)


# --- Convenience wrappers for app.py ---


async def chat_respond(
    text: str, session_id: str, *, api_key: str, model: str = DEFAULT_MODEL, on_event=None
) -> str:
    """Run the Hans Strudel chat agent."""
    knowledge = KNOWLEDGE_FILE.read_text() if KNOWLEDGE_FILE.exists() else ""
    context = f"Strudel quick reference:\n{knowledge}" if knowledge else ""

    if on_event:
        await on_event("thinking", {})

    return await run(
        CHAT_SKILLS, text, session_id,
        api_key=api_key, model=model, context=context, node_name="chat", on_event=on_event,
    )


async def performer_respond(
    instruction: str, session_id: str, *, api_key: str, model: str, prompt_vars: dict, on_event=None
) -> str:
    """Run the performer agent for a set section."""
    skills = list(PERFORMER_SKILLS)
    if prompt_vars.get("is_new_song"):
        skills.append(performing_new_song)
    genre_skill = get_genre(prompt_vars.get("genre", ""))
    if genre_skill:
        skills.append(genre_skill)

    lines = [f"Set: {prompt_vars['title']} — {prompt_vars['genre']} @ {prompt_vars['bpm']} bpm"]
    if prompt_vars.get("instructions"):
        lines.append(f"Overall instructions: {prompt_vars['instructions']}")
    if prompt_vars.get("song_name"):
        lines.append(f"Current song: {prompt_vars['song_name']}")
    if prompt_vars.get("song_description"):
        lines.append(f"Description: {prompt_vars['song_description']}")
    if prompt_vars.get("foundation"):
        lines.append(f"Foundation: {prompt_vars['foundation']}")

    return await run(
        skills, instruction, session_id,
        api_key=api_key, model=model, context="\n".join(lines), node_name="act", on_event=on_event,
    )


async def fixer_respond(
    errors: list[str], session_id: str, *, api_key: str, model: str, on_event=None
) -> str:
    """Run the fixer agent on console errors."""
    error_lines = "\n".join(f"- {e}" for e in errors)
    instruction = (
        f"The following errors appeared in the Strudel console:\n\n"
        f"{error_lines}\n\n"
        f"Read the current code, diagnose the issue, and fix it."
    )
    return await run(
        FIXER_SKILLS, instruction, session_id,
        api_key=api_key, model=model, node_name="fix", on_event=on_event,
    )


# --- Event streaming ---


async def _stream(agent, text: str, session_id: str, *, model: str = "", on_event=None) -> str:
    """Run an agent and stream tool events via callback. Returns final text."""
    config = {"configurable": {"thread_id": session_id}}
    final_content = ""
    total_input = 0
    total_output = 0

    async for event in agent.astream_events(
        {"messages": [("human", text)]}, config=config, version="v2"
    ):
        kind = event["event"]

        if kind == "on_chat_model_end":
            msg = event["data"]["output"]
            usage = getattr(msg, "usage_metadata", None)
            if usage:
                total_input += usage.get("input_tokens", 0)
                total_output += usage.get("output_tokens", 0)
            if hasattr(msg, "tool_calls") and msg.tool_calls and on_event:
                for tc in msg.tool_calls:
                    await on_event("tool_call", {"tool": tc["name"], "input": tc["args"]})

        elif kind == "on_tool_end" and on_event:
            data = event["data"]
            tool_msg = data.get("output", data) if isinstance(data, dict) else data
            output = getattr(tool_msg, "content", None) or str(tool_msg)
            await on_event("tool_result", {"tool": event["name"], "output": output})

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

    if on_event and (total_input or total_output):
        cost = estimate_cost(model, total_input, total_output)
        await on_event("usage", {
            "input_tokens": total_input,
            "output_tokens": total_output,
            **({"cost": cost} if cost is not None else {}),
        })

    return final_content
