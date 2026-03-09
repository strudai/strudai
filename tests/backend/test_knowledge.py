from backend.knowledge.fetch_workshop import clean_mdx


class TestCleanMdx:
    def test_strips_frontmatter(self):
        text = "---\ntitle: Test\nlayout: foo\n---\n# Hello\n"
        result = clean_mdx(text)
        assert "---" not in result
        assert "title:" not in result
        assert "# Hello" in result

    def test_strips_import_lines(self):
        text = "import { MiniRepl } from '@src/docs/MiniRepl';\nimport Box from '@components/Box.astro';\n# Content\n"
        result = clean_mdx(text)
        assert "import" not in result
        assert "# Content" in result

    def test_extracts_single_line_minirepl(self):
        text = '<MiniRepl client:visible tune={`sound("bd sd")`} />\n'
        result = clean_mdx(text)
        assert '```strudel\nsound("bd sd")\n```' in result
        assert "MiniRepl" not in result

    def test_extracts_multiline_minirepl(self):
        text = (
            "<MiniRepl\n"
            "  client:visible\n"
            '  tune={`setcpm(90/4)\n'
            'sound("bd hh")`}\n'
            "  punchcard\n"
            "/>\n"
        )
        result = clean_mdx(text)
        assert "```strudel\nsetcpm(90/4)\n" in result
        assert 'sound("bd hh")' in result
        assert "MiniRepl" not in result

    def test_table_minirepl_becomes_inline_code(self):
        text = '| sound | plays sound | <MiniRepl client:visible tune={`sound("bd")`} /> |\n'
        result = clean_mdx(text)
        assert '| sound | plays sound | `sound("bd")` |' in result
        assert "MiniRepl" not in result

    def test_table_minirepl_single_quote(self):
        text = "| $: | parallel | <MiniRepl client:visible tune={'$: s(\"bd\")'} /> |\n"
        result = clean_mdx(text)
        assert '`$: s("bd")`' in result
        assert "MiniRepl" not in result

    def test_strips_box_tags(self):
        text = "<Box>\nSome content\n</Box>\n"
        result = clean_mdx(text)
        assert "Some content" in result
        assert "<Box>" not in result
        assert "</Box>" not in result

    def test_strips_qa_tags(self):
        text = '<QA question="What?">\nAnswer here\n</QA>\n'
        result = clean_mdx(text)
        assert "Answer here" in result
        assert "QA" not in result

    def test_strips_img_tags(self):
        text = 'Before\n<img src="/img/test.png" />\nAfter\n'
        result = clean_mdx(text)
        assert "Before" in result
        assert "After" in result
        assert "<img" not in result

    def test_strips_a_tags_keeps_text(self):
        text = '<a href="https://example.com" target="_blank">click here</a>\n'
        result = clean_mdx(text)
        assert "click here" in result
        assert "<a " not in result
        assert "</a>" not in result

    def test_collapses_blank_lines(self):
        text = "Line 1\n\n\n\n\nLine 2\n"
        result = clean_mdx(text)
        assert "Line 1\n\nLine 2" in result
        assert "\n\n\n" not in result

    def test_removes_remaining_minirepl_tags(self):
        text = '<MiniRepl client:idle tunes={examples} />\n'
        result = clean_mdx(text)
        assert "MiniRepl" not in result
