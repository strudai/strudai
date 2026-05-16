"""Compress raw fetched docs/examples into concise references via Claude.

Usage:
    python prompts/compress.py             # compress both strudel + hydra
    python prompts/compress.py strudel     # only Strudel
    python prompts/compress.py hydra       # only Hydra

Requires: ANTHROPIC_API_KEY env var, pip install anthropic python-dotenv

The Anthropic free tier caps inputs at 30 000 tokens per minute. The raw docs
+ examples for Strudel alone are well over that, so the pipeline:
- truncates each per-call input to ~25k tokens (~100 KB),
- splits the Strudel compression into two calls (API ref + style guide),
- waits ~65s between calls so the rate-limit window has time to refresh.
"""

import os
import sys
import time
from pathlib import Path

import anthropic
from dotenv import load_dotenv

PROMPTS_DIR = Path(__file__).resolve().parent
RAW_DIR = PROMPTS_DIR / "raw"
HYDRA_RAW_DIR = RAW_DIR / "hydra"
STRUDEL_OUTPUT = PROMPTS_DIR / "strudel.md"
HYDRA_OUTPUT = PROMPTS_DIR / "hydra.md"
EXAMPLES_FILE = "examples.md"

MODEL = "claude-opus-4-7"
# ~25k tokens at 4 chars/token — comfortably under the 30k/min input cap.
MAX_INPUT_CHARS = 100_000
RATE_LIMIT_WAIT = 65  # seconds; one minute of grace for the input-token window

API_REF_PROMPT = """\
You are compressing Strudel live-coding documentation into a concise API \
cheat sheet for an AI coding assistant.

Rules:
- Do NOT use markdown tables — they waste tokens on | separators and divider rows.
- Use compact formats instead: `func(args)` — description, or grouped bullet lists.
- Group related items on single lines where possible, e.g.: \
`lpf(freq)` `hpf(freq)` `delay(amt)` `room(amt)` `gain(lvl)` — audio effects.
- Cover: mini-notation syntax, core functions (sound, note, n, s, stack, cat, \
seq, arrange, silence), effects, modifiers (slow, fast, rev, jux, etc.), \
samples/synths, and tonal helpers (scale, scaleTranspose).
- Drop: tutorial prose, motivation, setup instructions, FAQ, niche topics \
(CSound, Hydra, PWA, device motion, XEN).
- Output ONLY the cheat sheet, no preamble or explanation.
- Target ~2000 tokens.
- Use ```strudel``` fenced blocks for code examples.
"""

STYLE_GUIDE_PROMPT = """\
You are compressing real community Strudel patterns into an idiomatic style \
guide for an AI coding assistant.

Rules:
- Identify recurring conventions: how code is structured, how parts are named \
and composed, method chaining style, pattern notation preferences.
- Show 3-5 short idiomatic snippets (max 4 lines each) that demonstrate the \
most common patterns — drums, bass, melody, arrangement.
- Note any consistent habits: use of let/const, stack() vs cat(), how effects \
are chained, how songs are arranged into sections.
- Output ONLY the style guide, no preamble or explanation.
- Target ~3000 tokens.
- Use ```strudel``` fenced blocks for code examples.
"""

HYDRA_PROMPT = """\
You are compressing Hydra (live-coding visuals) documentation and examples \
into a concise reference for an AI coding assistant. The assistant writes \
Hydra code *inside Strudel* — Hydra visuals run in the same REPL alongside \
audio patterns.

You will receive three sections: STRUDEL_INTEGRATION (how Hydra is called \
from Strudel), HYDRA_DOCS (the official Hydra learning docs), and EXAMPLES \
(Hydra .js sketches). Produce a single reference with these parts:

## Part 1: Strudel Integration
Explain how to invoke Hydra from a Strudel pattern — the wrapper, audio \
reactivity bindings, anything Strudel-specific. Use the integration page as \
the primary source. 2-4 short snippets max.

## Part 2: API Reference
Compress the Hydra docs into a dense cheat sheet covering:
- Sources: `osc`, `noise`, `voronoi`, `shape`, `gradient`, `solid`, `src`
- Geometry transforms: `rotate`, `scale`, `pixelate`, `kaleid`, `repeat`, \
`scroll`, `posterize`
- Color transforms: `color`, `colorama`, `brightness`, `contrast`, `invert`, \
`luma`, `thresh`, `saturate`, `hue`, `shift`
- Blending: `add`, `sub`, `mult`, `diff`, `layer`, `mask`, `blend`
- Modulation: `modulate`, `modulateRotate`, `modulateScale`, `modulateRepeat`, \
`modulatePixelate`, `modulateHue`
- Outputs: `out`, `o0` `o1` `o2` `o3`, `render`
- External: `s0`, `initCam`, `initImage`, `initVideo`, `a` (audio in)
Format like `func(args)` — short description. Compact and dense, no tables.

## Part 3: Idiomatic Snippets
Show 4-6 short snippets (3-8 lines each) drawn from the examples that \
demonstrate common patterns — a basic oscillator, a kaleidoscope, audio-reactive \
modulation, layered sources, feedback loops.

## Part 4: Gotchas
A short bullet list of common mistakes (always call `.out()`, default output \
is `o0`, audio reactivity requires the right setup, etc.). 5-8 bullets.

General rules:
- Output ONLY the compressed reference, no preamble or explanation.
- Target ~5000 tokens total.
- Use ```hydra``` fenced blocks for code examples.
"""


