from backend.skills import compose
from backend.agents import CHAT_SKILLS


class TestChatPromptComposition:
    def test_composed_prompt_has_persona(self):
        _, prompt = compose(*CHAT_SKILLS)
        assert "Hans Strudel" in prompt

    def test_composed_prompt_no_emojis_rule(self):
        _, prompt = compose(*CHAT_SKILLS)
        assert "Do not use emojis" in prompt

    def test_composed_prompt_plain_text_rule(self):
        _, prompt = compose(*CHAT_SKILLS)
        assert "Do not use bold" in prompt

    def test_composed_prompt_has_all_tools(self):
        tool_names, _ = compose(*CHAT_SKILLS)
        expected = {
            "strudel_read_code", "strudel_edit_code", "strudel_rewrite_code",
            "strudel_read_console", "strudel_docs_search", "web_search",
            "sample_search", "plan_set", "start_set", "stop_set",
            "strudel_read_cycle",
        }
        assert tool_names == expected
