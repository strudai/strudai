"""Compress knowledge markdown files into a brief reference for the agent.

Usage:
    uv run python -m backend.knowledge.compress
"""

import os

import anthropic
from dotenv import load_dotenv

from backend.knowledge import KNOWLEDGE_DIR, RAW_DIR

COMPRESS_PROMPT = """\
You are compressing Strudel live-coding documentation and examples into a \
concise reference that an AI coding assistant will use at startup to write \
Strudel code.

You will receive two sections: DOCUMENTATION (API docs) and EXAMPLES (real \
community code). Produce a single reference with two clearly labeled parts:

## Part 1: API Reference
Compress the documentation into a terse lookup table. Rules:
- Prefer tables and short bullet points over prose.
- Cover: mini-notation syntax, core functions (sound, note, n, s, stack, cat, \
seq, arrange, silence), effects (lpf, hpf, delay, room, gain, etc.), \
modifiers (slow, fast, rev, jux, etc.), samples/synths, and tonal helpers \
(scale, scaleTranspose).
- Drop: tutorial prose, motivation, setup instructions, FAQ, niche topics \
(CSound, Hydra, PWA, device motion, XEN).

## Part 2: Style Guide
Analyze the examples to extract idiomatic coding patterns. Rules:
- Identify recurring conventions: how code is structured, how parts are named \
and composed, method chaining style, pattern notation preferences.
- Show 3-5 short idiomatic snippets (max 4 lines each) that demonstrate the \
most common patterns — drums, bass, melody, arrangement.
- Note any consistent habits: use of let/const, stack() vs cat(), how effects \
are chained, how songs are arranged into sections.

General rules:
- Output ONLY the compressed reference, no preamble or explanation.
- Target ~2000 tokens total (~1200 API reference, ~800 style guide).
- Use ```strudel``` fenced blocks for code examples.
"""

OUTPUT_FILE = KNOWLEDGE_DIR / "compressed.md"

EXAMPLES_FILE = "examples.md"


def compress() -> str:
    """Read knowledge files, send to Claude for compression, return result."""
    docs: list[str] = []
    examples = ""
    for path in sorted(RAW_DIR.glob("*.md")):
        content = path.read_text()
        if path.name == EXAMPLES_FILE:
            examples = content
        else:
            docs.append(f"### {path.name}\n\n{content}")

    message = (
        "# DOCUMENTATION\n\n"
        + "\n\n---\n\n".join(docs)
        + "\n\n# EXAMPLES\n\n"
        + examples
    )

    client = anthropic.Anthropic(api_key=os.environ["CLAUDE_API_KEY"])
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=3000,
        system=COMPRESS_PROMPT,
        messages=[{"role": "user", "content": message}],
    )
    return response.content[0].text


def main() -> None:
    load_dotenv()
    print("Compressing knowledge files...")
    result = compress()
    OUTPUT_FILE.write_text(result)
    print(f"Wrote {OUTPUT_FILE} ({len(result)} chars)")


if __name__ == "__main__":
    main()
