import json
import os
from functools import lru_cache

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import SystemMessage
from langchain_core.tools import tool
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode

from backend.tools.registry import registry

SYSTEM_PROMPT = (
    "You are StrudelGPT, a helpful assistant for Strudel — a live coding music "
    "platform. You help users create, understand, and modify Strudel patterns. "
    "Keep responses concise and conversational. When sharing code, use Strudel's "
    "mini-notation and pattern syntax.\n\n"
    "You have tools to read and update the Strudel editor in the user's browser. "
    "Use strudel_read_code to see what's currently in the editor, "
    "strudel_update_code to write new code (this also evaluates it immediately), "
    "and strudel_read_console to check for errors or logs."
)

memory = MemorySaver()


@tool
async def strudel_read_code() -> str:
    """Read the current Strudel code from the editor."""
    result = await registry.execute("strudel_read_code")
    return json.dumps(result)


@tool
async def strudel_update_code(code: str) -> str:
    """Update the Strudel editor code and evaluate it. Pass the full Strudel pattern as the code parameter."""
    result = await registry.execute("strudel_update_code", {"code": code})
    return json.dumps(result)


@tool
async def strudel_read_console() -> str:
    """Read and drain the console log buffer from the frontend. Useful for checking errors after updating code."""
    result = await registry.execute("strudel_read_console")
    return json.dumps(result)


TOOLS = [strudel_read_code, strudel_update_code, strudel_read_console]


def _should_continue(state: MessagesState) -> str:
    last = state["messages"][-1]
    if hasattr(last, "tool_calls") and last.tool_calls:
        return "tools"
    return END


@lru_cache(maxsize=1)
def _build_agent():
    llm = ChatAnthropic(
        model="claude-sonnet-4-20250514",
        api_key=os.environ["CLAUDE_API_KEY"],
    ).bind_tools(TOOLS)

    async def chat(state: MessagesState) -> MessagesState:
        messages = [SystemMessage(content=SYSTEM_PROMPT), *state["messages"]]
        response = await llm.ainvoke(messages)
        return {"messages": [response]}

    tool_node = ToolNode(TOOLS)

    graph = StateGraph(MessagesState)
    graph.add_node("chat", chat)
    graph.add_node("tools", tool_node)
    graph.set_entry_point("chat")
    graph.add_conditional_edges("chat", _should_continue, {"tools": "tools", END: END})
    graph.add_edge("tools", "chat")
    return graph.compile(checkpointer=memory)


async def agent_respond(text: str, session_id: str) -> str:
    agent = _build_agent()
    config = {"configurable": {"thread_id": session_id}}
    result = await agent.ainvoke({"messages": [("human", text)]}, config=config)
    return result["messages"][-1].content