def _truncate(text: str, limit: int = MAX_INPUT_CHARS) -> str:
    if len(text) <= limit:
        return text
    return text[:limit] + "\n\n[...truncated to stay under the input-token rate limit]"


def _compress(client: anthropic.Anthropic, system: str, user: str, max_tokens: int) -> str:
    response = client.messages.create(
        model=MODEL,
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": user}],
    )
    return response.content[0].text


def compress_strudel() -> str:
    """Compress Strudel raw docs + examples into a single reference.

    Runs two calls (API ref + style guide) with a delay between them to stay
    under the 30k input-tokens-per-minute rate limit.
    """
    docs: list[str] = []
    examples = ""
    for path in sorted(RAW_DIR.glob("*.md")):
        content = path.read_text()
        if path.name == EXAMPLES_FILE:
            examples = content
        else:
            docs.append(f"### {path.name}\n\n{content}")

    docs_text = _truncate("\n\n---\n\n".join(docs))
    examples_text = _truncate(examples)

    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

    print("  → call 1/2: API reference (from docs)")
    api_ref = _compress(
        client, API_REF_PROMPT, f"# DOCUMENTATION\n\n{docs_text}", max_tokens=3000
    )

    print(f"  → waiting {RATE_LIMIT_WAIT}s for the rate-limit window to refresh")
    time.sleep(RATE_LIMIT_WAIT)

    print("  → call 2/2: style guide (from examples)")
    style = _compress(
        client, STYLE_GUIDE_PROMPT, f"# EXAMPLES\n\n{examples_text}", max_tokens=4000
    )

    return (
        "## Part 1: API Reference\n\n"
        + api_ref.strip()
        + "\n\n## Part 2: Style Guide\n\n"
        + style.strip()
        + "\n"
    )


def compress_hydra() -> str:
    """Compress Hydra raw files into a single reference (one call)."""
    integration = (HYDRA_RAW_DIR / "strudel-integration.md").read_text()
    docs = _truncate((HYDRA_RAW_DIR / "learning.md").read_text())
    examples = (HYDRA_RAW_DIR / "examples.md").read_text()

    message = (
        "# STRUDEL_INTEGRATION\n\n"
        + integration
        + "\n\n# HYDRA_DOCS\n\n"
        + docs
        + "\n\n# EXAMPLES\n\n"
        + examples
    )

    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    return _compress(client, HYDRA_PROMPT, message, max_tokens=8000)


def main() -> None:
    load_dotenv()
    args = sys.argv[1:]
    run_strudel = not args or "strudel" in args
    run_hydra = not args or "hydra" in args

    if run_strudel:
        print("Compressing Strudel...")
        result = compress_strudel()
        STRUDEL_OUTPUT.write_text(result)
        print(f"Wrote {STRUDEL_OUTPUT} ({len(result)} chars)")

    if run_hydra:
        # If we already ran Strudel in this invocation, pause so the Hydra
        # call doesn't blow the same rate-limit window.
        if run_strudel:
            print(f"Waiting {RATE_LIMIT_WAIT}s before Hydra to respect rate limits")
            time.sleep(RATE_LIMIT_WAIT)
        print("Compressing Hydra...")
        result = compress_hydra()
        HYDRA_OUTPUT.write_text(result)
        print(f"Wrote {HYDRA_OUTPUT} ({len(result)} chars)")


if __name__ == "__main__":
    main()
