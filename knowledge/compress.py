"""Compress knowledge markdown files into a brief reference for the agent.

Usage:
    python knowledge/compress.py

Requires: ANTHROPIC_API_KEY env var, pip install anthropic python-dotenv
"""

import os
from pathlib import Path

import anthropic
from dotenv import load_dotenv

KNOWLEDGE_DIR = Path(__file__).resolve().parent
RAW_DIR = KNOWLEDGE_DIR / "raw"
OUTPUT_FILE = KNOWLEDGE_DIR / "compressed.md"
EXAMPLES_FILE = "examples.md"

COMPRESS_PROMPT = """\
You are compressing Strudel live-coding documentation and examples into a \
concise reference that an AI coding assistant will use at startup to write \
Strudel code.

You will receive two sections: DOCUMENTATION (API docs) and EXAMPLES (real \
community code). Produce a single reference with two clearly labeled parts:

## Part 1: API Reference
Compress the documentation into a dense cheat sheet. Rules:
- Do NOT use markdown tables — they waste tokens on | separators and divider rows.
- Use compact formats instead: `func(args)` — description, or grouped bullet lists.
- Group related items on single lines where possible, e.g.: \
`lpf(freq)` `hpf(freq)` `delay(amt)` `room(amt)` `gain(lvl)` — audio effects
- Cover: mini-notation syntax, core functions (sound, note, n, s, stack, cat, \
seq, arrange, silence), effects, modifiers (slow, fast, rev, jux, etc.), \
samples/synths, and tonal helpers (scale, scaleTranspose).
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

## Part 3: Genre Sketches
Provide minimal style sketches for these genres: ambient, house, techno, \
dnb, hip-hop, breakbeat, dub, synthwave, idm, minimal.
For each genre, write:
- The genre name as a heading
- 1-2 sentences on the key characteristics (tempo, rhythmic feel, typical sounds)
- One short code snippet (2-6 lines) showing a representative pattern
Keep each genre sketch compact — this is a quick reference, not a tutorial.

General rules:
- Output ONLY the compressed reference, no preamble or explanation.
- Target ~10000 tokens total (~2000 API reference, ~4000 style guide, ~4000 genre sketches).
- Use ```strudel``` fenced blocks for code examples.
"""


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

    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=12000,
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
