import os
from functools import lru_cache

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import SystemMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode

from backend.knowledge.compress import OUTPUT_FILE as KNOWLEDGE_FILE
from backend.prompts import render
from backend.tools.registry import registry

memory = MemorySaver()


def _should_continue(state: MessagesState) -> str:
    last = state["messages"][-1]
    if hasattr(last, "tool_calls") and last.tool_calls:
        return "tools"
    return END


@lru_cache(maxsize=1)
def _build_agent():
    tools = registry.to_langchain_tools()

    llm = ChatAnthropic(
        model="claude-sonnet-4-6",
        api_key=os.environ["CLAUDE_API_KEY"],
    ).bind_tools(tools)

    knowledge = KNOWLEDGE_FILE.read_text() if KNOWLEDGE_FILE.exists() else ""
    system_prompt = render("system.j2", knowledge=knowledge)
    print("System prompt:", system_prompt)

    async def chat(state: MessagesState) -> MessagesState:
        messages = [SystemMessage(content=system_prompt), *state["messages"]]
        response = await llm.ainvoke(messages)
        return {"messages": [response]}

    tool_node = ToolNode(tools)

    graph = StateGraph(MessagesState)
    graph.add_node("chat", chat)
    graph.add_node("tools", tool_node)
    graph.set_entry_point("chat")
    graph.add_conditional_edges("chat", _should_continue, {"tools": "tools", END: END})
    graph.add_edge("tools", "chat")
    return graph.compile(checkpointer=memory)


async def agent_respond(text: str, session_id: str, on_event=None) -> str:
    """Run the agent and stream events via the on_event callback.

    on_event is called with (event_type, data) where event_type is one of:
    - "thinking": agent is processing (no tool calls yet)
    - "tool_call": agent is invoking a tool, data = {"tool": name, "input": args}
    - "tool_result": tool finished, data = {"tool": name, "output": result}
    """
    agent = _build_agent()
    config = {"configurable": {"thread_id": session_id}}

    if on_event:
        await on_event("thinking", {})

    final_content = ""
    async for event in agent.astream_events(
        {"messages": [("human", text)]}, config=config, version="v2"
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
            # data is a dict {"output": ToolMessage(...)} in v2
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
                # content can be a string or a list of content blocks
                if isinstance(content, list):
                    final_content = "".join(
                        block.get("text", "") if isinstance(block, dict) else str(block)
                        for block in content
                    )
                else:
                    final_content = content

    return final_content
