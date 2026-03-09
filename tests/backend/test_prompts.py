from backend.prompts import render


class TestPromptRendering:
    def test_system_prompt_renders(self):
        tools = [
            {"name": "read_code", "description": "Read code"},
            {"name": "update_code", "description": "Update code"},
        ]
        result = render("system.j2", tools=tools, workshop_content="")
        assert "StrudelGPT" in result
        assert "read_code" in result
        assert "update_code" in result

    def test_system_prompt_includes_tool_descriptions(self):
        tools = [{"name": "my_tool", "description": "Does something cool"}]
        result = render("system.j2", tools=tools, workshop_content="")
        assert "my_tool: Does something cool" in result

    def test_system_prompt_no_tools(self):
        result = render("system.j2", tools=[], workshop_content="")
        assert "StrudelGPT" in result

    def test_system_prompt_includes_workshop_content(self):
        tools = [{"name": "t", "description": "d"}]
        workshop = "## Mini Notation\n\nSequences use spaces."
        result = render("system.j2", tools=tools, workshop_content=workshop)
        assert "## Mini Notation" in result
        assert "Sequences use spaces." in result
        assert "Strudel Reference" in result
